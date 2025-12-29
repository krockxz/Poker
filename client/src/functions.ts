import { sock } from './index';
import $ from 'jquery';

// Global variables
export let yourStack: number = 0;
export let currPot: number = 0;
export let currMoneyInBetting: number = 0;
export let username: string | null = localStorage.getItem('name');

// Text writing functions
export function writeEvent(text: string): void {
  const parent = document.querySelector("#events");
  if (!parent) return;

  const el = document.createElement('li');
  el.innerHTML = text;
  parent.appendChild(el);

  const getChat = document.querySelector("#events");
  if (getChat) {
    getChat.scrollTop = getChat.scrollHeight;
  }
}

export function writeConsoleEvent(text: string): void {
  const parent = document.querySelector("#console");
  if (!parent) return;

  const el = document.createElement('li');
  el.innerHTML = text;
  parent.appendChild(el);

  const getChat = document.querySelector("#console");
  if (getChat) {
    getChat.scrollTop = getChat.scrollHeight;
  }
}

// Form submission
export function onFormSubmitted(e: Event): void {
  e.preventDefault();

  const input = document.querySelector("#chat") as HTMLInputElement;
  if (!input || !username) return;

  const text = input.value;
  input.value = '';
  sock.emit('message', `${username}: ${text}`);
}

// Start game
export function startGame(): void {
  console.log("You have started the game");
  sock.emit('startGame');
}

// Output room name
export function outputRoom(room: string): void {
  const roomNameEl = document.getElementById("roomName");
  if (roomNameEl) {
    roomNameEl.innerHTML = room;
  }
}

export function joinARoom(e: Event): void {
  e.preventDefault();
}

// Show board cards
export function showBoard(arr: string[]): void {
  const board = document.getElementById("theBoard");
  if (!board) return;

  ($("#theBoard") as any).empty();
  for (let i = 0; i < arr.length; i++) {
    const li = document.createElement('li');
    li.innerHTML = `<img class='boardCard' src='../img/${arr[i]}'></img>`;
    board.appendChild(li);
  }
}

// Player turn actions
export function sendCheck(e: Event): void {
  if ((window as any).yourTurn) {
    e.preventDefault();
    sock.emit('audio', "check");
    sock.emit('playerTurn', "check");
  } else {
    e.preventDefault();
    writeEvent("Not your turn");
  }
}

export function sendCall(e: Event): void {
  if ((window as any).yourTurn) {
    e.preventDefault();
    sock.emit('audio', "raise");
    sock.emit('playerTurn', "call");
  } else {
    e.preventDefault();
    writeEvent("Not your turn");
  }
}

export function sendFold(e: Event): void {
  if ((window as any).yourTurn) {
    e.preventDefault();
    sock.emit('audio', "fold");
    sock.emit('playerTurn', "fold");
  } else {
    e.preventDefault();
    writeEvent("Not your turn");
  }
}

export function sendRaise(e: Event): void {
  if ((window as any).yourTurn) {
    e.preventDefault();
    const raiseInput = document.querySelector("#raise") as HTMLInputElement;
    if (!raiseInput) return;
    const raiseVal = raiseInput.value;
    sock.emit('playerTurn', raiseVal);
  } else {
    e.preventDefault();
    writeEvent("Not your turn");
  }
}

export function sendAllIn(): void {
  sock.emit('playerTurn', "playerIsAllIn");
}

// Audio playback
export function playAudio(name: string): void {
  let audio: HTMLAudioElement | null = null;
  if (name === "yourTurn") {
    audio = new Audio('sounds/yourTurn.mp3');
  } else if (name === "check") {
    audio = new Audio('sounds/check.mp3');
  } else if (name === "raise") {
    audio = new Audio('sounds/raise.wav');
  } else {
    audio = new Audio('sounds/fold.wav');
  }
  audio.play();
}

// Player display functions
interface PlayerData {
  name: string;
  card1: string;
  card2: string;
  stack: number;
  moneyIn: number;
  valTurn: string;
  isTurn: boolean;
}

