const grid = document.getElementById("grid");
const startBtn = document.getElementById("start-btn");

let audioUnlocked = true;
let currentAudio = null;
let currentIndex = 0;
let hoverWord = null;
let hoverStart = 0;
let lastDecodedWord = null;
let lastDecodeTime = 0;

const HOVER_CONFIRM_MS = 75;
const DECODE_COOLDOWN_MS = 55;

const items = [
  {
    word: "에스트라공",
    qr: "assets/qr_images/01_estragon.png",
    audio: "assets/GODOT_voice/01_에스트라공.mp3"
  },
  {
    word: "럭키",
    qr: "assets/qr_images/02_lucky.png",
    audio: "assets/GODOT_voice/02_럭키.mp3"
  },
  {
    word: "블라디미르",
    qr: "assets/qr_images/03_vladimir.png",
    audio: "assets/GODOT_voice/03_블라디미르.mp3"
  },
  {
    word: "쓰다",
    qr: "assets/qr_images/04_wear.png",
    audio: "assets/GODOT_voice/04_쓰다.mp3"
  },
  {
    word: "모자",
    qr: "assets/qr_images/05_hat.png",
    audio: "assets/GODOT_voice/05_모자.mp3"
  },
  {
    word: "벗다",
    qr: "assets/qr_images/06_remove.png",
    audio: "assets/GODOT_voice/06_벗다.mp3"
  },
  {
    word: "주다",
    qr: "assets/qr_images/07_give.png",
    audio: "assets/GODOT_voice/07_주다.mp3"
  },
  {
    word: "매만지다",
    qr: "assets/qr_images/08_handle.png",
    audio: "assets/GODOT_voice/08_매만지다.mp3"
  },
  {
    word: "받다",
    qr: "assets/qr_images/09_receive.png",
    audio: "assets/GODOT_voice/09_받다.mp3"
  }
];

const words = items.map(item => item.word);

const itemByWord = {};
items.forEach(item => {
  itemByWord[item.word] = item;
});

const commands = [
  ["에스트라공", "블라디미르", "모자", "받다"],
  ["블라디미르", "럭키", "모자", "매만지다"],
  ["에스트라공", "블라디미르", "모자", "받다", "쓰다", "블라디미르", "주다"],
  ["블라디미르", "에스트라공", "모자", "받다"],
  ["에스트라공", "블라디미르", "모자", "매만지다"],
  ["블라디미르", "럭키", "모자", "벗다", "에스트라공", "모자", "쓰다"],
  ["럭키", "모자", "에스트라공", "주다"],
  ["에스트라공", "럭키", "모자", "쓰다"],
  ["블라디미르", "에스트라공", "모자", "매만지다"],
  ["에스트라공", "블라디미르", "모자", "벗다"],
  ["럭키", "모자", "쓰다"],
  ["블라디미르", "모자", "블라디미르", "주다"],
  ["블라디미르", "모자", "받다"],
  ["에스트라공", "럭키", "모자", "매만지다"],
  ["블라디미르", "에스트라공", "모자", "벗다"],
  ["모자", "쓰다","에스트라공", "모자", "에스트라공", "주다"],
  ["에스트라공", "모자", "받다"],
  ["블라디미르", "모자", "매만지다"],
  ["에스트라공", "럭키", "모자", "벗다"],
  ["모자", "쓰다"],
  ["럭키", "모자", "블라디미르", "주다"],
  ["블라디미르", "럭키", "모자", "받다"],
  ["에스트라공", "모자", "매만지다"],
  ["블라디미르", "모자", "벗다"],
  ["럭키", "모자", "쓰다"],
  ["모자", "에스트라공", "주다"],
  ["에스트라공", "블라디미르", "모자", "받다"],
  ["블라디미르", "럭키", "모자", "매만지다"],
  ["에스트라공", "블라디미르", "모자", "블라디미르","주다"],
  ["블라디미르", "받다", "에스트라공", "주다"],
  ["에스트라공", "받다", "블라디미르", "주다"],
];

const events = commands.flatMap(line =>
  line.map(word => ({
    word,
    line: line.join(", ")
  }))
);

const terminals = {};

startBtn.addEventListener("click", () => {
  audioUnlocked = true;
  startBtn.style.display = "none";
});

function buildGrid() {
  items.forEach(item => {
    const cell = document.createElement("div");
    cell.className = "cell";

    const qr = document.createElement("img");
    qr.className = "qr";
    qr.src = item.qr;
    qr.alt = item.word;
    qr.dataset.word = item.word;

    const terminal = document.createElement("div");
    terminal.className = "terminal";
    terminal.textContent = `${item.word}\n-----`;

    terminals[item.word] = terminal;

    qr.addEventListener("mouseenter", () => {
      hoverWord = item.word;
      hoverStart = performance.now();
    });

    qr.addEventListener("mouseleave", () => {
      hoverWord = null;
    });

    cell.appendChild(qr);
    cell.appendChild(terminal);
    grid.appendChild(cell);
  });
}

function clearTerminals() {
  items.forEach(item => {
    terminals[item.word].textContent = `${item.word}\n-----`;
  });
}

function playVoice(word) {
  if (!audioUnlocked) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = new Audio(itemByWord[word].audio);
  currentAudio.play().catch(() => {});
}

function decode(word) {
  const expected = events[currentIndex];
  if (!expected) return;

  if (word !== expected.word) return;

  const now = performance.now();

  if (
    word === lastDecodedWord &&
    now - lastDecodeTime < DECODE_COOLDOWN_MS
  ) {
    return;
  }

  clearTerminals();

  terminals[word].innerHTML =
    `${word}\n-----\n<span class="decoded">decoded:${word}</span>`;

  playVoice(word);

  console.log(`decoded:${word} | ${expected.line}`);

  currentIndex++;
  lastDecodedWord = word;
  lastDecodeTime = now;
}

function loop() {
  if (hoverWord) {
    const elapsed = performance.now() - hoverStart;

    if (elapsed >= HOVER_CONFIRM_MS) {
      decode(hoverWord);
    }
  }

  requestAnimationFrame(loop);
}

buildGrid();
loop();