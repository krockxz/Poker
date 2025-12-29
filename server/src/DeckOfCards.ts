import { Card } from './card';
import { Suit, CardNumber } from './card';

type Suits = readonly ['s', 'c', 'h', 'd'];

export class DeckOfCards {
  private totalCards: number = 52;
  private deck: Card[] = [];
  private readonly suits: Suits = ['s', 'c', 'h', 'd'];
  private deckCounter: number = 0;

  constructor() {
    for (let i = 0; i < this.suits.length; i++) {
      for (let j = 2; j < 15; j++) {
        this.deck[(i * 13) + (j - 2)] = new Card(this.suits[i], j as CardNumber);
      }
    }
  }

  getSuits(): Suits {
    return this.suits;
  }

  getDeck(): Card[] {
    return this.deck;
  }

  shuffle(): void {
    for (let i = 0; i < 52; i++) {
      const randomSpot = Math.round(Math.random() * 51);
      const temp = this.deck[i];
      this.deck[i] = this.deck[randomSpot];
      this.deck[randomSpot] = temp;
    }
  }

  deal(): Card {
    return this.deck[this.deckCounter++];
  }
}

export default DeckOfCards;
