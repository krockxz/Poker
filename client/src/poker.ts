import { yourStack, currPot, currMoneyInBetting } from './state';
import $ from 'jquery';

$(document).ready(function () {
  const tabcontent = document.getElementsByClassName("tabcontent");
  if (tabcontent.length > 1) {
    (tabcontent[1] as HTMLElement).style.display = "none";
  }
});

(window as any).openCity = function (evt: Event, cityName: string): void {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    (tabcontent[i] as HTMLElement).style.display = "none";
  }
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  const cityElement = document.getElementById(cityName);
  if (cityElement) {
    cityElement.style.display = "block";
  }
  const currentTarget = evt.currentTarget as HTMLElement;
  currentTarget.className += " active";
};

(window as any).openOption = function (evt: Event, optName: string): void {
  const tabcontent = document.getElementsByClassName("tabcont");
  for (let i = 0; i < tabcontent.length; i++) {
    (tabcontent[i] as HTMLElement).style.display = "none";
  }
  const tablinks = document.getElementsByClassName("menuoptions");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  const optElement = document.getElementById(optName);
  if (optElement) {
    optElement.style.display = "block";
  }
  const currentTarget = evt.currentTarget as HTMLElement;
  currentTarget.className += " active";
};

// Slider and raise functionality
const slider = document.getElementById("myRange") as HTMLInputElement;
const raise = document.getElementById("raise") as HTMLInputElement;

if (slider && raise) {
  raise.value = slider.value;
  slider.max = String(yourStack + currMoneyInBetting);

  slider.oninput = function () {
    slider.max = String(yourStack + currMoneyInBetting);
    raise.value = (this as HTMLInputElement).value;
    console.log(`Money in: ${currMoneyInBetting}`);
    console.log(`stack: ${yourStack}`);
  };

  raise.oninput = function () {
    slider.value = String(Number((this as HTMLInputElement).value) + currMoneyInBetting);
  };
}

(window as any).quarterRaise = function (): void {
  if (raise) raise.value = String(Math.floor(currPot / 4));
  if (slider) slider.value = String(Math.floor(currPot / 4));
};

(window as any).halfRaise = function (): void {
  if (raise) raise.value = String(Math.floor(currPot / 2));
  if (slider) slider.value = String(Math.floor(currPot / 2));
};

(window as any).allInRaise = function (): void {
  if (raise) raise.value = String(yourStack);
  if (slider) slider.value = String(yourStack + currMoneyInBetting);
};

const qRaise = document.getElementById("quarterRaise");
if (qRaise) {
  qRaise.onclick = function () {
    (window as any).quarterRaise();
  };
}

const hRaise = document.getElementById("halfRaise");
if (hRaise) {
  hRaise.onclick = function () {
    (window as any).halfRaise();
  };
}

const aRaise = document.getElementById("allInRaise");
if (aRaise) {
  aRaise.onclick = function () {
    (window as any).allInRaise();
  };
};

// Menu handlers from inline script
$(document).ready(function () {
  $("#menu").click(function () {
    $("#popup").slideDown();
  });
  $(".destroy").click(function () {
    $("#popup").fadeOut();
  });
  $("#createGame").click(function (e) {
    e.preventDefault();
    $("#popup").fadeIn();
  });
  $("#checker").click(function () {
    $(".serverpassword").toggle();
  });
});

