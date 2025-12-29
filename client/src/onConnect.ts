// On connection, local storage will be checked to see if the lobby and username of the player is valid.
// If so, it will emit them to the server and correctly be put in the right game.

import { sock } from './index';

const storedLobby = localStorage.getItem('lobby');
const storedName = localStorage.getItem('name');

if (storedLobby != null && storedName != null) {
  sock.emit('test', `${storedName} joining lobby: ${storedLobby}`);

  // lobby, name, stacksize sent to server
  const newLobby = storedLobby;
  const newName = storedName;
  const newStack = localStorage.getItem('stacksize');

  console.log(newLobby);
  console.log(newName);
  console.log(newStack);

  const sendArr: (string | null)[] = [newLobby, newName, newStack];
  sock.emit('joinRoom', sendArr);

  sock.emit('test', `From Console: ${newName} successfully joined the lobby: ${newLobby}`);
}
