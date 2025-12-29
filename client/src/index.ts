// Global variables
import { Socket } from 'socket.io-client';
import $ from 'jquery';
import { sock } from './socket';
import {
  yourStack,
  currPot,
  currMoneyInBetting,
  username,
  setCurrPot
} from './state';
import {
  writeEvent,
  writeConsoleEvent,
  outputRoom,
  showBoard,
  sendAllIn,
  createPlayers,
  createListPlayers,
  playAudio,
  onFormSubmitted,
  startGame,
  sendCheck,
  sendCall,
  sendFold,
  sendRaise,
  updateHint
} from './functions';

declare global {
  interface Window {
    yourStack: number;
    currPot: number;
    currMoneyInBetting: number;
  }
}

// DOM Elements
const userList = document.getElementById('userList');
const roomName = document.getElementById('roomName');

// Socket event handlers
sock.on('goodJoin', () => {
  // Handle good join
});

sock.on('goodCreate', () => {
  // Handle good create
});

sock.on('message', (text: string) => {
  writeEvent(text);
});

sock.on('consoleLog', (text: string) => {
  writeConsoleEvent(text);
});

sock.on('roomUsers', ({ room, users, stacksizes }: {
  room: string;
  users: string[];
  stacksizes: number[];
}) => {
  outputRoom(room);
});

sock.on('gameBegun', () => {
  console.log("someone started a game!!!!");
  $("#generate").hide();
  updateHint("Game started. Dealing cards...");
});

sock.on('dealBoard', (arr: string[]) => {
  showBoard(arr);
  updateHint("New cards on board. Check your hand!");
});

sock.on('potSize', (num: number) => {
  const pot = document.querySelector("#potSize") as HTMLElement;
  if (pot) {
    pot.innerText = '';
    pot.innerText = `Pot Size: ${num}`;
    setCurrPot(num);
  }
});

sock.on('allIn', () => {
  sendAllIn();
});

// Timer variables
let timeOut: number | undefined;
let yourTurn = false;
const timer = document.getElementById("timer");
let timeRemainingOnScreen: number | undefined;

sock.on('yourTurn', (turnTime: number) => {
  const audio = new Audio('sounds/yourTurn.mp3');
  audio.play();
  let count = turnTime / 1000;

  timeRemainingOnScreen = window.setInterval(() => {
    count -= 1;
    if (timer) timer.innerText = count.toString();
  }, 1000);

  yourTurn = true;
  writeConsoleEvent(`You have ${turnTime / 1000} seconds to take your turn until folded`);
  updateHint("IT'S YOUR TURN! Check, Call, Raise or Fold.");
  timeOut = window.setTimeout(() => {
    sock.emit('playerTurn', "autoFold");
    writeConsoleEvent("Time has run out, you have been auto check/folded.");
    if (timeRemainingOnScreen) clearInterval(timeRemainingOnScreen);
    if (timer) timer.innerText = '';
    yourTurn = false;
  }, turnTime);
});

sock.on('validOption', () => {
  if (timeOut) clearTimeout(timeOut);
  if (timeRemainingOnScreen) clearInterval(timeRemainingOnScreen);
  if (timer) timer.innerText = '';
  yourTurn = false;
});

sock.on("roomPlayers", (roomPlayers: any[]) => {
  createPlayers(roomPlayers);
  createListPlayers(roomPlayers);
});

sock.on("audio", (audiotype: string) => {
  playAudio(audiotype);
});

// Event listeners
(document.querySelector("#chat-form") as HTMLFormElement)?.addEventListener('submit', onFormSubmitted);
(document.getElementById("generate") as HTMLElement)?.addEventListener('click', startGame);
(document.getElementById("checkbutton") as HTMLElement)?.addEventListener('click', sendCheck);
(document.getElementById("callbutton") as HTMLElement)?.addEventListener('click', sendCall);
(document.getElementById("foldbutton") as HTMLElement)?.addEventListener('click', sendFold);
(document.getElementById("raisebutton") as HTMLElement)?.addEventListener('click', sendRaise);
