import { PokerGame } from './pokerGame';
import { Player } from './player';
import { HandEvaluator } from './handEvaluator';
import { Card } from './card';
import { Server, Socket } from 'socket.io';

interface EmitPlayersResult extends Array<number | PlayerInfo> {}

interface PlayerInfo {
  name: string;
  stack: number;
  moneyIn: number;
  card1: string;
  card2: string;
  valTurn: string;
  isShown1: boolean;
  isShown2: boolean;
  isStraddled: boolean;
  isTurn: boolean;
}

type TurnValue = "undefined" | "check" | "call" | "fold" | "autoFold" | "raise" | "playerIsAllIn";

// This will be imported from server.ts at runtime
let getioFn: (() => Server) | null = null;

export function setGetioFn(fn: () => Server): void {
  getioFn = fn;
}

export class PokerHand {
  private io: Server;
  private theGame: PokerGame;
  private communityCards: Card[];
  private playersInHand: Player[];
  private dealerIdx: number;
  private dealer: Player;
  private initialRaiser: Player | null;
  private currPlayer: Player;
  private moneyInPot: number;
  private currBet: number;
  private preflop: boolean;
  private handComplete: boolean;
  private flopDealt: boolean;
  private turnDealt: boolean;
  private riverDealt: boolean;
  private bigBlind: Player;

  constructor(game: PokerGame) {
    if (!getioFn) {
      throw new Error('getioFn not set. Call setGetioFn before creating PokerHand instance.');
    }
    this.io = getioFn();
    this.theGame = game;
    this.communityCards = [];
    this.playersInHand = this.theGame.getEligiblePlayers();
    this.dealerIdx = this.theGame.getDealerIdx() % this.playersInHand.length;
    this.dealer = this.getPlayers()[this.dealerIdx];
    this.bigBlind = this.getNextPlayer(this.getNextPlayer(this.dealer));
    this.initialRaiser = null;
    this.currPlayer = this.getNextPlayer(this.getNextPlayer(this.getNextPlayer(this.dealer)));
    this.moneyInPot = 0;
    this.currBet = 0;
    this.preflop = true;
    this.handComplete = false;
    this.flopDealt = false;
    this.turnDealt = false;
    this.riverDealt = false;

    this.runHand();
  }

  private runHand(): void {
    for (let i = 0; i < this.playersInHand.length; i++) {
      console.log(`${this.playersInHand[i].getName()} value is: ${this.playersInHand[i].getValTurn()}`);
    }

    if (this.playersInHand.length > 1) {
      console.log(`Curr money in pot is: ${this.moneyInPot}`);
      this.collectSmallBlind();
      this.collectBigBlind();
      this.currBet = this.theGame.getBB();
      this.theGame.shuffle();
      this.theGame.dealHands();
      this.emitEverything();

      this.initialRaiser = this.getNextPlayer(this.getNextPlayer(this.dealer));
      console.log(`Dealer is: ${this.dealer.getName()}`);
      this.updateHand();
    }
  }

