import { Card } from './card';
import { PlayerHand } from './playerHand';

const TEN_NEG_TWO = 0.01;
const TEN_NEG_FOUR = 0.0001;
const TEN_NEG_SIX = 0.000001;
const TEN_NEG_EIGHT = 0.00000001;
const TEN_NEG_TEN = 0.0000000001;

export class HandEvaluator {
  private cardsOnBoard: Card[];

  constructor(communityCards: Card[]) {
    this.cardsOnBoard = communityCards;
  }

  evaluateHandNumberValue(hand1: PlayerHand): number | null {
    const straightFlushResult = this.returnStraightFlushNumber(hand1);
    if (straightFlushResult !== null) {
      return straightFlushResult;
    }

    const quadsResult = this.returnQuadsNumber(hand1);
    if (quadsResult !== null) {
      return quadsResult;
    }

    const fullHouseResult = this.returnFullHouseNumber(hand1);
    if (fullHouseResult !== null) {
      return fullHouseResult;
    }

    const flushResult = this.returnFlushNumber(hand1);
    if (flushResult !== null) {
      return flushResult;
    }

    const straightResult = this.returnStraightNumber(hand1);
    if (straightResult !== null) {
      return straightResult;
    }

    const tripsResult = this.returnTripsNumber(hand1);
    if (tripsResult !== null) {
      return tripsResult;
    }

    const twoPairResult = this.returnTwoPairNumber(hand1);
    if (twoPairResult !== null) {
      return twoPairResult;
    }

    const pairResult = this.returnPairNumber(hand1);
    if (pairResult !== null) {
      return pairResult;
    }

    const highCardResult = this.returnHighCardNumber(hand1);
    if (highCardResult !== null) {
      return highCardResult;
    }

    return null;
  }

  returnBestHand(hand1: PlayerHand, hand2: PlayerHand): PlayerHand | null {
    const hand1number = this.evaluateHandNumberValue(hand1);
    const hand2number = this.evaluateHandNumberValue(hand2);

    if (hand1number && hand2number) {
      if (hand1number > hand2number) {
        return hand1;
      } else if (hand2number > hand1number) {
        return hand2;
      }
    }
    return null;
  }