export function createPlayers(playerArr: any[]): void {
  const dealerIndex = playerArr.shift();
  console.log(dealerIndex);
  const playersList = document.getElementById("playersList");
  const yourIndex = { value: 0 };
  if (playersList) {
    playersList.innerHTML = "";
  }

  for (let j = 0; j < playerArr.length; j++) {
    const currPlayer = playerArr[j] as PlayerData;
    if (currPlayer.name === username) {
      yourIndex.value = j;
      const str1 = `img/${currPlayer.card1}`;
      const str2 = `img/${currPlayer.card2}`;
      const card1El = document.getElementById("card1") as HTMLImageElement;
      const card2El = document.getElementById("card2") as HTMLImageElement;
      if (card1El) card1El.src = str1;
      if (card2El) card2El.src = str2;

      const myPlayer = document.getElementById("myPlayer");
      if (myPlayer) {
        myPlayer.className = "";
        myPlayer.classList.add("dealer");
        myPlayer.classList.add("youGlow");
      }

      currMoneyInBetting = currPlayer.moneyIn;
      yourStack = currPlayer.stack;

      console.log(yourStack);
      const myName = document.getElementById("myName");
      const myStack = document.getElementById("myStack");
      const myMoneyInPot = document.getElementById("myMoneyInPot");
      if (myName) myName.innerText = currPlayer.name;
      if (myStack) myStack.innerText = currPlayer.stack.toString();
      if (myMoneyInPot) myMoneyInPot.innerText = currPlayer.moneyIn.toString();

      if (myPlayer && j !== dealerIndex) {
        myPlayer.classList.remove("dealer");
      }
      if (myPlayer && !currPlayer.isTurn) {
        myPlayer.classList.remove("youGlow");
      }
    }
  }

  for (let i = yourIndex.value + 1; i < playerArr.length; i++) {
    const currPlayer = playerArr[i] as PlayerData;
    appendPlayer(currPlayer, i, dealerIndex as number);
  }
  for (let i = 0; i < yourIndex.value; i++) {
    const currPlayer = playerArr[i] as PlayerData;
    appendPlayer(currPlayer, i, dealerIndex as number);
  }
}

function appendPlayer(currPlayer: PlayerData, i: number, dealerIndex: number): void {
  const playersList = document.getElementById("playersList");
  if (!playersList) return;

  let card1 = "img/blue_back.png";
  let card2 = "img/blue_back.png";

  console.log(currPlayer.valTurn);
  if (
    currPlayer.valTurn === "folded" ||
    currPlayer.valTurn === "autoFold" ||
    currPlayer.valTurn === "fold"
  ) {
    card1 = "img/folded_back.png";
    card2 = "img/folded_back.png";
  }

  const liElement = document.createElement('li');
  if (i === dealerIndex) {
    liElement.classList.add("dealer");
  }
  if (currPlayer.isTurn === true) {
    liElement.classList.add("glow");
  }
  liElement.classList.add("player");

  liElement.innerHTML = `<img class="leftTilt opponentCards" src="${card1}">`;
  liElement.innerHTML += `<img class="rightTilt opponentCards" src="${card2}"><div class="playerp"><span class="opponentName"> ${currPlayer.name}</span> <br> <span class="opponentStackSize">${currPlayer.stack}</span> </div> <span class="opponentMoneyInPot">${currPlayer.moneyIn}</span></div><img class="dealerchip" src="img/DEALER-CHIP.png">`;
  playersList.appendChild(liElement);
}

export function createListPlayers(playerArr: PlayerData[]): void {
  const playersList = document.getElementById("hostsList");
  if (!playersList) return;

  playersList.innerHTML = "";
  for (let i = 0; i < playerArr.length; i++) {
    const liElement = document.createElement('li');
    const currPlayer = playerArr[i];
    liElement.classList.add("menuPlayer");
    liElement.innerHTML = `<p class="popuptext"><span class="floatleft">${currPlayer.name}</span> <span class="floatright">`;
    liElement.innerHTML += '<button class="actionbuttons smallerfont">Kick</button>';
    liElement.innerHTML += '<button class="actionbuttons smallerfont">Make Host</button>';
    liElement.innerHTML += '<button class="actionbuttons smallerfont">Change Stack</button>';
    liElement.innerHTML += '<input class="innerinput smallerfont" autocomplete="off" type="number" title="newstack" /> </span></p>';
    playersList.appendChild(liElement);
  }
}
