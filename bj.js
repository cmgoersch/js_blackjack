const readlineSync = require('readline-sync');

// Karten-Deck erstellen
const suits = ["♥", "♦", "♣", "♠"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
let deck = [];

// Karten-Objekt für optische Darstellung
const cardSymbols = {
    "2": " 2 ", "3": " 3 ", "4": " 4 ", "5": " 5 ", "6": " 6 ", "7": " 7 ", "8": " 8 ", "9": " 9 ",
    "10": "10 ", "J": " J ", "Q": " Q ", "K": " K ", "A": " A "
};

// Deck generieren
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

// Deck mischen (Fisher-Yates Shuffle)
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Karte ziehen
function drawCard() {
    return deck.pop();
}

// Hand-Wert berechnen
function calculateHandValue(hand) {
    let value = 0;
    let aceCount = 0;

    for (let card of hand) {
        if (card.value === "A") {
            aceCount++;
            value += 11;
        } else if (["J", "Q", "K"].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }

    // Asse als 1 zählen, wenn nötig
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }

    return value;
}

// Karten schön anzeigen
function displayCards(hand, hideFirst = false) {
    let topLine = "";
    let midLine = "";
    let botLine = "";

    hand.forEach((card, index) => {
        if (hideFirst && index === 0) {
            topLine += "┌───┐ ";
            midLine += "| ? | ";
            botLine += "└───┘ ";
        } else {
            topLine += "┌───┐ ";
            midLine += `|${cardSymbols[card.value]}| `;
            botLine += `└───┘ `;
        }
    });

    console.log(topLine);
    console.log(midLine);
    console.log(botLine);
}

// Hauptspiel-Funktion
function playBlackjack() {
    let balance = 100;

    console.log("\n🃏 Willkommen bei Blackjack! 🃏\n");
    
    while (balance > 0) {
        console.log(`💰 Dein aktuelles Guthaben: ${balance}€`);

        // Einsatz setzen
        let bet;
        while (true) {
            bet = parseInt(readlineSync.question("Wie viel möchtest du setzen? (min. 1€, max. " + balance + "€): "));
            if (!isNaN(bet) && bet > 0 && bet <= balance) {
                break;
            }
            console.log("❌ Ungültiger Betrag! Bitte erneut eingeben.");
        }

        createDeck();
        shuffleDeck();

        let playerHand = [drawCard(), drawCard()];
        let dealerHand = [drawCard(), drawCard()];

        while (true) {
            console.log("\n💰 Deine Karten:");
            displayCards(playerHand);
            console.log(`(Wert: ${calculateHandValue(playerHand)})`);

            console.log("\n🏠 Karten des Dealers:");
            displayCards(dealerHand, true);

            if (calculateHandValue(playerHand) === 21) {
                console.log("\n🎉 BLACKJACK! Du gewinnst das doppelte deines Einsatzes! 🎉");
                balance += bet * 2;
                break;
            }

            let action = readlineSync.question("\nZiehe eine Karte (c) oder bleibe stehen (s): ").toLowerCase();
            if (action === "c") {
                playerHand.push(drawCard());
                if (calculateHandValue(playerHand) > 21) {
                    console.log("\n💥 Deine Karten:");
                    displayCards(playerHand);
                    console.log(`(Wert: ${calculateHandValue(playerHand)})`);
                    console.log("\n🚨 Du hast überzogen! Der Dealer gewinnt! 🚨");
                    balance -= bet;
                    break;
                }
            } else if (action === "s") {
                break;
            }
        }

        console.log("\n🏠 Der Dealer deckt seine Karten auf:");
        displayCards(dealerHand);
        console.log(`(Wert: ${calculateHandValue(dealerHand)})`);

        while (calculateHandValue(dealerHand) < 17) {
            console.log("🃏 Der Dealer zieht eine Karte...");
            dealerHand.push(drawCard());
            displayCards(dealerHand);
            console.log(`(Wert: ${calculateHandValue(dealerHand)})`);
        }

        let playerScore = calculateHandValue(playerHand);
        let dealerScore = calculateHandValue(dealerHand);

        if (dealerScore > 21) {
            console.log("\n🚀 Der Dealer hat überzogen! Du gewinnst! 🚀");
            balance += bet * 2;
        } else if (playerScore > dealerScore) {
            console.log("\n🎉 Glückwunsch! Du hast gewonnen! 🎉");
            balance += bet * 2;
        } else if (playerScore < dealerScore) {
            console.log("\n💀 Der Dealer gewinnt! 💀");
            balance -= bet;
        } else {
            console.log("\n🤝 Unentschieden! Dein Einsatz wird zurückerstattet. 🤝");
        }

        if (balance <= 0) {
            console.log("\n💸 Du hast kein Geld mehr! Das Spiel ist vorbei. 💸");
            break;
        }

        let playAgain = readlineSync.question("\nMöchtest du weiter spielen? (y/n): ").toLowerCase();
        if (playAgain !== "y") {
            break;
        }
    }

    // Spieler beendet das Spiel
    console.log("\n💳 Du kannst dein Guthaben auszahlen lassen!");
    let accountNumber = readlineSync.question("Gib deine Kontonummer ein: ");
    console.log(`\n💰 ${balance}€ wurden an ${accountNumber} überwiesen.`);
    console.log("\n🎲 Thanks for Gambling! 🎲\n");
}

// Spiel starten
playBlackjack();