// 流程
// 音效設定 + 動畫特效：飄落葉子
// -> 切換遊戲畫面 -> 計時器 + 遊戲流程 + 難度規劃 + renderRound + 點擊處理 
// -> 切換結束畫面 ->  評語系統


const GAME_DURATION = 60;   // 遊戲總時長
const RING_CIRC = 169.65; // 2 * π * 27 -> 計時環特效

// 簡化取得ID的 function
const $ = (id) => document.getElementById(id);

// 切換畫面
const screens = {
    intro: $('screen-intro'), // 開始畫面
    game: $('screen-game'), // 遊戲畫面
    result: $('screen-result'), // 結束畫面
};

// 狀態
const state = {
    level: 1,           // 當前關卡（從 1 開始，無上限）
    score: 0,           // 答對數
    attempts: 0,        // 總嘗試數
    gameTime: GAME_DURATION,       // 計時時間
    countdownId: null,  // 倒計時function
    soundOn: true,
    audioCtx: null,
    audioSupported: false,  // 啟動時由 initAudioSupport() 設定
    highestLevel: 1,
};

// 音效 
const sound = {
    correct: () => setSound([880, 1320], 0.22, 'sine', 0.12),       // 叮咚
    wrong: () => setSound([180, 140], 0.18, 'triangle', 0.10),    // 嗯…
    tick: () => setSound([1200], 0.05, 'sine', 0.06),             // 倒數警告
    start: () => setSound([523, 659, 784], 0.15, 'sine', 0.10),   // 開始
    end: () => setSound([784, 659, 523, 392], 0.20, 'sine', 0.10), // 結束
};

// 評語等級設定（依分數由高到低排列）
const GRADE_TIERS = [
    {
        minScore: 25,
        title: '森之賢者 ✦',
        comment: '你的眼睛像清晨的露珠一樣澄澈，連風的顏色都看得見。',
        fill: '#D4A55E', stroke: '#B8893A', symbol: '✦',
    },
    {
        minScore: 18,
        title: '魔女快遞員',
        comment: '色彩在你眼中井然有序，琪琪會邀請你一起送貨。',
        fill: '#E8A87C', stroke: '#C97D4F', symbol: '✿',
    },
    {
        minScore: 12,
        title: '貓巴士乘客',
        comment: '不錯不錯，繼續搭著貓巴士在森林裡冒險吧。',
        fill: '#7A9B6E', stroke: '#5A7B4E', symbol: '❀',
    },
    {
        minScore: 6,
        title: '初訪森林的旅人',
        comment: '森林的秘密還藏著很多，下次再來探索吧。',
        fill: '#A8C8E0', stroke: '#6B8CAE', symbol: '✤',
    },
    {
        minScore: 0,
        title: '迷路的小煤炭',
        comment: '別擔心，煤炭精靈也常常找不到回家的路。再試一次吧！',
        fill: '#6B7563', stroke: '#3E4A3D', symbol: '◉',
    },
];


// ----- 音效 (Web Audio API) -----
// 初始化音效支援度
function initAudioSupport() {
    state.audioSupported = !!(window.AudioContext || window.webkitAudioContext);
    if (!state.audioSupported) {
        const btn = $('soundToggle');
        btn.classList.add('disabled');
        btn.setAttribute('title', '您的瀏覽器不支援音效');
        btn.setAttribute('aria-label', '您的瀏覽器不支援音效');
        state.soundOn = false;
        // 圖示切換為靜音
        $('soundOnIcon').classList.add('hidden');
        $('soundOffIcon').classList.remove('hidden');
    }
}
// 設定音效
function setSound(freqs, duration = 0.18, type = 'sine', volume = 0.15) {
    if (!state.soundOn) return;
    if (!state.audioSupported) return;

    // 取得瀏覽器音效程式，Web Audio API
    if (!state.audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AC();
    }

    const ctx = state.audioCtx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    // 設定音效
    const now = ctx.currentTime;
    freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(volume, now + i * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + duration);
    });
}
// 音效開關
function toggleSound() {
    if (!checkSound()) return;

    state.soundOn = !state.soundOn;
    $('soundOnIcon').classList.toggle('hidden', !state.soundOn);
    $('soundOffIcon').classList.toggle('hidden', state.soundOn);
    if (state.soundOn) sound.tick();
}
// 確認是否支援音效
function checkSound() {
    if (!state.audioSupported) {
        showToast('您的瀏覽器不支援音效');
        return false;
    }
    return true;
}
// Toast 提示
function showToast(message) {
    // 避免重複顯示
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
}