  private updateHand(): void {
    console.log(`Current player is: ${this.getCurrPlayer().getName()}`);
    console.log(`Current player has: $${this.getCurrPlayer().getCurrMoneyInPot()} money in the pot currently`);
    this.emitEverything();

    if (this.getPlayers().length === 1) {
      this.io.to(this.theGame.getGameID()).emit('consoleLog', `${this.getPlayers()[0].getName()} has won the pot of: ${this.getPot()}`);
      this.io.to(this.theGame.getGameID()).emit('message', `${this.getPlayers()[0].getName()} has won the pot of: ${this.getPot()}`);
      this.getPlayers()[0].addToStack(this.moneyInPot);
      console.log("hand over");
      this.emitEverything();
      this.handComplete = true;
      this.io.to(this.theGame.getGameID()).emit('consoleLog', 'A new hand is starting in 5 seconds');
      this.theGame.clearGame();
      this.handComplete = true;
    }

    if (!this.handComplete) {
      if (this.checkIfPlayersLeftToAct()) {
        console.log("Keep on going more players need to act");
        this.io.to(this.theGame.getGameID()).emit('consoleLog', `It is ${this.getCurrPlayer().getName()}'s turn`);
        this.callTurnOnNextPlayer();
      } else {
        if (!this.flopDealt) {
          this.preflop = false;
          this.dealFlop();
          this.currBet = 0;
          this.currPlayer = this.getNextPlayer(this.dealer);
          this.initialRaiser = null;
          this.clearMoves();
          this.emitEverything();

          if (this.lessThanTwoCanPlay()) {
            const self = this;
            setTimeout(function () {
              self.callTurnOnNextPlayer();
            }, 2000);
          } else {
            this.callTurnOnNextPlayer();
          }
          this.flopDealt = true;
        } else if (!this.turnDealt) {
          this.dealTurn();
          this.currBet = 0;
          this.currPlayer = this.getNextPlayer(this.dealer);
          this.initialRaiser = null;
          this.clearMoves();
          this.emitEverything();

          if (this.lessThanTwoCanPlay()) {
            const self = this;
            setTimeout(function () {
              self.callTurnOnNextPlayer();
            }, 2000);
          } else {
            this.callTurnOnNextPlayer();
          }
          this.turnDealt = true;
        } else if (!this.riverDealt) {
          this.dealRiver();
          this.currBet = 0;
          this.currPlayer = this.getNextPlayer(this.dealer);
          this.initialRaiser = null;
          this.clearMoves();
          this.emitEverything();

          if (this.lessThanTwoCanPlay()) {
            const self = this;
            setTimeout(function () {
              self.callTurnOnNextPlayer();
            }, 2000);
          } else {
            this.callTurnOnNextPlayer();
          }
          this.riverDealt = true;
        } else {
          this.calculateAndAwardPots();
          this.emitEverything();
          this.io.to(this.theGame.getGameID()).emit('consoleLog', 'A new hand is starting in 5 seconds');
          this.theGame.clearGame();
          this.handComplete = true;
        }
      }
    }
  }

  private calculateAndAwardPots(): void {
    const handEval = new HandEvaluator(this.communityCards);

    const pots: number[] = [];
    for (let i = 0; i < this.playersInHand.length; i++) {
      console.log(`${this.playersInHand[i].getName()} has: ${this.playersInHand[i].getCurrMoneyInPot()} money in the pot`);
      if (!pots.includes(this.playersInHand[i].getCurrMoneyInPot())) {
        pots.push(this.playersInHand[i].getCurrMoneyInPot());
      }
    }

    for (let y = 0; y < pots.length; y++) {
      for (let index = 0; index < pots.length - 1; index++) {
        if (pots[index] > pots[index + 1]) {
          const temp = pots[index];
          pots[index] = pots[index + 1];
          pots[index + 1] = temp;
        }
      }
    }

    for (let i = 0; i < pots.length; i++) {
      let tied = false;
      let numWinners = 1;
      const currWinners: Player[] = [];
      currWinners.push(this.playersInHand[0]);

      for (let j = 1; j < this.playersInHand.length; j++) {
        if (this.playersInHand[j].getCurrMoneyInPot() >= pots[i]) {
          const bestHand = handEval.returnBestHand(currWinners[0].getHand()!, this.playersInHand[j].getHand()!);
          if (bestHand === currWinners[0].getHand()) {
            console.log(`Curr Winner stays the same with: ${currWinners[0].getName()}`);
          } else if (bestHand === this.playersInHand[j].getHand()) {
            console.log(`Curr Winner changes to ${this.playersInHand[j].getName()}`);
            currWinners.length = 0;
            currWinners[0] = this.playersInHand[j];
            tied = false;
          } else {
            console.log(`Pot #: ${i} is a split pot`);
            tied = true;
            currWinners[numWinners++] = this.playersInHand[j];
            console.log(`The number of winners is ${numWinners}`);
          }
        }
      }

      let moneyAwarded = 0;
      moneyAwarded = Number(moneyAwarded);
      for (let p = 0; p < this.theGame.getAllPlayers().length; p++) {
        if (pots[i] > this.theGame.getAllPlayers()[p].getCurrMoneyInPot()) {
          moneyAwarded += this.theGame.getAllPlayers()[p].getCurrMoneyInPot();
          this.theGame.getAllPlayers()[p].setCurrMoneyInPot(0);

          const index = this.playersInHand.indexOf(this.theGame.getAllPlayers()[p]);
          if (index !== -1) {
            console.log("Found and removed player w 0 stack");
            this.playersInHand.splice(index, 1);
          }
        } else {
          moneyAwarded += pots[i];
          this.theGame.getAllPlayers()[p].setCurrMoneyInPot(
            this.theGame.getAllPlayers()[p].getCurrMoneyInPot() - pots[i]
          );
        }
      }

      moneyAwarded = Number((moneyAwarded / currWinners.length).toFixed(2));
      console.log(`Money awarded: ${moneyAwarded}`);

      for (let k = 0; k < currWinners.length; k++) {
        if (pots.length > 1) {
          if (i === 0) {
            currWinners[k].addToStack(moneyAwarded);
            this.io.to(this.theGame.getGameID()).emit(
              'message',
              `${currWinners[k].getName()} has won the main pot of $${moneyAwarded} with: ${handEval.evaluateHandForString(currWinners[k].getHand()!)}`
            );
            console.log(
              `${currWinners[k].getName()} has won the main pot of $${moneyAwarded} with: ${handEval.evaluateHandForString(currWinners[k].getHand()!)}`
            );
          } else {
            if (this.playersInHand.length === 1) {
              currWinners[k].addToStack(moneyAwarded);
            } else {
              currWinners[k].addToStack(moneyAwarded);
              this.io.to(this.theGame.getGameID()).emit(
                'message',
                `${currWinners[k].getName()} has won split pot: ${i} of $${moneyAwarded} with: ${handEval.evaluateHandForString(currWinners[k].getHand()!)}`
              );
              console.log(
                `${currWinners[k].getName()} has won split pot: ${i} of $${moneyAwarded} with: ${handEval.evaluateHandForString(currWinners[k].getHand()!)}`
              );
            }
          }
        } else {
          currWinners[k].addToStack(moneyAwarded);
          this.io.to(this.theGame.getGameID()).emit(
            'message',
            `${currWinners[k].getName()} has won $${moneyAwarded} with: ${handEval.evaluateHandForString(currWinners[k].getHand()!)}`
          );
          console.log(
            `${currWinners[k].getName()} has won $${moneyAwarded} with: ${handEval.evaluateHandForString(currWinners[k].getHand()!)}`
          );
        }
      }

      for (let u = i + 1; u < pots.length; u++) {
        pots[u] = pots[u] - pots[i];
      }
    }
  }

