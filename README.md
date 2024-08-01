
---

# Multiplayer Poker Game

## Overview
This project is a multiplayer poker game that allows users to create and join poker lobbies, play poker rounds, and chat with other players. The game is hosted on port 8080 and supports multiple lobbies with custom settings.

## Installation
To get the game up and running, follow these steps:

1. **Download Files**: Clone or download the repository to your local machine.
2. **Navigate to Server Directory**: Open a terminal and navigate to the server directory.
3. **Install Node.js**: Ensure Node.js is installed on your machine. If not, download and install it from [Node.js](https://nodejs.org/).
4. **Install Dependencies**: Run the following command to install the required dependencies:
   ```bash
   npm install
   ```
5. **Start the Server**: Run the server using the following command:
   ```bash
   npm run start
   ```
6. **Access the Game**: Open your web browser and go to `http://localhost:8080`. The game will be hosted on port 8080.

## Technologies Used
- **JavaScript**
- **Node.js**
- **HTML5, CSS3**
- **Socket.IO**
- **Express**
- **Nodemon**

## Design Patterns
- **Factory**: Initially used in the `pokerGame` class to create hand rounds but later abandoned.
- **Singleton**

## Features
- **Custom Built UI**: A user-friendly interface designed specifically for this game.
- **Multiplayer Poker Rounds Functionality**: Engage in poker rounds with multiple players.
- **Multiple Separate Lobbies**: Host or join various poker lobbies.
- **Integrated Chat Lobbies**: Chat with other players within each poker lobby.
- **Password Protected or Public Lobbies**: Create lobbies that are either public or require a password to join.

## Code Structure
Here is a brief overview of the main files and their functionalities:

- **card.js**: Defines the Card class, representing a card in the deck.
- **DeckOfCards.js**: Manages the deck of cards, including shuffling and dealing.
- **player.js**: Represents a player in the game, handling player properties and actions.
- **playerHand.js**: Manages the player's hand, including the cards dealt to the player.
- **pokerGame.js**: Core logic of the poker game, including managing players, dealing hands, and game flow.
- **handEvaluator.js**: Evaluates and compares poker hands to determine the best hand.
- **server.js**: Sets up the server using Express and Socket.IO, handles client connections, and manages game state.

## How to Play
1. **Create or Join a Lobby**: 
   - To create a lobby, provide a username, stack size, lobby name, small blind, big blind, and a password (optional).
   - To join an existing lobby, provide the lobby name and the password (if required).
2. **Start the Game**: The host can start the game once enough players have joined.
3. **Play Poker Rounds**: Players take turns to play their hands. Use the integrated chat to communicate with other players.
4. **End of Game**: The game continues until a single player has all the chips or players decide to end the game.