// ----- 畫面切換 -----
function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => {
        el.classList.toggle('hidden', k !== name);
        if (k === name) {
            el.classList.remove('fade-in');
            void el.offsetWidth;
            el.classList.add('fade-in');
        }
    });
}


// ----- 計時器 -----
function updateTimer() {
    $('timerText').textContent = state.gameTime;
    const ring = $('timerRing');
    const fg = $('ringFg');
    const ratio = state.gameTime / GAME_DURATION;
    fg.style.strokeDashoffset = RING_CIRC * (1 - ratio);
    ring.classList.toggle('warning', state.gameTime <= 20 && state.gameTime > 10);
    ring.classList.toggle('danger', state.gameTime <= 10);
    if (state.gameTime <= 5 && state.gameTime > 0) sound.tick();
}
function startTimer() {
    state.gameTime = GAME_DURATION;   // 初始化遊戲時間
    updateTimer();
    state.countdownId = setInterval(() => {
        state.gameTime--;
        updateTimer();
        if (state.gameTime <= 0) {
            clearInterval(state.countdownId);
            endGame();
        }
    }, 1000);
}

// ----- 遊戲流程 -----
function startGame() {
    // 初始化
    state.level = 1;
    state.score = 0;
    state.attempts = 0;
    state.highestLevel = 1;
    $('scoreDisplay').textContent = '0';

    // 切換遊戲畫面
    showScreen('game');
    sound.start();
    startTimer();

    // 建立方塊
    renderRound();
}
function endGame() {
    if (state.countdownId) clearInterval(state.countdownId);
    sound.end();

    // 統計
    $('finalScore').textContent = state.score;
    $('finalLevel').textContent = state.highestLevel;
    const acc = state.attempts === 0 ? 0 : Math.round((state.score / state.attempts) * 100);
    $('finalAccuracy').textContent = acc + '%';

    // 評語 + 獎章
    const { title, comment, medal } = grade(state.score);
    $('resultTitle').textContent = title;
    $('resultComment').textContent = comment;
    $('medalSvg').innerHTML = medal;


    // 切換結算畫面
    showScreen('result');
}

// ----- 難度規劃 -----
// 根據 level 取得 grid size 與顏色差距
function getDifficulty(level) {
    // grid 大小漸增：1-3=3x3, 4-6=4x4, 7-10=5x5, 11-14=6x6, 15+=8x8
    let size, hueOffset, lightnessNoise = 0;
    if (level <= 3) { size = 3; hueOffset = 60 - (level - 1) * 8; }   // 60, 52, 44
    else if (level <= 6) { size = 4; hueOffset = 30 - (level - 4) * 6; }   // 30, 24, 18
    else if (level <= 10) { size = 5; hueOffset = 16 - (level - 7) * 2.5; } // 16, 13.5, 11, 8.5
    else if (level <= 14) { size = 6; hueOffset = 8 - (level - 11) * 1.2; lightnessNoise = 1.5; } // 8, 6.8, 5.6, 4.4
    else { size = Math.min(8, 6 + Math.floor((level - 15) / 3)); hueOffset = Math.max(2, 4 - (level - 15) * 0.3); lightnessNoise = 2.5; }
    hueOffset = Math.max(2, hueOffset);
    return { size, hueOffset, lightnessNoise };
}

