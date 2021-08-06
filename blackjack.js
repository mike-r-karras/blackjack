const _ = require('lodash');

class Card {
    constructor( suit, name, value) {
        this.suit = suit;
        this.name = name;
        this.value = value;
    }
}

class Deck {
    constructor() {
        this.suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
        this.size = 52;
        this.names = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        this.values = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
        this.cards = [];
    
        for (let i of this.suits) {
            for (const [j, k] of this.names.entries()) {
                this.cards.push(new Card( i, k, this.values[j]));                
            }
        }
    }

    Display() {
        for (let card of this.cards) {
            console.log(card.name, card.suit + " - " + card.value);
        }
    }
}

class Shoe {
    constructor() {
        this.cards = [];
        for (let i = 0; i < 6; i++) {
            deck = new Deck();
            this.cards = (this.cards.length > 0) ? this.cards = [...this.cards, ...deck.cards] : this.cards = deck.cards;
        }
    }

    Display() {
        for (let card of this.cards) {
            console.log(card);
        }
    }
}

class Participant {
    constructor() {
        this.hand = [];
        this.wins = [];
        this.losses = [];
        this.pushes = [];
        this.stayed = false;
        this.busted = false;
    }
    Total() {
        const total = this.hand.reduce((a,b) => { return a + b.value}, 0);
        return total;
    }
    Shows() {
        const shows = this.visible.reduce((a,b) => { return a + b.value}, 0);
        return shows;``
    }
    testBust() {
        if (this.Total() > 21) {
            if (this.hand.find( (a) => {
                if (a.value == 11) {
                    a.value = 1;
                    this.testBust();
                } 
            })) { 
            } else {
                this.busted = true;
            }
        } else {
            this.busted = false;
        }
    }
    tallyScore(wlp, score) {
        let tally = this.wins;
        switch(wlp) {
            case "win":
                tally = this.wins;
                break;
            case "loss":
                tally = this.losses;
                break;
            case "push":
                tally = this.pushes;
                break;
        }
        let found = 0;
        if (tally.find((a) => {
            if (a.score == score) {
                a.number++;
                found = 1;
            }
        }));
        if (!found) {
            tally.push(new gameScore(score));
        }
    }
}

class Dealer extends Participant {
    constructor() {
        super();
        this.visible = [];
        this.always_beat_player_if_possible = true;
        this.stay_at = 17;
    }
}

class Player extends Participant {
    constructor(name) {
        super();
        this.name = name;
        this.visible = [];
        this.stay_at = 16;
        this.hit_on_dealer_shows = 2;
    }
}

class Game {
    constructor(shoe, names) {
       this.players = [];
       this.isBust = false;
       this.shoe = shoe;
       this.dealer = new Dealer(); 
       _.forEach(names, (name) => this.players.push(new Player(name)));
       // arbitrarily chosen
       this.minCards = 11 + (4 * this.players.length);
       this.num_games = 0;
       this.report = '';
    }

    Shuffle() {
        this.shoe.cards = _.shuffle(this.shoe.cards);
    }

    playerCards() {
        _.forEach(this.players, (player) => {
            player.hand.push(this.shoe.cards.pop());
        });
    }

    playerReport(player) {
        this.report += '\nPlayer hand: ';
        if (this.players.length > 1) {
            // insert name
            this.report += '('+player.name+') ';
        }
        _.forEach(player.hand, (card) => {
            this.report += card.name + ' ' + card.suit + ', ';
        });
        // trim final comma
        this.report = this.report.replace(new RegExp(", $"), "");
        this.report += ' = ' + player.Total();
        console.log(this.report);
        this.report = '';
    }

    dealerReport() {
        this.report += 'Dealer hand: ';
        _.forEach(this.dealer.hand, (card) => {
            this.report += card.name + ' ' + card.suit + ', ';
        });
        // trim final comma
        this.report = this.report.replace(new RegExp(", $"), "");
        this.report += ' = ' + this.dealer.Total();
        console.log(this.report);
        this.report = '';
    }

    resultReport() {
        _.forEach(this.players, (player) => {
            if (this.dealer.busted) {
                this.report += 'Result: Player ';
                if (this.players.length > 1 ) {
                    this.report += ' ('+ player.name + ') ';
                }
                this.report += 'wins!';
            } else {
                if (player.busted) {
                    this.report += 'Result: Dealer wins!';
                } else if (player.Total() < this.dealer.Total()) {
                    this.report += 'Result: Dealer wins!';
                } else {
                    this.report += 'Result: Player ';
                    if (this.players.length > 1 ) {
                        this.report += ' ('+ player.name + ') ';
                    }
                    this.report += 'wins!';
                }
            }
        });
        console.log(this.report);
    }

    playerHit(name) {
        let player = this.players.find(a => a.name === name);
        if (!player.stayed && !this.isBust) {
            const card = this.shoe.cards.pop();
            player.hand.push(card);
            player.visible.push(card);
            player.testBust();
            if (!player.busted) {
                if (
                        player.hit_on_dealer_shows <= this.dealer.Shows()
                            &&
                        player.Total() < player.stay_at
                ) {
                        this.playerHit(player.name);
                } else {
                        // console.log('1 : Player stay calculation => ', player.stay_at, player.Total());
                        // console.log('player_hit_on_dealer_shows => ', player.hit_on_dealer_shows);
                        // console.log('Dealer shows: ', this.dealer.Shows());
                        player.stayed = true;
                        this.playerReport(player);
                        // console.log('Player', player.name, 'hand: ', player.hand.map((card) => { console.log(card.name, card.suit, ',')}));
                        // console.log(' = ', player.Total());
                }
            } else {
                // console.log('2 : Player stay calculation => ', player.stay_at, player.Total());
                // console.log('player_hit_on_dealer_shows => ', player.hit_on_dealer_shows);
                // console.log('Dealer shows: ', this.dealer.Shows());
                player.stayed = true;
                this.playerReport(player);
                // console.log('Player', player.name, 'hand: ', player.hand.map((card) => { console.log(card.name, card.suit, ',')}));
                // console.log(' = ', player.Total());
            }
        }
    }