  playerTurn(valTurn: TurnValue | number): void {
    if (this.initialRaiser === null) {
      this.initialRaiser = this.getCurrPlayer();
      console.log(`Setting initial raiser to: ${this.getCurrPlayer().getName()}`);
    }

    if (valTurn === "check") {
      if (!this.lessThanTwoCanPlay()) {
        this.io.to(this.theGame.getGameID()).emit('consoleLog', `${this.getCurrPlayer().getName()} has checked.`);
      }
    } else if (valTurn === "call") {
      if (this.getCurrPlayer().getStackSize() < this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound()) {
        console.log("Player calling all in for more than they have");
        this.moneyInPot += Number(this.getCurrPlayer().getStackSize());
        this.getCurrPlayer().addCurrMoneyInBettingRound(Number(this.getCurrPlayer().getStackSize()));
        this.getCurrPlayer().addCurrMoneyInPot(Number(this.getCurrPlayer().getStackSize()));
        this.getCurrPlayer().minusFromStack(this.getCurrPlayer().getStackSize());
      } else {
        this.getCurrPlayer().minusFromStack(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.moneyInPot += Number(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.getCurrPlayer().addCurrMoneyInPot(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.getCurrPlayer().addCurrMoneyInBettingRound(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
      }

      this.io.to(this.theGame.getGameID()).emit('consoleLog', `${this.getCurrPlayer().getName()} has called.`);
      if (this.getCurrPlayer().getStackSize() === 0) {
        this.getCurrPlayer().setAllIn();
        this.getCurrPlayer().setValTurn("playerIsAllIn");
        console.log(`${this.getCurrPlayer().getName()} is now ALL IN`);
      }
    } else if (valTurn === "fold" || valTurn === "autoFold") {
      this.io.to(this.theGame.getGameID()).emit('consoleLog', `${this.getCurrPlayer().getName()} has folded.`);

      if (this.getCurrPlayer() === this.dealer) {
        let newDealer = this.dealer;
        for (let i = 0; i < this.playersInHand.length - 1; i++) {
          newDealer = this.getNextPlayer(newDealer);
        }
        this.dealer = newDealer;
        console.log(`New dealer is: ${this.dealer.getName()}`);
      }
    } else if (valTurn === "playerIsAllIn") {
      // Do nothing, move to the next player
    } else {
      const raiseAmount = Number(valTurn);
      this.io.to(this.theGame.getGameID()).emit('consoleLog', `${this.getCurrPlayer().getName()} has raised to: ${raiseAmount}`);
      this.getCurrPlayer().minusFromStack(raiseAmount - this.getCurrPlayer().getCurrMoneyInBettingRound());
      console.log(`The player has put ${raiseAmount - this.getCurrPlayer().getCurrMoneyInPot()} into the pot`);
      this.currBet = raiseAmount;

      this.moneyInPot += Number(raiseAmount - this.getCurrPlayer().getCurrMoneyInBettingRound());
      this.getCurrPlayer().addCurrMoneyInPot(this.currBet - this.getCurrPlayer().getCurrMoneyInBettingRound());
      this.getCurrPlayer().addCurrMoneyInBettingRound(raiseAmount - this.getCurrPlayer().getCurrMoneyInBettingRound());
      this.initialRaiser = this.getCurrPlayer();

      if (this.getCurrPlayer().getStackSize() === 0) {
        this.getCurrPlayer().setAllIn();
        this.getCurrPlayer().setValTurn("playerIsAllIn");
        console.log(`${this.getCurrPlayer().getName()} is now ALL IN`);
      }

      let currP = this.getCurrPlayer();
      currP = this.getNextPlayer(currP);

      for (let i = 0; i < this.playersInHand.length; i++) {
        if (currP !== this.getCurrPlayer()) {
          currP.setValTurn("undefined");
          currP = this.getNextPlayer(currP);
          console.log(`Made ${currP.getName()}'s turn undefined`);
        }
      }
    }

    if (valTurn === "check" && this.getCurrPlayer() === this.bigBlind && this.currBet === this.theGame.getBB() && this.preflop === true) {
      this.playersInHand = this.updatePlayersLeftInHand();
      this.updateHand();
      this.preflop = false;
      this.emitEverything();
    } else {
      this.currPlayer.setTurn(false);
      console.log(`${this.currPlayer.getName()}'s turn is over. Now moving to ${this.getNextPlayer(this.currPlayer).getName()}'s turn.`);
      this.currPlayer = this.getNextPlayer(this.currPlayer);

      this.playersInHand = this.updatePlayersLeftInHand();

      this.emitEverything();
      this.updateHand();
    }
  }

  validOption(valTurn: TurnValue | number): boolean {
    if (valTurn === null) {
      return false;
    }

    if (valTurn === "check") {
      if (this.getCurrBet() === this.getCurrPlayer().getCurrMoneyInPot()) {
        return true;
      }
      if (this.getCurrBet() !== 0) {
        this.io.to(this.currPlayer.getSock()).emit('consoleLog', `You cannot check. The current bet is: ${this.getCurrBet()}, you must either call or raise`);
        return false;
      }
      return true;
    } else if (valTurn === "call") {
      if (this.getCurrBet() === this.getCurrPlayer().getCurrMoneyInBettingRound() && this.preflop) {
        this.io.to(this.currPlayer.getSock()).emit('consoleLog', 'You cannot call. You\'re big blind dummy');
        return false;
      }
      if (this.getCurrBet() === 0) {
        this.io.to(this.currPlayer.getSock()).emit('consoleLog', 'You cannot call. There is no current bet.');
        return false;
      }
      return true;
    } else if (valTurn === "fold" || valTurn === "autoFold") {
      return true;
    } else if (valTurn === "playerIsAllIn") {
      return true;
    } else {
      const betAmount = Number(valTurn);
      if (betAmount === 0) {
        this.io.to(this.currPlayer.getSock()).emit('consoleLog', 'Thats not a bet thats a check you retard.');
        return false;
      }
      if (this.getCurrBet() > betAmount) {
        this.io.to(this.currPlayer.getSock()).emit('consoleLog', `Invalid bet. You must at least call the current bet of: ${this.getCurrBet()}`);
        return false;
      }
      if ((betAmount - this.getCurrPlayer().getCurrMoneyInBettingRound()) > this.getCurrPlayer().getStackSize()) {
        this.io.to(this.currPlayer.getSock()).emit('consoleLog', 'Invalid bet. You cannot bet an amount greater than your stack size');
        return false;
      }
      return true;
    }
  }

  private callTurnOnNextPlayer(): void {
    console.log(`Curr Player is: ${this.getCurrPlayer().getName()} and valTurn == ${this.getCurrPlayer().getValTurn()}`);
    if (this.getCurrPlayer().isAllIn()) {
      this.io.to(this.getCurrPlayer().getSock()).emit('allIn');
      console.log("THIS GUY IS ALL IN");
    } else if (
      this.getCurrPlayer().getValTurn() !== "undefined" &&
      this.lessThanTwoCanPlay()
    ) {
      this.getCurrPlayer().setValTurn("check");
      console.log("Should skip turn and autoCheck this bib");
      this.playerTurn("check");
    } else {
      console.log("THIRD OPTION REACHED");
      this.getCurrPlayer().setTurn(true);
      this.emitEverything();
      this.io.to(this.getCurrPlayer().getSock()).emit('yourTurn', this.theGame.getTurnTime());
    }
  }

  private eligibleForBlinds(person: Player): boolean {
    if (this.playersInHand.indexOf(person) !== -1) {
      if (person.getStackSize() >= 10) {
        return true;
      }
    }
    return false;
  }

  private collectSmallBlind(): void {
    const smallBlindPlayer = this.getNextPlayer(this.dealer);
    if (this.theGame.getSB() < smallBlindPlayer.getStackSize()) {
      smallBlindPlayer.minusFromStack(this.theGame.getSB());
      smallBlindPlayer.addCurrMoneyInPot(this.theGame.getSB());
      smallBlindPlayer.setCurrMoneyInBettingRound(this.theGame.getSB());
      this.moneyInPot += this.theGame.getSB();
    } else if (smallBlindPlayer.getStackSize() > 0) {
      smallBlindPlayer.addCurrMoneyInPot(smallBlindPlayer.getStackSize());
      smallBlindPlayer.setCurrMoneyInBettingRound(smallBlindPlayer.getStackSize());
      this.moneyInPot += smallBlindPlayer.getStackSize();
      smallBlindPlayer.minusFromStack(smallBlindPlayer.getStackSize());
      smallBlindPlayer.setValTurn("playerIsAllIn");
      smallBlindPlayer.setAllIn();
    }
    this.io.to(smallBlindPlayer.getSock()).emit(
      'consoleLog',
      `You are assigned small blind and ${this.theGame.getSB()} has been taken from your stack`
    );
  }

  private collectBigBlind(): void {
    const bigBlindPlayer = this.getNextPlayer(this.getNextPlayer(this.dealer));
    if (this.theGame.getBB() < bigBlindPlayer.getStackSize()) {
      bigBlindPlayer.minusFromStack(this.theGame.getBB());
      bigBlindPlayer.addCurrMoneyInPot(this.theGame.getBB());
      bigBlindPlayer.setCurrMoneyInBettingRound(this.theGame.getBB());
      this.moneyInPot += this.theGame.getBB();
    } else if (bigBlindPlayer.getStackSize() > 0) {
      bigBlindPlayer.addCurrMoneyInPot(bigBlindPlayer.getStackSize());
      bigBlindPlayer.setCurrMoneyInBettingRound(bigBlindPlayer.getStackSize());
      this.moneyInPot += bigBlindPlayer.getStackSize();
      bigBlindPlayer.minusFromStack(bigBlindPlayer.getStackSize());
      bigBlindPlayer.setValTurn("playerIsAllIn");
      bigBlindPlayer.setAllIn();
    }
    this.io.to(bigBlindPlayer.getSock()).emit(
      'consoleLog',
      `You are assigned big blind and ${this.theGame.getBB()} has been taken from your stack`
    );
  }

  private dealFlop(): void {
    for (let j = 0; j < 3; j++) {
      this.communityCards[j] = this.theGame.getDeck().deal();
    }
    console.log("The Flop has been dealt \n \n \n");
    this.io.to(this.theGame.getGameID()).emit('consoleLog', 'The Flop has been dealt');
  }

  private dealTurn(): void {
    this.communityCards[3] = this.theGame.getDeck().deal();
    console.log("The Turn has been dealt \n \n \n");
    this.io.to(this.theGame.getGameID()).emit('consoleLog', 'The Turn has been dealt');
  }

  private dealRiver(): void {
    this.communityCards[4] = this.theGame.getDeck().deal();
    console.log("The River has been dealt \n \n \n");
    this.io.to(this.theGame.getGameID()).emit('consoleLog', 'The River has been dealt');
  }

  private emitEverything(): void {
    this.io.to(this.theGame.getGameID()).emit('hands', this.theGame.returnDisplayHands());
    this.io.to(this.theGame.getGameID()).emit('roomUsers', {
      room: this.theGame.getGameID(),
      users: this.theGame.getAllNames(),
      stacksizes: this.theGame.getAllStackSizes()
    });
    this.io.to(this.theGame.getGameID()).emit('dealBoard', this.getCardPNGs());
    this.io.to(this.theGame.getGameID()).emit('potSize', this.getPot());
    this.io.to(this.theGame.getGameID()).emit('roomPlayers', this.theGame.emitPlayers());
  }

  getPlayers(): Player[] {
    return this.playersInHand;
  }

  getCurrPlayer(): Player {
    return this.currPlayer;
  }

  getDealer(): Player {
    return this.dealer;
  }

  getPot(): number {
    return this.moneyInPot;
  }

  getCurrBet(): number {
    return this.currBet;
  }

  private lessThanTwoCanPlay(): boolean {
    let numPlayersNotAllIn = 0;
    for (let i = 0; i < this.playersInHand.length; i++) {
      if (!this.playersInHand[i].isAllIn()) {
        numPlayersNotAllIn++;
      }
    }
    return numPlayersNotAllIn < 2;
  }

  private checkIfPlayersLeftToAct(): boolean {
    const playersLeft = this.getPlayers();
    for (let i = 0; i < playersLeft.length; i++) {
      if (playersLeft[i].getValTurn() === "undefined") {
        return true;
      }
    }

    if (this.currPlayer === this.initialRaiser) {
      this.currPlayer.setTurn(false);
      this.emitEverything();
      console.log(`No more players left to act, reached initial raiser, returning false with ${this.currPlayer.getName()}'s turn`);
      return false;
    }

    return true;
  }

  private getNextPlayer(player: Player): Player {
    for (let i = 0; i < this.playersInHand.length; i++) {
      if (this.playersInHand[i].getName() === player.getName()) {
        if (i === this.playersInHand.length - 1) {
          return this.playersInHand[0];
        } else {
          return this.playersInHand[i + 1];
        }
      }
    }
    return this.playersInHand[0];
  }

  private updatePlayersLeftInHand(): Player[] {
    const playersStillLeft: Player[] = [];
    for (let i = 0; i < this.playersInHand.length; i++) {
      if (
        this.playersInHand[i].getValTurn() !== "fold" &&
        this.playersInHand[i].getValTurn() !== "autoFold"
      ) {
        playersStillLeft.push(this.playersInHand[i]);
      }
    }
    return playersStillLeft;
  }

  private clearMoves(): void {
    for (let i = 0; i < this.playersInHand.length; i++) {
      if (this.playersInHand[i].isAllIn()) {
        this.playersInHand[i].setValTurn("playerIsAllIn");
      } else {
        if (this.lessThanTwoCanPlay()) {
          this.playersInHand[i].setValTurn("check");
        } else {
          this.playersInHand[i].setValTurn("undefined");
          this.playersInHand[i].setCurrMoneyInBettingRound(0);
        }
      }
    }
  }

  private getCardPNGs(): string[] {
    const cardPNGS: string[] = [];
    for (let i = 0; i < this.communityCards.length; i++) {
      const info = this.communityCards[i].cardToPNG();
      cardPNGS.push(info);
    }
    return cardPNGS;
  }
}

export default PokerHand;
