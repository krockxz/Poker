import { sock } from './index';
import $ from 'jquery';

let username = '';
let stacksize = '';
let lobbyname = '';
let password = '';
let smallBlind = '';
let bigBlind = '';

// Submitting create and join requests to the server

$(document).ready(function () {
  $(".joinConnection").click(function (event: any) {
    event.preventDefault();

    username = ($("#username") as any).val();
    stacksize = ($("#stacksize") as any).val();
    lobbyname = ($("#lobbyname") as any).val();
    password = ($("#password") as any).val();

    sock.emit('joinAttempt', { username, stacksize, lobbyname, password });
  });

  $(".createConnection").click(function (event: any) {
    event.preventDefault();

    username = ($("#popupusername") as any).val();
    stacksize = ($("#popupstacksize") as any).val();
    lobbyname = ($("#popuplobbyname") as any).val();
    smallBlind = ($("#popupsmallblind") as any).val();
    bigBlind = ($("#popupbigblind") as any).val();
    password = ($("#popuppassword") as any).val();

    sock.emit('createAttempt', { username, stacksize, lobbyname, smallBlind, bigBlind, password });
  });
});

// Moving user to the next html page if their request to create or join a game was valid
sock.on('goodJoin', () => {
  localStorage.setItem('name', username);
  localStorage.setItem('lobby', lobbyname);
  localStorage.setItem('stacksize', stacksize);

  window.location.href = "/poker.html";
});

sock.on('goodCreate', () => {
  sock.emit('createRoom', { username, stacksize, lobbyname, smallBlind, bigBlind, password });
  sock.emit('test', `${username} successfully created the lobby: ${lobbyname} with password: ${password}`);

  localStorage.setItem('name', username);
  localStorage.setItem('lobby', lobbyname);
  localStorage.setItem('stacksize', stacksize);

  window.location.href = "/poker.html";
});

sock.on('badJoin', (text: string) => {
  alert(text);
});

sock.on('badCreate', (text: string) => {
  alert(text);
});


export { username, stacksize, lobbyname, password };
