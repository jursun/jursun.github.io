const cards = [
    1,
    2,2,
    3,3,3,
    4,4,4,4,
    5,5,5,5,5,
    6,6,6,6,6,6,
    7,7,7,7,7,7,7,
    8,8,8,8,8,8,8,8,
    9,9,9,9,9,9,9,9,9,
    10,10,10,10,10,10,10,10,10,10
]

let drawPile = [];
let discardPile = [];
let hide = true;

let players = [];
let turnCursor = 0;

function resetPlayers() {
    players = [];
    const names = document.getElementById("setup").value.split(',');
    names.forEach((name) => {
        players.push(
            {
                "name": name,
                "score": [],
                "hand": []
            }
        );
    });
}

function resetDeck() {
    hide = true;
    discardPile = [];
    drawPile = cards.slice(0);
    shuffle(drawPile);
}

function burnFive() {
    for (let i = 0; i < 5; i++) {
        discardPile.push(drawPileSmartPop());
    }
}

function dealToEveryone() {
    players.forEach((player) => {
        player.hand.push(drawPileSmartPop());
    });
}

function lowestGoesFirst() {
    turnCursor = findPlayerWithLowestCard(players);
}

function dealCardToPlayer() {
    const player = players[turnCursor];
    const card = drawPileSmartPop();
    if (findPair(player, card)) {
        scorePairForPlayer(player, card);
    } else {
        addCardToPlayerHand(player, card);
        advanceTurnCursor();
    }
}

function findPair(player, card) {
    return player.hand.indexOf(card) !== -1;
}

function addCardToPlayerHand(player, card) {
    player.hand.push(card);
}

function scorePairForPlayer(player, card) {
    player.score.push(card);
    endRound();
}

function scoreLowestCard() {
    players[turnCursor].score.push(popLowestCardInPlay());
    endRound();
}

function popLowestCardInPlay() {
    const playerIndex = findPlayerWithLowestCard(players);
    let lowestCard = 11;
    let tempHand = [];
    while (players[playerIndex].hand.length > 0) {
        const card = players[playerIndex].hand.pop();
        if (card < lowestCard) {
            if (lowestCard < 11) {
                tempHand.push(lowestCard);
            }
            lowestCard = card;
        } else {
            tempHand.push(card);
        }
    }
    players[playerIndex].hand = tempHand;
    return lowestCard;
}

function discardAllCardsInPlay() {
    players.forEach((player) => {
        while (player.hand.length > 0) {
            discardPile.push(player.hand.pop());
        }
    });
}

function advanceTurnCursor() {
    turnCursor++;
    if (turnCursor >= players.length) {
        turnCursor = 0;
    }
}

function drawPileSmartPop() {
    if (drawPile.length === 0) {
        while (discardPile.length > 0) {
            drawPile.push(discardPile.pop());
        }
        shuffle(drawPile);
        burnFive();
    }
    return drawPile.pop();
}

function endRound() {
    disableHitFold();
    enableDeal()
}

/* Event Handlers */
function hit() {
    dealCardToPlayer();
    render();
}

function fold() {
    scoreLowestCard();
    render();
}

function deal() {
    discardAllCardsInPlay();

    dealToEveryone();
    lowestGoesFirst();
    enableHitFold()
    disableDeal();
    render();
}

function newGame() {
    resetPlayers();
    resetDeck();
    burnFive();

    dealToEveryone();
    lowestGoesFirst();
    enableHitFold()
    disableDeal();
    render();
}

function toggleHide() {
    hide = !hide;
    render();
}

/* DOM Render */
function render() {
    renderDrawPile();
    renderDiscardPile();
    renderPlayers();
}

function renderDrawPile() {
    document.getElementById("drawPile").innerHTML = renderCards(drawPile, hide);
}

function renderDiscardPile() {
    document.getElementById("discardPile").innerHTML = renderCards(discardPile, hide);
}

function renderPlayers() {
    for (let i = 0; i < players.length; i++) {
        const playerElement = document.getElementById("player" + (i + 1));
        const bgColor = (turnCursor == i) ? "#f6e3ab" : "#b9c957";
        renderPlayer(playerElement, bgColor, players[i].name, players[i].score, players[i].hand);
    }
}

function renderPlayer(element, bgColor, name, score, hand) {
    if (element) {
        element.style.backgroundColor = bgColor;
        element.childNodes[1].innerHTML = name;
        element.childNodes[3].innerHTML = "Score: " + sumCards(score);
        element.childNodes[5].innerHTML = renderCards(hand, false);
    }
}

function disableDeal() {
    toggleButton(document.getElementById("dealBtn"), false);
}

function enableDeal() {
    toggleButton(document.getElementById("dealBtn"), true);
}

function disableHitFold() {
    toggleButton(document.getElementById("hitBtn"), false);
    toggleButton(document.getElementById("foldBtn"), false);
}

function enableHitFold() {
    toggleButton(document.getElementById("hitBtn"), true);
    toggleButton(document.getElementById("foldBtn"), true);
}

function toggleButton(button, enable) {
    if (enable) {
        button.disabled = false;
        button.style.backgroundColor = "#592793";
    } else {
        button.disabled = true;
        button.style.backgroundColor = "#666666";
    }
}

/* Utils */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function findPlayerWithLowestCard(playerList) {
    let lowestCard = 11;
    let player = 0;
    for (let i = 0; i < playerList.length; i++) {
        const lowestCardInHand = Math.min(...playerList[i].hand);
        if (lowestCardInHand < lowestCard) {
            lowestCard = lowestCardInHand;
            player = i;
        }
    }
    return player;
}

function renderCards(cards, hide) {
    let render = '';
    cards.forEach((card) => {
        face = hide ? '#' : card;
        render = render + '[' + face + '] '
    });
    return render;
}

function sumCards(cards) {
    return cards.reduce((a,b) => a + b, 0);
}