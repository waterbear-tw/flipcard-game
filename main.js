//重點： 狀態管理 MVC架構
/*//程式觀念/技巧：1. function someFunction(...value){} 可以將數個參數結合成array，傳入function。
                   用在『不確定將傳入一個或數個參數時』，像是本案使用pairCard和flipCard的狀況。
                   若傳入的值是array，可以先解開=> caller(){ someFunction(...anArr);   }
                    arr被...解開成數的值，再進入someFunction作為value，再依照value的...特性變成array >
                 2. */

const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

////--------view--------////
const view = {
  getCardElement(index) {
    return `<div class="card back" data-index=${index}></div>`;
  },
  getCardContent(index) {
    const number = this.transferNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p class="number">${number}</p>
        <img src=${symbol} />
        <p class="number">${number}</p>
      `;
  },
  displayCards(arrOfIndexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = arrOfIndexes
      .map((index) => this.getCardElement(index))
      .join(" ");
  },
  transferNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  flipCards(...cards) {
    cards.map((card) => {
      const cardValue = Number(card.dataset.index);
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(cardValue);
        return;
      }
      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").innerText = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener("animationend", (event) => {
        event.target.classList.remove("wrong"), { once: true }; ////******////
      });
    });
  },
  showGameFinished() {
    const header = document.querySelector("#header");
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
        <p class="completed-title">Congrats!</p>
        <p class="completed-score">Score:${model.score}</p>
        <p class="completed-times">You've tried: ${model.times} times</p>
      `;
    header.before(div);
  },
};
////--------model---------////
const model = {
  score: 0,
  times: 0,
  revealedCards: [],
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  }, ////******////
  pairCards(...cards) {
    cards.map((card) => card.classList.add("paired"));
  },
};
////---------controler---------////
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    const indexesArr = utility.getRandomNumArray(52);
    view.displayCards(indexesArr);
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) return;
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        return;
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.times);
        view.flipCards(card);
        model.revealedCards.push(card);
        //判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //成功
          this.currentState = GAME_STATE.CardsMatched;
          view.renderScore((model.score += 10));
          model.pairCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.score === 260) {
            console.log("finished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards); ////******////
          setTimeout(this.resetCard, 1000);
          this.currentState = GAME_STATE.FirstCardAwaits;
        }
    }
  },
  resetCard() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

const utility = {
  // Fisher-Yates Shuffle Algorithm
  getRandomNumArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1)); //+1的洗牌模式才真實（不排除洗到相同位置）
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

controller.generateCards(); //MVC -> 用controller呼叫

//這是nodeList array-like可以forEach但不能map
document.querySelectorAll(".card").forEach((card) =>
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  })
);
