const { Deck, Shoe, Game, Player } = require("./blackjack");

deck = new Deck();
// deck.Display();

shoe = new Shoe();
//shoe.Display();

game = new Game(shoe, [ "Mike" ]);


game.Play();