    dealerHit() {
        if (!this.dealer.stayed && !this.isBust) {
            const card = this.shoe.cards.pop();
            this.dealer.hand.push(card);
            this.dealer.visible.push(card);
            this.dealer.testBust();
            if (!this.dealer.busted) {
                if (this.dealer.always_beat_player_if_possible) {
                    let target = 0;
                    _.forEach(this.players, (player) => {
                        if (!player.busted) {
                            if (player.Total() > target) {
                                target = player.Total();
                            }
                        }
                    });

                    if (this.dealer.Total() <= target) {
                        this.dealerHit();
                    }
                }
                if (this.dealer.Total() <= this.dealer.stay_at) {
                    this.dealerHit();
                } else {
                    // console.log('Dealer stay calculation => ', this.dealer.stay_at, this.dealer.Total());
                    if (!this.dealer.stayed) {
                        this.dealer.stayed = true;
                    }
                }
            } else {
                this.isBust = true;
                this.dealer.stayed = true;
            }
        }
    }

    Deal() {
        this.playerCards();
        this.dealer.hand.push(this.shoe.cards.pop());
        this.playerCards();
        let upcard = this.shoe.cards.pop();
        this.dealer.hand.push(upcard);
        this.dealer.visible.push(upcard);
    }

    Round() {
        _.forEach(this.players, (player) => {
            while (!player.stayed && !player.busted) {
                if (player.Total() < player.stay_at) {
                    this.playerHit(player.name);
                } else {
                    player.stayed = true;
                    this.playerReport(player);
                }                 
            }
        });
        if (this.dealer.Total() < this.dealer.stay_at) {
            // console.log('4 : Dealer stay calculation => ', this.dealer.stay_at, this.dealer.Total());
            this.dealerHit();
        }
    }

    resetHand() {
        this.isBust = false;
        _.forEach(this.players, (player) => {
            player.hand = [];
            player.visible = [];
            player.busted = false;
            player.stayed = false;
        });
        this.dealer.hand = [];
        this.dealer.visible = [];
        this.dealer.busted = false;
        this.dealer.stayed = false;
        this.report = '';
    }

    successReport() {
        console.log('\n\nNumber of games:', this.num_games);
        _.forEach(this.players, (player) => {
            let successRate = '';
            // successRate
            successRate += 'Player Success';
            if (this.players.length > 1) {
                successRate += ' (' + player.name + ') ';
            }
            successRate += ': ';
            let totalWins = 0;
            _.forEach(player.wins, (wins) => {
                totalWins += wins.number;
            });
            let percent = (totalWins / this.num_games) * 100;
            successRate += parseFloat(percent).toFixed(2) + '%';
            successRate += '\n\n';
            console.log(successRate);
            successRate = '';

            //wins
            player.wins.sort((a,b) => (a.score > b.score) ? -1 : 1);
            successRate += 'Player ';
            if (this.players.length > 1) {
                successRate += '( ' + player.name + ' )';
            } 
            successRate += ' Winning Hand => # of times acheived';
            _.forEach(player.wins, (win) => {
                successRate += '\n' + win.score + ' => ' + win.number;
            });
            console.log(successRate);
        });
    }

    Tally() {
        let dealerScore = this.dealer.Total();        
        let playerHigh = 0; 
        for(let i = 0; i < this.players.length; i++) {
            if (!this.players[i].busted) {
                if (this.players[i].Total() > playerHigh) {
                    playerHigh = this.players[i].Total();
                }
            }
        }    
        if (this.dealer.busted) {
            this.dealer.tallyScore("loss", this.dealer.Total());
        } else {
            if (dealerScore > playerHigh) {
                this.dealer.tallyScore("win", dealerScore);
            } else if (dealerScore == playerHigh) {
                this.dealer.tallyScore("push", dealerScore);
            } else {
                this.dealer.tallyScore("loss", dealerScore);
            };
        }
        _.forEach(this.players,
            (player) => {
                let playerScore = player.Total();
                if (player.busted) {
                    player.tallyScore("loss", player.Total());
                } else {
                    if (playerScore > dealerScore) {
                        player.tallyScore("win", playerScore);
                    } else if (playerScore == dealerScore) {
                        player.tallyScore("push", playerScore);
                    } else {
                        player.tallyScore("loss", playerScore);
                    };
                }
            }
        );
    }

    Play() {
        this.Shuffle();
        while(this.shoe.cards.length > this.minCards) {
            this.resetHand();
            this.Deal();
            this.Round();
            this.num_games++;
            this.Tally();
            this.dealerReport();
            this.resultReport();
        }
        this.successReport();
    }    
}

class gameScore {
    constructor(score) {
        this.score = score;
        this.number = 1;
    }
}

module.exports = { Card, Deck, Shoe, Game};