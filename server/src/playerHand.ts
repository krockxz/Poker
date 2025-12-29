import { Card } from './card';

export class PlayerHand {
  private holeCard1: Card;
  private holeCard2: Card;

  constructor(c1: Card, c2: Card) {
    this.holeCard1 = c1;
    this.holeCard2 = c2;
  }

  getHoleCard1(): Card {
    return this.holeCard1;
  }

  getHoleCard2(): Card {
    return this.holeCard2;
  }

  getStringHand(): string {
    return `${this.holeCard1.cardToString()} and ${this.holeCard2.cardToString()}`;
  }

  getPNGHand(): string {
    return `${this.holeCard1.cardToPNG()} ${this.holeCard2.cardToPNG()}`;
  }
}

export default PlayerHand;
