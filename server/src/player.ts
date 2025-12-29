import { PlayerHand } from './playerHand';
import { Card } from './card';

export type TurnValue = "undefined" | "check" | "call" | "fold" | "autoFold" | "raise" | "playerIsAllIn";

export class Player {
  private hand: PlayerHand | null;
  private stackSize: number;
  private sockID: string;
  private name: string;
  private handsWon: number;
  private room: string;
  private valTurn: TurnValue;
  private currMoneyInPot: number;
  private currMoneyInBettingRound: number;
  private allIn: boolean;
  private isTurn: boolean;
  private hasHand: boolean;

  constructor(name: string, stacksize: number, s: string, room: string) {
    this.hand = null;
    this.stackSize = stacksize;
    this.sockID = s;
    this.name = name;
    this.handsWon = 0;
    this.room = room;
    this.valTurn = "undefined";
    this.currMoneyInPot = 0;
    this.currMoneyInBettingRound = 0;
    this.allIn = false;
    this.isTurn = false;
    this.hasHand = true;
  }

  setHasHand(a: boolean): void {
    this.hasHand = a;
  }

  getHasHand(): boolean {
    return this.hasHand;
  }

  setTurn(a: boolean): void {
    this.isTurn = a;
  }

  getTurn(): boolean {
    return this.isTurn;
  }

  isAllIn(): boolean {
    return this.allIn;
  }

  setAllIn(): void {
    this.allIn = true;
  }

  minusFromStack(num: number): void {
    this.stackSize -= num;
  }

  getStackSize(): number {
    return this.stackSize;
  }

  addToStack(num: number): void {
    this.stackSize += Number(num);
  }

  addCurrMoneyInPot(a: number): void {
    this.currMoneyInPot += a;
  }

  getCurrMoneyInPot(): number {
    return this.currMoneyInPot;
  }

  setCurrMoneyInPot(num: number): void {
    this.currMoneyInPot = num;
  }

  getCurrMoneyInBettingRound(): number {
    return this.currMoneyInBettingRound;
  }

  addCurrMoneyInBettingRound(num: number): void {
    this.currMoneyInBettingRound += num;
  }

  setCurrMoneyInBettingRound(num: number): void {
    this.currMoneyInBettingRound = num;
  }

  setValTurn(a: TurnValue): void {
    this.valTurn = a;
    console.log(`${this.getName()}'s valTurn is now: ${this.getValTurn()}`);
  }

  getValTurn(): TurnValue {
    return this.valTurn;
  }

  getRoom(): string {
    return this.room;
  }

  setName(name: string): void {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  getSock(): string {
    return this.sockID;
  }

  getHand(): PlayerHand | null {
    return this.hand;
  }

  resetInfo(): void {
    this.currMoneyInPot = 0;
    this.valTurn = "undefined";
    this.currMoneyInBettingRound = 0;
    this.allIn = false;
  }

  setHand(c1: Card, c2: Card): void {
    this.hand = new PlayerHand(c1, c2);
    console.log(`${this.name} in ${this.room} got dealt ${this.hand.getStringHand()}`);
  }
}

export default Player;