// HSL → CSS
function hsl(h, s, l) { return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`; }

// 隨機選擇色相基準（紅綠軸 / 藍黃軸 / 混合）
function pickBaseHue(level) {
    // 30% 紅綠 (0-60 或 90-150), 30% 藍黃 (180-240 或 50-80), 40% 隨機
    const r = Math.random();
    if (r < 0.3) return Math.random() < 0.5 ? rand(0, 30) : rand(90, 150);
    if (r < 0.6) return Math.random() < 0.5 ? rand(50, 80) : rand(200, 250);
    return rand(0, 360);
}

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }


// ----- 渲染題目 -----
function renderRound() {
    const { size, hueOffset, lightnessNoise } = getDifficulty(state.level);
    const grid = $('grid');
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    grid.innerHTML = '';

    const total = size * size;
    const oddIndex = randInt(0, total - 1);

    // 色彩：固定 S, 固定基本 L，異色相位移
    const baseH = pickBaseHue(state.level);
    const baseS = rand(45, 65);
    const baseL = rand(55, 70);
    const sign = Math.random() < 0.5 ? -1 : 1;
    const oddH = (baseH + sign * hueOffset + 360) % 360;

    for (let i = 0; i < total; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        let h, l;
        if (i === oddIndex) {
            h = oddH;
            l = baseL;
        } else {
            h = baseH;
            l = baseL + (Math.random() - 0.5) * 2 * lightnessNoise;
        }
        cell.style.background = hsl(h, baseS, l);
        cell.dataset.idx = i;
        cell.addEventListener('click', () => handleClick(i === oddIndex, cell));
        cell.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        grid.appendChild(cell);
    }

    $('levelDisplay').textContent = state.level;
    state.highestLevel = Math.max(state.highestLevel, state.level);

    // 提示文字
    const hints = [
        '在森林深處仔細看…',
        '煤炭精靈在看著你…',
        '貓巴士不會等你太久…',
        '風的痕跡，藏在某一格',
        '不要被龍貓的尾巴騙了',
        '湯婆婆說：眼睛要亮一點',
        '魔女的快遞需要好眼力',
        '無臉男也分不出來嗎？',
    ];
    $('diffHint').textContent = hints[Math.floor(Math.random() * hints.length)];
}

// ----- 點擊處理 -----
let isAnimating = false;
function handleClick(isCorrect, cell) {
    if (isAnimating) return;
    isAnimating = true;
    state.attempts++;

    const wrap = $('gridWrap');
    if (isCorrect) {
        state.score++;
        $('scoreDisplay').textContent = state.score;
        cell.classList.add('correct');
        wrap.classList.add('flash-green');
        sound.correct();
        setTimeout(() => {
            wrap.classList.remove('flash-green');
            state.level++;
            isAnimating = false;
            renderRound();
        }, 380);
    } else {
        wrap.classList.add('shake', 'flash-red');
        sound.wrong();
        setTimeout(() => {
            wrap.classList.remove('shake', 'flash-red');
            isAnimating = false;
            renderRound();   // 答錯也下一題
        }, 320);
    }
}


// ----- 評語系統 -----
function grade(score) {
    const tier = GRADE_TIERS.find(t => score >= t.minScore);
    return {
        title: tier.title,
        comment: tier.comment,
        medal: medalSvg(tier.fill, tier.stroke, tier.symbol),
    };
}
function medalSvg(fill, stroke, symbol) {
    return `
    <circle cx="44" cy="44" r="36" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    <circle cx="44" cy="44" r="30" fill="none" stroke="${stroke}" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="44" y="54" font-family="Klee One, serif" font-size="32" font-weight="600" text-anchor="middle" fill="${stroke}">${symbol}</text>
    <path d="M20 44 Q 8 50, 12 64 L 24 60 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M68 44 Q 80 50, 76 64 L 64 60 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>
  `;
}


// ----- 動畫特效：飄落葉子 -----
function spawnLeaves() {
    const leafSvg = `<svg class="leaf" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 Q 5 8, 5 14 Q 5 20, 12 22 Q 19 20, 19 14 Q 19 8, 12 2 Z" fill="#7A9B6E" opacity="0.7"/>
    <path d="M12 4 L 12 20" stroke="#5A7B4E" stroke-width="0.8"/>
  </svg>`;
    const leafSvg2 = `<svg class="leaf" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 Q 5 8, 5 14 Q 5 20, 12 22 Q 19 20, 19 14 Q 19 8, 12 2 Z" fill="#E8A87C" opacity="0.7"/>
    <path d="M12 4 L 12 20" stroke="#C97D4F" stroke-width="0.8"/>
  </svg>`;
    const leafSvg3 = `<svg class="leaf" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 Q 5 8, 5 14 Q 5 20, 12 22 Q 19 20, 19 14 Q 19 8, 12 2 Z" fill="#D4A55E" opacity="0.7"/>
    <path d="M12 4 L 12 20" stroke="#B8893A" stroke-width="0.8"/>
  </svg>`;
    const variants = [leafSvg, leafSvg2, leafSvg3];

    setInterval(() => {
        const wrap = document.createElement('div');
        wrap.innerHTML = variants[Math.floor(Math.random() * 3)];
        const leaf = wrap.firstChild;
        leaf.style.left = Math.random() * 100 + 'vw';
        leaf.style.animationDuration = (14 + Math.random() * 10) + 's';
        leaf.style.width = (16 + Math.random() * 12) + 'px';
        document.body.appendChild(leaf);
        setTimeout(() => leaf.remove(), 25000);
    }, 3500);
}

// ----- 事件綁定 -----
$('btnStart').addEventListener('click', startGame);
$('btnRetry').addEventListener('click', startGame);
$('btnHome').addEventListener('click', () => showScreen('intro'));
$('soundToggle').addEventListener('click', toggleSound);

initAudioSupport();
spawnLeaves();