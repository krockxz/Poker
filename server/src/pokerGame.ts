import { DeckOfCards } from './DeckOfCards';
import { Player } from './player';
import { PokerHand } from './pokerHand';

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

export class PokerGame {
  private gameHost: Player | null;
  private password: string;
  private defaultStackSize: number;
  private totalPlayers: number;
  private players: Player[];
  private gameID: string;
  private begun: boolean;
  private deck: DeckOfCards;
  private turnTime: number;
  private dealerIdx: number;
  private smallBlind: number;
  private bigBlind: number;
  private hand: PokerHand | null;
  private handNumber: number;

  constructor(gameID: string) {
    this.gameHost = null;
    this.password = '';
    this.defaultStackSize = 0;
    this.totalPlayers = 0;
    this.players = [];
    this.gameID = gameID;
    this.begun = false;
    this.deck = new DeckOfCards();
    this.turnTime = 10000;
    this.dealerIdx = 0;
    this.smallBlind = 0;
    this.bigBlind = 0;
    this.hand = null;
    this.handNumber = 0;
  }

  newHand(): void {
    this.hand = new PokerHand(this);
  }

  returnHand(): PokerHand | null {
    return this.hand;
  }

  getSB(): number {
    return this.smallBlind;
  }

  getBB(): number {
    return this.bigBlind;
  }

  getPassword(): string {
    return this.password;
  }

  setPassword(password: string): void {
    this.password = password;
  }

  getHost(): Player | null {
    return this.gameHost;
  }

  getDealerIdx(): number {
    return this.dealerIdx;
  }

  getTurnTime(): number {
    return this.turnTime;
  }

  getDeck(): DeckOfCards {
    return this.deck;
  }

  shuffle(): void {
    this.deck.shuffle();
  }

  getBegun(): boolean {
    return this.begun;
  }

  setBegun(hasit: boolean): void {
    this.begun = hasit;
  }

  playerJoin(player: Player): void {
    if (this.gameHost === null) {
      this.gameHost = player;
    }
    this.players.push(player);
    this.totalPlayers++;
  }

  playerLeave(id: string): Player | undefined {
    for (let i = 0; i < this.totalPlayers; i++) {
      if (this.players[i].getSock() === id) {
        const temp = this.players[i];
        this.players.splice(i, 1);
        this.totalPlayers--;
        if (this.players.length > 0) {
          this.gameHost = this.players[0];
        } else {
          this.gameHost = null;
        }
        return temp;
      }
    }
    return undefined;
  }

  getCurrentUser(id: string): Player | undefined {
    for (let i = 0; i < this.totalPlayers; i++) {
      if (this.players[i].getSock() === id) {
        return this.players[i];
      }
    }
    return undefined;
  }

  getAllPlayers(): Player[] {
    return this.players;
  }

  getTotalPlayers(): number {
    return this.totalPlayers;
  }

  getEligiblePlayers(): Player[] {
    const ePlayers: Player[] = [];
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].getStackSize() > 0) {
        ePlayers.push(this.players[i]);
      }
    }
    return ePlayers;
  }

  getAllNames(): string[] {
    const names: string[] = [];
    for (let i = 0; i < this.totalPlayers; i++) {
      names.push(this.players[i].getName());
    }
    return names;
  }

  getAllStackSizes(): number[] {
    const stacks: number[] = [];
    for (let i = 0; i < this.totalPlayers; i++) {
      stacks.push(this.players[i].getStackSize());
    }
    return stacks;
  }

  getGameID(): string {
    return this.gameID;
  }

  checkIfNameIsInGame(name: string): boolean {
    for (let i = 0; i < this.getAllPlayers().length; i++) {
      if (this.getAllPlayers()[i].getName() === name) {
        return true;
      }
    }
    return false;
  }

  checkIfSockIDisInGame(sockID: string): boolean {
    for (let i = 0; i < this.totalPlayers; i++) {
      if (this.players[i].getSock() === sockID) {
        return true;
      }
    }
    return false;
  }

  getPlayerFromSockID(sockID: string): Player | null {
    for (let i = 0; i < this.totalPlayers; i++) {
      if (this.players[i].getSock() === sockID) {
        return this.players[i];
      }
    }
    return null;
  }

  getPlayerAt(i: number): Player {
    return this.players[i];
  }

  dealHands(): void {
    for (let i = 0; i < this.getAllPlayers().length; i++) {
      if (this.getAllPlayers()[i].getStackSize() !== 0) {
        this.getAllPlayers()[i].setHand(this.getDeck().deal(), this.getDeck().deal());
      }
    }
  }

  returnDisplayHands(): Array<{ name: string; hand: string | null }> {
    const arr: Array<{ name: string; hand: string | null }> = [];
    for (let i = 0; i < this.totalPlayers; i++) {
      if (this.players[i].getHand() !== null) {
        const info = { name: this.players[i].getName(), hand: this.players[i].getHand()!.getPNGHand() };
        arr.push(info);
      } else {
        const info = { name: this.players[i].getName(), hand: null };
        arr.push(info);
      }
    }
    return arr;
  }

  increaseDealerPosition(): void {
    this.dealerIdx += 1;
  }

  clearPlayersInfo(): void {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].resetInfo();
    }
  }

  emitPlayers(): Array<number | PlayerInfo> {
    const returnArr: Array<number | PlayerInfo> = [];
    const dealerIndex = this.dealerIdx % this.getTotalPlayers();
    returnArr.push(dealerIndex);

    for (let i = 0; i < this.getTotalPlayers(); i++) {
      const currPerson = this.getPlayerAt(i);
      let holeCard1: string;
      let holeCard2: string;

      if (currPerson.getHand() === null) {
        holeCard1 = "blue_back.png";
        holeCard2 = "blue_back.png";
      } else {
        holeCard1 = currPerson.getHand()!.getHoleCard1().cardToPNG();
        holeCard2 = currPerson.getHand()!.getHoleCard2().cardToPNG();
      }

      returnArr.push({
        name: currPerson.getName(),
        stack: currPerson.getStackSize(),
        moneyIn: currPerson.getCurrMoneyInBettingRound(),
        card1: holeCard1,
        card2: holeCard2,
        valTurn: currPerson.getValTurn(),
        isShown1: false,
        isShown2: false,
        isStraddled: false,
        isTurn: currPerson.getTurn()
      });
    }
    return returnArr;
  }

  clearGame(): void {
    this.clearPlayersInfo();
    this.increaseDealerPosition();
    this.deck = new DeckOfCards();
    this.deck.shuffle();
    this.deck.shuffle();
    this.deck.shuffle();
    this.deck.shuffle();
    this.hand = null;
    this.handNumber += 1;

    const self = this;
    setTimeout(function () {
      self.newHand();
    }, 5000);
  }
}

export function getAllPlayers(): Player[] {
  return [];
}

export default { PokerGame, getAllPlayers };
