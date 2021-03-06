import { SlicePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { PlayersInfo } from '../model/playersinfo';
import { NavigationExtras, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GameLogicService {

  numberOfPlayers!: number;
  numberOfAlivePlayers!: number;
  numberOfDice!: number;

  playersTotalScoreArray: any = [];
  playerLivesNumberArray: any = [];

  diceRollArray: number[][] = [];

  playerOneDiceRolls: any = [];
  playerTwoDiceRolls: any = [];
  playersThreeDiceRolls: any = [];
  playersFourDiceRolls: any = [];
  winningPlayer: number = 0;

  constructor(private router: Router) { }

  // To start the game. Calls the functions need to get the game started
  getStartGamePicks(numberOfDice: number, numberOfPlayers: number) {
    this.numberOfPlayers = numberOfPlayers;
    this.numberOfDice = numberOfDice;
    this.numberOfAlivePlayers = numberOfPlayers;
    this.initStartGame();
  }
  // Fills the arrays with 6 lives for each player then fills the diceRolls with zero so they can pass the checks. 
  initStartGame() {
    for (let i = 0; i < this.numberOfPlayers; i++) {
      this.playerLivesNumberArray[i] = 6;
      this.playersTotalScoreArray[i] = 0;
      this.diceRollArray[i] = [];
      for (let j = 0; j < this.numberOfDice; j++) {
        this.diceRollArray[i][j] = 0;
      }
    }
  }

  // Gens a random number 1-6 times the number of dice
  returnRandomNumber() {
    return Math.floor(Math.random() * 6) + 1;
  }

  //Calls the Random Number Gen and Adds then to the Player total score Array for each person
  addDiceRoll() {
    //If a number is zero or NaN then it fills with NaN and moves on to the next row
    for (let i = 0; i < this.numberOfPlayers; i++) {
      if (this.playerLivesNumberArray[i] === 0 || this.playerLivesNumberArray[i] == NaN || this.playersTotalScoreArray[i] == NaN) {
        this.playersTotalScoreArray.splice(i, 1, NaN);
        this.playerLivesNumberArray.splice(i, 1, NaN);
        this.numberOfAlivePlayers -= 1;
        console.log([this.numberOfAlivePlayers], "number of alive players")
        for (let j = 0; j < this.numberOfDice; j++) {
          this.diceRollArray[i][j] = NaN;
        }// if the numbers are not NaN then they can be filled with a random number.
      } else if (this.playerLivesNumberArray[i] !== NaN || this.playersTotalScoreArray[i] !== NaN) {
        for (let j = 0; j < this.numberOfDice; j++) {
          let randomNumber = this.returnRandomNumber();
          this.playersTotalScoreArray[i] += randomNumber;
          this.diceRollArray[i][j] += randomNumber;
        }
      }//Checks for Winner by looking for the index of the last player in the Array. 
      if (this.numberOfAlivePlayers === 1) {
        // looks for the Max number in the array then takes the index of the Max number. Filters out NaN in the players Total Score Array
        let smallestValueInArrayNaN = Math.max.apply(null, this.playersTotalScoreArray.filter(function (n: number) { return !isNaN(n); }));
        this.winningPlayer = this.playersTotalScoreArray.indexOf(smallestValueInArrayNaN) + 1;
        console.log(this.winningPlayer, 'last person remaining')
        console.log('go to winning page')
        this.gotoWinningPage()
      }// Total lose for all players. Goes to All Lose page
      if (this.numberOfAlivePlayers === 0) {
        console.log('No one wins')
        this.gotoNoOneWinsPage()
      }
    }
    console.log(this.playersTotalScoreArray, 'players score')
    console.log(this.playerLivesNumberArray, 'players lives')
    console.log(this.diceRollArray, ' Dice Roll Array after loading');
  }
  //Clears the Arrays out to be filled again. Checks for Greater than Zero and NaN to be filled with Zeros. 
  clearArrays() {
    for (let i = 0; i < this.numberOfPlayers; i++) {
      if (this.playerLivesNumberArray[i] > 0 && this.playerLivesNumberArray[i] !== NaN && this.playersTotalScoreArray[i] !== NaN) {
        this.diceRollArray[i] = [];
        this.playersTotalScoreArray[i] = 0;
        for (let j = 0; j < this.numberOfDice; j++) {
          this.diceRollArray[i][j] = 0;
        }
      }
    }
  }

  //Finds the lowest Index Value of the PLayer Score Array. 
  // Also Handles ties of the lowest Value of the Players Score Array
  lowestIndexValue() {
    let lowestIndexValue = 0;
    let lowestIndexValueArray = [];
    //let lowestValueInArray = Math.min(...this.playersTotalScoreArray);
    let smallestValueInArrayNaN = Math.min.apply(null, this.playersTotalScoreArray.filter(function (n: number) { return !isNaN(n); }));
    lowestIndexValue = this.playersTotalScoreArray.indexOf(smallestValueInArrayNaN);

    for (let i = 1; i < this.numberOfAlivePlayers; i++) {
      if (this.playersTotalScoreArray.indexOf(this.playersTotalScoreArray[i]) !== this.playersTotalScoreArray.lastIndexOf(this.playersTotalScoreArray[i])) {
        const firstMatchingIndex = this.playersTotalScoreArray.indexOf(this.playersTotalScoreArray[i]);
        const secondMatchingIndex = this.playersTotalScoreArray.lastIndexOf(this.playersTotalScoreArray[i]);
        if (smallestValueInArrayNaN === this.playersTotalScoreArray[firstMatchingIndex] || smallestValueInArrayNaN === this.playersTotalScoreArray[secondMatchingIndex]) {
          lowestIndexValueArray.push(this.playersTotalScoreArray.indexOf(this.playersTotalScoreArray[i]))
          lowestIndexValueArray.push(this.playersTotalScoreArray.lastIndexOf(this.playersTotalScoreArray[i]))
          return lowestIndexValueArray;
        }
      }
    }
    console.log(lowestIndexValue, 'indexvalue2');
    return lowestIndexValue;
  }

  //To subtract a life for the player with the lowest score
  //Also handles if the lowest score is a tie
  loseLife() {
    const indexValue = this.lowestIndexValue();
    if (Array.isArray(indexValue)) {
      for (let i = 0; i < 2; i++) {
        console.log(indexValue[i]);
        this.playerLivesNumberArray[indexValue[i]] -= 1;
      }
    } else {
      this.playerLivesNumberArray[indexValue] -= 1;
    }

  }

  //for each button click Or "Roll"
  diceRollBTN() {
    this.clearArrays();
    this.returnRandomNumber();
    this.addDiceRoll();
    this.lowestIndexValue();
    this.loseLife();
  }

  //The Returns to the GameBoard
  returnNumberOfPlayers(): any {
    return this.numberOfPlayers;
  }
  returnNumberOfAlivePlayers(): any {
    return this.numberOfAlivePlayers
  }

  returnNumberOfDice(): any {
    return this.numberOfDice;
  }

  returnPlayersLivesNumber() {
    return this.playerLivesNumberArray;
  }

  returnPlayerTotalScore() {
    return this.playersTotalScoreArray;
  }
  returnDiceRolls() {
    return this.diceRollArray;
  }
  returnWinningPlayer(): number {
    return this.winningPlayer;
  }
  //creates a route to the winning page once there is only 1 player remaining
  gotoWinningPage() {
    console.log("why Dis Not Working")
    this.router.navigate(['winning-page']);
    // }
    // else{
    //   console.log("Dis Not Work")
    // }
  }
  gotoNoOneWinsPage() {
    console.log("The chances are slim")
    this.router.navigate(['no-one-wins-page']);
  }
}




