export type Suit = 's' | 'c' | 'h' | 'd';
export type CardNumber = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export class Card {
  private suit: Suit;
  private number: CardNumber;

  constructor(s: Suit, n: CardNumber) {
    this.suit = s;
    this.number = n;
  }

  getSuit(): Suit {
    return this.suit;
  }

  getNumber(): CardNumber {
    return this.number;
  }

  static numberToString(number: CardNumber): string | null {
    const numToString: Record<CardNumber, string> = {
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
      10: "Ten",
      11: "Jack",
      12: "Queen",
      13: "King",
      14: "Ace"
    };
    return numToString[number] || null;
  }

  abbreviatedString(): string {
    const numToString: Record<number, string> = {
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "J",
      12: "Q",
      13: "K",
      14: "A"
    };
    return numToString[this.number] + this.suit;
  }

  private buildCardString(): string {
    const numToString: Record<number, string> = {
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
      10: "Ten",
      11: "Jack",
      12: "Queen",
      13: "King",
      14: "Ace"
    };

    const suitToString: Record<Suit, string> = {
      's': " of Spades",
      'c': " of Clubs",
      'h': " of Hearts",
      'd': " of Diamonds"
    };

    return numToString[this.number] + suitToString[this.suit];
  }

  cardToString(): string {
    return this.buildCardString();
  }

  cardToPNG(): string {
    const numToString: Record<number, string> = {
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "J",
      12: "Q",
      13: "K",
      14: "A"
    };

    const suitToString: Record<Suit, string> = {
      's': "S",
      'c': "C",
      'h': "H",
      'd': "D"
    };

    return `${numToString[this.number]}${suitToString[this.suit]}.png`;
  }
}

export default Card;