  evaluateHandForString(hand1: PlayerHand): string {
    if (this.cardsOnBoard.length === 0) {
      if (hand1.getHoleCard1().getNumber() > hand1.getHoleCard2().getNumber()) {
        return `High Card: ${hand1.getHoleCard1().cardToString()}, ${hand1.getHoleCard2().cardToString()}`;
      } else if (hand1.getHoleCard1().getNumber() < hand1.getHoleCard2().getNumber()) {
        return `High Card: ${hand1.getHoleCard2().cardToString()}, ${hand1.getHoleCard1().cardToString()}`;
      } else {
        return `Pair of: ${Card.numberToString(hand1.getHoleCard1().getNumber())}'s`;
      }
    } else {
      const handNum = this.evaluateHandNumberValue(hand1);
      if (handNum === null) {
        return "Unknown hand";
      }

      if (handNum > 8) {
        const topOfStraight = Math.floor((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100);
        return `Straight Flush: ${Card.numberToString(topOfStraight as any)} to ${Card.numberToString((topOfStraight - 4) as any)}`;
      } else if (handNum > 7) {
        const quadsNum = Math.floor((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100);
        const highCard = ((Number(handNum.toFixed(4)) - Number(handNum.toFixed(2))) * 10000).toFixed();
        return `Four of a Kind: ${Card.numberToString(quadsNum as any)}'s, ${Card.numberToString(Number(highCard) as any)} high`;
      } else if (handNum > 6) {
        const tripsNum = Math.floor((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100);
        const pairNum = ((Number(handNum.toFixed(4)) - Number(handNum.toFixed(2))) * 10000).toFixed();
        return `Full House: ${Card.numberToString(tripsNum as any)}'s full of ${Card.numberToString(Number(pairNum) as any)}'s`;
      } else if (handNum > 5) {
        const highestFlushCard = ((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100).toFixed();
        const secondFlushCard = ((Number(handNum.toFixed(4)) - Number(handNum.toFixed(2))) * 10000).toFixed();
        const thirdFlushCard = ((Number(handNum.toFixed(6)) - Number(handNum.toFixed(4))) * 1000000).toFixed();
        const fourthFlushCard = ((Number(handNum.toFixed(8)) - Number(handNum.toFixed(6))) * 100000000).toFixed();
        const fifthFlushCard = ((Number(handNum.toFixed(10)) - Number(handNum.toFixed(8))) * 10000000000).toFixed();
        return `Flush: ${Card.numberToString(Number(highestFlushCard) as any)}, ${Card.numberToString(Number(secondFlushCard) as any)}, ${Card.numberToString(Number(thirdFlushCard) as any)}, ${Card.numberToString(Number(fourthFlushCard) as any)}, ${Card.numberToString(Number(fifthFlushCard) as any)}`;
      } else if (handNum > 4) {
        const straightCard = ((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100).toFixed();
        return `Straight: ${Card.numberToString(Number(straightCard) as any)} to ${Card.numberToString((Number(straightCard) - 4) as any)}`;
      } else if (handNum > 3) {
        const tripsNum = ((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100).toFixed();
        const highCard = ((Number(handNum.toFixed(4)) - Number(handNum.toFixed(2))) * 10000).toFixed();
        const secondHighCard = ((Number(handNum.toFixed(6)) - Number(handNum.toFixed(4))) * 1000000).toFixed();
        return `Three of a Kind: ${Card.numberToString(Number(tripsNum) as any)}'s, ${Card.numberToString(Number(highCard) as any)}, ${Card.numberToString(Number(secondHighCard) as any)} high`;
      } else if (handNum > 2) {
        const highPair = ((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100).toFixed();
        const lowPair = ((Number(handNum.toFixed(4)) - Number(handNum.toFixed(2))) * 10000).toFixed();
        const highCard = ((Number(handNum.toFixed(6)) - Number(handNum.toFixed(4))) * 1000000).toFixed();
        return `Two Pair: ${Card.numberToString(Number(highPair) as any)}'s & ${Card.numberToString(Number(lowPair) as any)}'s, ${Card.numberToString(Number(highCard) as any)} high`;
      } else if (handNum > 1) {
        const pair = ((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100).toFixed();
        const highCard = ((Number(handNum.toFixed(4)) - Number(handNum.toFixed(2))) * 10000).toFixed();
        const secondHighCard = ((Number(handNum.toFixed(6)) - Number(handNum.toFixed(4))) * 1000000).toFixed();
        const thirdHighCard = ((Number(handNum.toFixed(8)) - Number(handNum.toFixed(6))) * 100000000).toFixed();
        return `Pair of: ${Card.numberToString(Number(pair) as any)}'s, ${Card.numberToString(Number(highCard) as any)}, ${Card.numberToString(Number(secondHighCard) as any)}, ${Card.numberToString(Number(thirdHighCard) as any)} high`;
      } else {
        const highCard = ((Number(handNum.toFixed(2)) - Math.floor(handNum)) * 100).toFixed();
        const secondHighCard = ((Number(handNum.toFixed(4)) - Number(handNum.toFixed(2))) * 10000).toFixed();
        const thirdHighCard = ((Number(handNum.toFixed(6)) - Number(handNum.toFixed(4))) * 1000000).toFixed();
        const fourthHighCard = ((Number(handNum.toFixed(8)) - Number(handNum.toFixed(6))) * 100000000).toFixed();
        const fifthHighCard = ((Number(handNum.toFixed(10)) - Number(handNum.toFixed(8))) * 10000000000).toFixed();
        return `High Card: ${Card.numberToString(Number(highCard) as any)}, ${Card.numberToString(Number(secondHighCard) as any)}, ${Card.numberToString(Number(thirdHighCard) as any)}, ${Card.numberToString(Number(fourthHighCard) as any)}, ${Card.numberToString(Number(fifthHighCard) as any)}`;
      }
    }
    return "Unknown hand";
  }

  private returnHighCardNumber(hand1: PlayerHand): number | null {
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    const highCard = [cards[cards.length - 1], cards[cards.length - 2], cards[cards.length - 3], cards[cards.length - 4], cards[cards.length - 5]];
    return 0 + highCard[0].getNumber() * TEN_NEG_TWO + highCard[1].getNumber() * TEN_NEG_FOUR + highCard[2].getNumber() * TEN_NEG_SIX + highCard[3].getNumber() * TEN_NEG_EIGHT + highCard[4].getNumber() * TEN_NEG_TEN;
  }

  private createCard(suit: 's', number: 0): Card {
    return new Card(suit, 2);
  }

  private returnPairNumber(hand1: PlayerHand): number | null {
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    let pair = false;
    let pairArr: Card[] | null = null;
    let pairCard = 0;

    for (let i = cards.length - 2; i >= 0; i--) {
      if (cards[i + 1].getNumber() === cards[i].getNumber()) {
        pair = true;
        pairCard = cards[i].getNumber();
        break;
      }
    }

    if (pair) {
      let arrCounter = 2;
      let pairArrCounter = 0;
      pairArr = [];
      for (let i = cards.length - 1; i >= 0; i--) {
        if (arrCounter <= 4 && cards[i].getNumber() !== pairCard) {
          pairArr[arrCounter++] = cards[i];
        }
        if (cards[i].getNumber() === pairCard) {
          pairArr[pairArrCounter++] = cards[i];
        }
      }
      const pairNumber = 1 + pairArr[0].getNumber() * TEN_NEG_TWO + pairArr[2].getNumber() * TEN_NEG_FOUR + pairArr[3].getNumber() * TEN_NEG_SIX + pairArr[4].getNumber() * TEN_NEG_EIGHT;
      return pairNumber;
    }
    return null;
  }

  private returnTwoPairNumber(hand1: PlayerHand): number | null {
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    let twoPairCheck = 0;
    let twoPairNumber1Index1 = 0;
    let twoPairNumber1Index2 = 0;
    let twoPairNumber2Index1 = 0;
    let twoPairNumber2Index2 = 0;
    let twoPair = false;
    const TwoPair: Card[] = [];

    for (let i = cards.length - 2; i >= 0; i--) {
      if (cards[i + 1].getNumber() === cards[i].getNumber()) {
        twoPairCheck++;
        if (twoPairNumber1Index1 === 0) {
          twoPairNumber1Index1 = i;
          twoPairNumber1Index2 = i + 1;
        } else if (twoPairNumber2Index1 === 0) {
          twoPairNumber2Index1 = i;
          twoPairNumber2Index2 = i + 1;
          twoPair = true;
          break;
        }
      }
    }

    if (twoPair) {
      let highCard: Card = new Card('s', 2); // Start with lowest card
      for (let i = cards.length - 1; i >= 0; i--) {
        if (i !== twoPairNumber1Index1 && i !== twoPairNumber1Index2 && i !== twoPairNumber2Index1 && i !== twoPairNumber2Index2) {
          if (cards[i].getNumber() > highCard.getNumber()) {
            highCard = cards[i];
          }
        }
      }
      TwoPair.push(cards[twoPairNumber1Index1], cards[twoPairNumber1Index2], cards[twoPairNumber2Index1], cards[twoPairNumber2Index2], highCard);
      const twoPairNumber = 2 + TwoPair[0].getNumber() * TEN_NEG_TWO + TwoPair[2].getNumber() * TEN_NEG_FOUR + TwoPair[4].getNumber() * TEN_NEG_SIX;
      return twoPairNumber;
    }
    return null;
  }

  private returnTripsNumber(hand1: PlayerHand): number | null {
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    let tripCheck = 0;
    let tripCard = 0;
    let hasTrips = false;
    const Trips: Card[] = [];

    for (let i = cards.length - 2; i >= 0; i--) {
      if (cards[i + 1].getNumber() === cards[i].getNumber()) {
        tripCheck++;
        if (tripCheck === 2) {
          hasTrips = true;
          tripCard = cards[i].getNumber();
          break;
        }
      } else {
        tripCheck = 0;
      }
    }

    if (hasTrips) {
      let highCard: Card = new Card('s', 2);
      let secondHighCard: Card = new Card('s', 2);
      let newArrCounter = 0;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].getNumber() > secondHighCard.getNumber() && cards[i].getNumber() !== tripCard) {
          if (cards[i].getNumber() > highCard.getNumber()) {
            secondHighCard = highCard;
            highCard = cards[i];
          } else {
            secondHighCard = cards[i];
          }
        }
        if (cards[i].getNumber() === tripCard) {
          Trips[newArrCounter++] = cards[i];
        }
      }
      Trips[newArrCounter++] = highCard;
      Trips[newArrCounter] = secondHighCard;
      const tripsNumber = 3 + Trips[0].getNumber() * TEN_NEG_TWO + Trips[3].getNumber() * TEN_NEG_FOUR + Trips[4].getNumber() * TEN_NEG_SIX;
      return tripsNumber;
    }
    return null;
  }

  private returnStraightNumber(hand1: PlayerHand): number | null {
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    let straightCounter = 0;
    let isStraight = false;
    let wheel = false;
    let aceExists = false;
    let acePosition = 0;
    let straight: Card[] | null = null;
    let topOfStraight: Card | null = null;
    let topIndex = 0;

    for (let i = cards.length - 2; i >= 0; i--) {
      if (i === cards.length - 2) {
        if (cards[cards.length - 1].getNumber() === 14) {
          aceExists = true;
          acePosition = cards.length - 1;
        }
      }

      if (straightCounter === 4) {
        isStraight = true;
        break;
      }
      if (cards[i].getNumber() - cards[i + 1].getNumber() === -1) {
        if (straightCounter === 0) {
          topOfStraight = cards[i + 1];
          topIndex = i + 1;
        }
        straightCounter++;
      } else if (cards[i].getNumber() === cards[i + 1].getNumber()) {
        // Skip over if its the same number
      } else {
        straightCounter = 0;
      }

      if (straightCounter === 3 && cards[i].getNumber() === 2 && aceExists) {
        wheel = true;
        isStraight = true;
        break;
      }
    }

    if (straightCounter === 4) {
      isStraight = true;
    }

    let straightNumber: number | null = null;
    if (isStraight && topOfStraight) {
      straight = [];
      let b = 0;

      if (wheel) {
        b = 4;
        straight[0] = cards[acePosition];
        for (let i = topIndex; i > 0; i--) {
          straight[b--] = cards[i];
          if (b === 0) {
            break;
          }
          if (straight[b + 1]!.getNumber() === cards[i - 1].getNumber()) {
            i--;
          }
        }
      } else {
        for (let i = topIndex; i >= 0; i--) {
          straight[b++] = cards[i];
          if (b === 5) {
            break;
          }
          if (b > 0 && straight[b - 1]!.getNumber() === cards[i - 1].getNumber()) {
            i--;
          }
        }
      }

      straightNumber = 4 + topOfStraight.getNumber() * TEN_NEG_TWO;
    }

    return straightNumber;
  }

  private returnFlushNumber(hand1: PlayerHand): number | null {
    const suits: Array<'s' | 'c' | 'd' | 'h'> = ['s', 'c', 'd', 'h'];
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    let flushCount = 0;
    let currentSuit: string;
    let isFlush = false;
    let flush: Card[] | null = null;
    let flushNumber: number | null = null;

    for (let i = 0; i < suits.length; i++) {
      currentSuit = suits[i];
      flushCount = 0;
      for (let k = 0; k < cards.length; k++) {
        if (cards[k].getSuit() === currentSuit) {
          flushCount++;
          if (flushCount === 5) {
            isFlush = true;
            break;
          }
        }
      }

      if (isFlush) {
        flush = [];
        let flushArrayCounter = 0;
        for (let b = cards.length - 1; b >= 0; b--) {
          if (cards[b].getSuit() === currentSuit) {
            flush[flushArrayCounter++] = cards[b];
          }
          if (flushArrayCounter === 5) {
            break;
          }
        }
        flushNumber = 5 + flush[0].getNumber() * TEN_NEG_TWO + flush[1].getNumber() * TEN_NEG_FOUR + flush[2].getNumber() * TEN_NEG_SIX + flush[3].getNumber() * TEN_NEG_EIGHT + flush[4].getNumber() * TEN_NEG_TEN;
        break;
      }
    }

    return flushNumber;
  }

  private returnFullHouseNumber(hand1: PlayerHand): number | null {
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    let tripCheck = 0;
    let trips = false;
    let tripNumber = 0;

    for (let i = cards.length - 2; i >= 0; i--) {
      if (cards[i + 1].getNumber() === cards[i].getNumber()) {
        tripCheck++;
        if (tripCheck === 2) {
          trips = true;
          tripNumber = cards[i].getNumber();
          break;
        }
      } else {
        tripCheck = 0;
      }
    }

    const House: Card[] = [];
    let house = false;
    let pairNumber = 0;

    if (trips) {
      for (let i = cards.length - 2; i >= 0; i--) {
        if (cards[i].getNumber() !== tripNumber && cards[i + 1].getNumber() === cards[i].getNumber()) {
          house = true;
          pairNumber = cards[i].getNumber();
        }
      }
    }

    let fullHouseNumber: number | null = null;
    if (house) {
      let tripCount = 0;
      let pairCount = 3;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].getNumber() === tripNumber) {
          House[tripCount++] = cards[i];
        }
        if (cards[i].getNumber() === pairNumber) {
          House[pairCount++] = cards[i];
        }
      }
      fullHouseNumber = 6 + House[0].getNumber() * TEN_NEG_TWO + House[3].getNumber() * TEN_NEG_FOUR;
    }

    return fullHouseNumber;
  }

  private returnQuadsNumber(hand1: PlayerHand): number | null {
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    let quadCount = 0;
    let hasQuads = false;
    let quadCard = 0;
    const Quads: Card[] = [];

    for (let i = cards.length - 2; i >= 0; i--) {
      if (cards[i + 1].getNumber() === cards[i].getNumber()) {
        quadCount++;
        if (quadCount === 3) {
          hasQuads = true;
          quadCard = cards[i].getNumber();
          break;
        }
      } else {
        quadCount = 0;
      }
    }

    let quadsNumber: number | null = null;
    if (hasQuads) {
      let arrCounter = 0;
      let highCard: Card = new Card('s', 2);
      for (let i = cards.length - 1; i >= 0; i--) {
        if (cards[i].getNumber() === quadCard) {
          Quads[arrCounter++] = cards[i];
        } else if (cards[i].getNumber() > highCard.getNumber()) {
          highCard = cards[i];
        }
      }
      Quads[arrCounter] = highCard;
      quadsNumber = 7 + Quads[0].getNumber() * TEN_NEG_TWO + Quads[4].getNumber() * TEN_NEG_FOUR;
    }

    return quadsNumber;
  }

  private returnStraightFlushNumber(hand1: PlayerHand): number | null {
    const suits: Array<'s' | 'c' | 'd' | 'h'> = ['s', 'c', 'd', 'h'];
    const cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    let flush = false;
    let flushSuit: string = '';
    let flushCount = 0;

    for (let i = 0; i < suits.length; i++) {
      const currSuit = suits[i];
      flushCount = 0;
      for (let k = 0; k < cards.length; k++) {
        if (cards[k].getSuit() === currSuit) {
          flushCount++;
        }
      }
      if (flushCount >= 5) {
        flush = true;
        flushSuit = currSuit;
        break;
      }
    }

    let straight: Card[] | null = null;
    let straightFlushNumber: number | null = null;

    if (flush) {
      const cardsOfFlushSuit: Card[] = [];
      let p = 0;
      for (let k = 0; k < cards.length; k++) {
        if (cards[k].getSuit() === flushSuit) {
          cardsOfFlushSuit[p++] = cards[k];
        }
      }
      const sortedFlushCards = this.insertionSort(cardsOfFlushSuit);

      let straightCounter = 0;
      let isStraight = false;
      let wheel = false;
      let aceExists = false;
      let acePosition = 0;
      let topOfStraight: Card | null = null;
      let topIndex = 0;

      for (let i = sortedFlushCards.length - 2; i >= 0; i--) {
        if (sortedFlushCards[sortedFlushCards.length - 1].getNumber() === 14) {
          aceExists = true;
          acePosition = sortedFlushCards.length - 1;
        }

        if (straightCounter === 4) {
          isStraight = true;
          break;
        }
        if (sortedFlushCards[i].getNumber() - sortedFlushCards[i + 1].getNumber() === -1) {
          if (straightCounter === 0) {
            topOfStraight = sortedFlushCards[i + 1];
            topIndex = i + 1;
          }
          straightCounter++;
        } else if (sortedFlushCards[i].getNumber() === sortedFlushCards[i + 1].getNumber()) {
          // Skip over if its the same number
        } else {
          straightCounter = 0;
        }
        if (straightCounter === 3 && sortedFlushCards[i].getNumber() === 2 && aceExists) {
          wheel = true;
          isStraight = true;
          break;
        }
      }

      if (straightCounter === 4) {
        isStraight = true;
      }

      if (isStraight && topOfStraight) {
        straight = [];
        let b = 0;

        if (wheel) {
          b = 4;
          straight[0] = sortedFlushCards[acePosition];
          for (let i = topIndex; i > 0; i--) {
            straight[b--] = sortedFlushCards[i];
            if (b === 0) {
              break;
            }
            if (straight[b + 1]!.getNumber() === sortedFlushCards[i - 1].getNumber()) {
              i--;
            }
          }
        } else {
          for (let i = topIndex; i >= 0; i--) {
            straight[b++] = sortedFlushCards[i];
            if (b === 5) {
              break;
            }
            if (straight[b - 1]!.getNumber() === sortedFlushCards[i - 1].getNumber()) {
              i--;
            }
          }
        }

        straightFlushNumber = 8 + topOfStraight.getNumber() * TEN_NEG_TWO;
      }
    }

    return straightFlushNumber;
  }

  private currentNumCardsOnBoard(): number {
    if (this.cardsOnBoard === null) {
      return 0;
    }
    return this.cardsOnBoard.length;
  }

  private insertionSort(arr: Card[]): Card[] {
    for (let i = 0; i < arr.length; i++) {
      const keyCard = arr[i];
      const key = arr[i].getNumber();
      let j = i - 1;

      while (j >= 0 && arr[j].getNumber() > key) {
        arr[j + 1] = arr[j];
        j = j - 1;
      }
      arr[j + 1] = keyCard;
    }
    return arr;
  }

  private returnArrayOfSortedBoardAndHandCards(hand1: PlayerHand): Card[] {
    const cards: Card[] = [];
    let j = 0;
    for (let i = 0; i < this.currentNumCardsOnBoard(); i++) {
      cards[i] = this.cardsOnBoard[i];
      j++;
    }
    cards[j++] = hand1.getHoleCard1();
    cards[j] = hand1.getHoleCard2();
    return this.insertionSort(cards);
  }
}

export default HandEvaluator;
