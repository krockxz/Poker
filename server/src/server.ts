import http from 'http';
import express from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import path from 'path';
import { PokerGame } from './pokerGame';
import { Player } from './player';
import { setGetioFn } from './pokerHand';
import type { TurnValue } from './player';

const port = process.env.PORT || 8080;

// Setup Express app
const app = express();
const clientPath = path.join(__dirname, '../../client');
app.use(express.static(clientPath));

// Serve poker.html as the main page
app.get('/', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(clientPath, 'poker.html'));
});

const server = http.createServer(app);
const listOfPokerRooms: PokerGame[] = [];

const io = new SocketIOServer(server);

// Set up the getio function for pokerHand module
setGetioFn(() => io);

// Helper function to get game from socket ID
function getGameFromSockID(id: string): PokerGame | null {
  for (let i = 0; i < listOfPokerRooms.length; i++) {
    if (listOfPokerRooms[i].checkIfSockIDisInGame(id)) {
      return listOfPokerRooms[i];
    }
  }
  return null;
}

io.on('connection', (sock: Socket) => {
  console.log(`someone connected, sock ID is: ${sock.id}`);

  sock.on('test', (text: string) => {
    console.log(text);
  });

  sock.on('joinAttempt', ({ username, stacksize, lobbyname, password }: {
    username: string;
    stacksize: number;
    lobbyname: string;
    password: string;
  }) => {
    console.log(`${username} is attempting to join lobby: ${lobbyname}`);
    let gameFound = false;

    for (let i = 0; i < listOfPokerRooms.length; i++) {
      if (listOfPokerRooms[i].getGameID() === lobbyname) {
        gameFound = true;
        if (listOfPokerRooms[i].checkIfNameIsInGame(username)) {
          io.to(sock.id).emit('badJoin', 'Someone already is using this name');
        } else if (listOfPokerRooms[i].getPassword() !== password) {
          io.to(sock.id).emit('badJoin', `Incorrect password for the lobby: ${lobbyname}`);
        } else if (stacksize <= 0) {
          io.to(sock.id).emit('badJoin', 'Stack is less than 0, please try again');
        } else {
          io.to(sock.id).emit('goodJoin');
        }
      }
    }

    if (!gameFound) {
      console.log(`${username} attempted to join lobby: ${lobbyname}, but lobby was not found. :L`);
      io.to(sock.id).emit('badJoin', `Lobby with name: ${lobbyname} not found. :(`);
    }
  });

  sock.on('createAttempt', ({ username, stacksize, lobbyname, smallBlind, bigBlind, password }: {
    username: string;
    stacksize: number;
    lobbyname: string;
    smallBlind: number;
    bigBlind: number;
    password: string;
  }) => {
    let gameCreated = false;

    for (let i = 0; i < listOfPokerRooms.length; i++) {
      if (listOfPokerRooms[i].getGameID() === lobbyname) {
        gameCreated = true;
      }
    }

    if (gameCreated === true) {
      io.to(sock.id).emit('badCreate', `The lobby: ${lobbyname} has already been created`);
    } else if (stacksize <= 0) {
      io.to(sock.id).emit('badCreate', 'Invalid Default stack size, please try again');
    } else if (smallBlind > bigBlind) {
      io.to(sock.id).emit('badCreate', 'Invalid small/big blind set up');
    } else {
      io.to(sock.id).emit('goodCreate');
    }
  });

  sock.on('createRoom', ({ username, stacksize, lobbyname, smallBlind, bigBlind, password }: {
    username: string;
    stacksize: number;
    lobbyname: string;
    smallBlind: number;
    bigBlind: number;
    password: string;
  }) => {
    const theGame = new PokerGame(lobbyname);
    (theGame as any).smallBlind = Number(smallBlind);
    (theGame as any).bigBlind = Number(bigBlind);
    theGame.setPassword(password);
    (theGame as any).defaultStackSize = Number(stacksize);
    console.log(`New game created with ID: ${lobbyname}`);
    listOfPokerRooms.push(theGame);
  });

  sock.on('joinRoom', (arrLobbynameUserNameStackSize: [string, string, number]) => {
    const lobbyname = arrLobbynameUserNameStackSize[0];
    const username = arrLobbynameUserNameStackSize[1];
    const stacksize = Number(arrLobbynameUserNameStackSize[2]);

    let theGame: PokerGame | null = null;

    for (let i = 0; i < listOfPokerRooms.length; i++) {
      if (listOfPokerRooms[i].getGameID() === lobbyname) {
        theGame = listOfPokerRooms[i];
        console.log(`Found game: ${lobbyname}`);
      }
    }

    if (!theGame) {
      console.log(`Game ${lobbyname} not found`);
      return;
    }

    const user = new Player(username, stacksize, sock.id, lobbyname);

    console.log(`${username} joined: ${lobbyname}`);

    if (theGame.getBegun()) {
      sock.emit('gameBegun');
    }

    sock.join(user.getRoom());

    theGame.playerJoin(user);

    io.to(user.getRoom()).emit('roomUsers', {
      room: user.getRoom(),
      users: theGame.getAllNames(),
      stacksizes: theGame.getAllStackSizes()
    });
    io.to(theGame.getGameID()).emit('roomPlayers', theGame.emitPlayers());
    const currentUser = theGame.getCurrentUser(sock.id);
    if (currentUser) {
      io.to(user.getRoom()).emit('message', `${currentUser.getName()} is now spectating...`);
    }
  });

  sock.on('disconnect', () => {
    const theGame = getGameFromSockID(sock.id);
    if (theGame !== null) {
      const user = theGame.getCurrentUser(sock.id);
      if (user !== undefined && user !== null) {
        io.to(theGame.getGameID()).emit('message', `${user.getName()} has left the channel`);
        console.log(`${user.getName()} has left the channel`);
        theGame.playerLeave(sock.id);
        io.to(theGame.getGameID()).emit('roomPlayers', theGame.emitPlayers());
        io.to(user.getRoom()).emit('roomUsers', {
          room: user.getRoom(),
          users: theGame.getAllNames(),
          stacksizes: theGame.getAllStackSizes()
        });
      }
    }
  });

  sock.on('message', (text: string) => {
    const theGame = getGameFromSockID(sock.id);
    if (theGame) {
      io.to(theGame.getGameID()).emit('message', text);
    }
  });

  sock.on('audio', (name: string) => {
    const theGame = getGameFromSockID(sock.id);
    if (theGame) {
      io.to(theGame.getGameID()).emit('audio', name);
    }
  });

  sock.on('startGame', () => {
    let theGame: PokerGame | null = null;

    for (let i = 0; i < listOfPokerRooms.length; i++) {
      if (listOfPokerRooms[i].checkIfSockIDisInGame(sock.id)) {
        theGame = listOfPokerRooms[i];
        listOfPokerRooms[i].setBegun(true);
      }
    }

    if (!theGame) {
      console.log('Game not found for startGame');
      return;
    }

    console.log(`Someone has started the game in: ${theGame.getGameID()}`);
    io.to(theGame.getGameID()).emit('gameBegun');
    theGame.setBegun(true);

    const handOfPoker = theGame.newHand();
  });

  sock.on('playerTurn', (turnVariable: string | number) => {
    const turnVar = turnVariable;
    const theGame = getGameFromSockID(sock.id);

    if (!theGame) {
      console.log('Game not found for playerTurn');
      return;
    }

    const hand = theGame.returnHand();
    if (!hand) {
      console.log('Hand not found for playerTurn');
      return;
    }

    const player = hand.getCurrPlayer();

    // Convert turnVar to proper type
    const validTurnValue: TurnValue | number = typeof turnVar === 'string'
      ? (turnVar as TurnValue)
      : turnVar;

    if (hand.validOption(validTurnValue)) {
      io.to(player.getSock()).emit('validOption');
      player.setValTurn(validTurnValue as TurnValue);
      if (
        (player.getValTurn() === 'autoFold' && hand.getCurrBet() === 0) ||
        (player.getValTurn() === 'autoFold' && hand.getCurrBet() === player.getCurrMoneyInPot())
      ) {
        player.setValTurn('check');
      }
      console.log(`${player.getName()} has chosen action: ${player.getValTurn()}`);
      hand.playerTurn(validTurnValue as TurnValue | number);
    } else {
      sock.emit('invalidOption');
    }
  });
});

server.on('error', (err: Error) => {
  console.log('error: ', err);
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { io };
export default io;
