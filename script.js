// ゲーム状態管理
let gameState = {
    isSpinning: false
};

// ナンバープレートのデータ
const regions = ['品川', '横浜', '名古屋', '大阪', '神戸', '京都', '福岡', '札幌', '仙台', '広島'];
const classifications = ['300', '400', '500', '700', '800'];
const hiraganas = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ'];

// DOM要素
const gameContainer = document.getElementById('game-container');
const spinBtn = document.getElementById('spin-btn');
const resultMessage = document.getElementById('result-message');

// ナンバープレート要素
const regionElement = document.getElementById('region');
const classificationElement = document.getElementById('classification');
const hiraganaElement = document.getElementById('hiragana');
const digit1 = document.getElementById('digit1');
const digit2 = document.getElementById('digit2');
const digit3 = document.getElementById('digit3');
const digit4 = document.getElementById('digit4');

// イベントリスナー
spinBtn.addEventListener('click', handleSpin);

// 初期化 - 数字要素を設定
document.addEventListener('DOMContentLoaded', () => {
    [digit1, digit2, digit3, digit4].forEach(digit => {
        const inner = document.createElement('div');
        inner.className = 'number-digit-inner';
        
        // モバイルかどうかを判定
        const isMobile = window.innerWidth <= 480;
        const digitHeight = isMobile ? 55 : 80;
        
        // 0-9を15回繰り返して連続的なスクロールを作る
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j <= 9; j++) {
                const span = document.createElement('span');
                span.textContent = j;
                span.style.display = 'flex';
                span.style.height = digitHeight + 'px';
                span.style.alignItems = 'center';
                span.style.justifyContent = 'center';
                inner.appendChild(span);
            }
        }
        
        digit.innerHTML = '';
        digit.appendChild(inner);
        inner.style.top = '0';
    });
});

// スピン処理
async function handleSpin() {
    if (gameState.isSpinning) return;
    
    gameState.isSpinning = true;
    spinBtn.disabled = true;
    resultMessage.textContent = '';
    resultMessage.className = 'result-message';
    removeAllEffects();
    
    // 20%で当たり、10%でニアミス、70%で通常
    const rand = Math.random();
    const isWin = rand < 0.2;  // 20%で当たり
    const isNearMiss = rand >= 0.2 && rand < 0.3;  // 10%でニアミス
    
    // 結果を先に決定
    let results;
    if (isWin) {
        // 当たり：4つ全部同じ数字
        const winDigit = getRandomDigit();
        results = {
            region: getRandomElement(regions),
            classification: getRandomElement(classifications),
            hiragana: getRandomElement(hiraganas),
            digits: [winDigit, winDigit, winDigit, winDigit]
        };
    } else if (isNearMiss) {
        // ニアミス：最初3つが同じ、最後だけ違う
        const mainDigit = getRandomDigit();
        // 最後の数字は必ず1つずらす（9の次は0ではなく、違う数字にする）
        let lastDigit;
        do {
            lastDigit = getRandomDigit();
        } while (lastDigit === mainDigit);
        
        results = {
            region: getRandomElement(regions),
            classification: getRandomElement(classifications),
            hiragana: getRandomElement(hiraganas),
            digits: [mainDigit, mainDigit, mainDigit, lastDigit]
        };
    } else {
        results = {
            region: getRandomElement(regions),
            classification: getRandomElement(classifications),
            hiragana: getRandomElement(hiraganas),
            digits: [
                getRandomDigit(),
                getRandomDigit(),
                getRandomDigit(),
                getRandomDigit()
            ]
        };
    }
    
    // 地域、分類、ひらがなは即座に変更
    regionElement.textContent = results.region;
    classificationElement.textContent = results.classification;
    hiraganaElement.textContent = results.hiragana;
    
    // 数字のスロット回転を開始
    const digitElements = [digit1, digit2, digit3, digit4];
    
    // 全ての数字を回転開始
    digitElements.forEach(digit => {
        const inner = digit.querySelector('.number-digit-inner');
        inner.classList.add('rolling');
        // ランダムな初期位置
        const isMobile = window.innerWidth <= 480;
        const digitHeight = isMobile ? 55 : 80;
        const randomStart = Math.floor(Math.random() * 10) * digitHeight;
        inner.style.transform = `translateY(-${randomStart}px)`;
    });
    
    // 各数字を順番に停止
    for (let i = 0; i < digitElements.length; i++) {
        await sleep(700 + i * 300); // 0.7秒後から0.3秒間隔で停止
        
        const digit = digitElements[i];
        const inner = digit.querySelector('.number-digit-inner');
        const targetNumber = parseInt(results.digits[i]);
        
        // 回転を停止
        inner.classList.remove('rolling');
        
        if (isNearMiss && i === 3) {
            // 最後の数字でニアミス演出
            const isMobile = window.innerWidth <= 480;
            const digitHeight = isMobile ? 55 : 80;
            const setHeight = digitHeight * 10;
            
            // まず最初の3つと同じ数字の位置まで行く
            const almostNumber = parseInt(results.digits[0]);
            const almostPosition = -(almostNumber * digitHeight + 4 * setHeight);
            
            // ゆっくりとした動きで止まりそうになる
            inner.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
            inner.style.transform = `translateY(${almostPosition}px)`;
            
            await sleep(600);
            
            // そのまま少しだけずれて実際の数字で止まる
            const targetPosition = -(targetNumber * digitHeight + 4 * setHeight);
            inner.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            inner.style.transform = `translateY(${targetPosition}px)`;
            
            // バウンス演出を追加
            setTimeout(() => {
                digit.classList.add('near-miss');
                setTimeout(() => {
                    digit.classList.remove('near-miss');
                }, 800);
            }, 400);
        } else {
            // 通常の停止（バウンス効果）
            const isMobile = window.innerWidth <= 480;
            const digitHeight = isMobile ? 55 : 80;
            const setHeight = digitHeight * 10;
            const setNumber = 4 + Math.floor(Math.random() * 3); // 4-6セット目を使用
            const targetPosition = -(targetNumber * digitHeight + setNumber * setHeight);
            
            // 少しオーバーランしてから戻る
            inner.style.transition = 'transform 0.6s cubic-bezier(0.17, 0.67, 0.3, 1.33)';
            inner.style.transform = `translateY(${targetPosition}px)`;
            
            // バウンスアニメーション追加
            setTimeout(() => {
                digit.classList.add('bounce-stop');
                setTimeout(() => {
                    digit.classList.remove('bounce-stop');
                }, 600);
            }, 100);
        }
    }
    
    // 全ての数字が停止してから結果判定
    await sleep(isNearMiss ? 1000 : 700);
    
    // ニアミスの場合は特別なメッセージ
    if (isNearMiss) {
        resultMessage.textContent = 'うわー！あと少しだった！次は絶対揃うよ！';
        resultMessage.className = 'result-message win';
    }
    
    // スコア計算
    calculateScore(results, isNearMiss);
    
    gameState.isSpinning = false;
    spinBtn.disabled = false;
}

// スコア計算（4つ揃った時のみ当たり）
function calculateScore(results, wasNearMiss) {
    // ニアミスの場合はスコア計算をスキップ
    if (wasNearMiss) {
        return;
    }
    
    // 4つ全部同じ数字かチェック
    const allDigitsSame = results.digits.every(d => d === results.digits[0]);
    
    if (allDigitsSame) {
        // 全部同じ数字（ジャックポット）
        const messages = [
            'すごい！！！完璧に揃った！！！',
            '天才！！！奇跡の4つ揃い！！！',
            '信じられない！！！神の手！！！',
            '最高！！！今日は最高の日！！！',
            'やったー！！！大大大当たり！！！'
        ];
        
        let message = messages[Math.floor(Math.random() * messages.length)];
        
        // 特定の数字で特別メッセージ
        if (results.digits[0] === '7') {
            message = 'ラッキーセブン！！！運命の数字！！！';
        } else if (results.digits[0] === '1') {
            message = 'オール1！！！ナンバーワン！！！';
        } else if (results.digits[0] === '0') {
            message = 'ゼロフォー！！！奇跡のゼロ！！！';
        } else if (results.digits[0] === '8') {
            message = 'エイトエイト！！！無限の可能性！！！';
        }
        
        resultMessage.textContent = message;
        resultMessage.className = 'result-message jackpot';
        
        // 全力で祝福！
        createFireworks();
        createConfetti();
        playJackpotSound();
    } else {
        // 揃わなかった時のポジティブで元気づけるメッセージ
        const encouragingMessages = [
            'おしい！次はきっと揃うよ！',
            'いい感じだった！もう一回！',
            'すごく惜しかった！次こそ！',
            'いいぞいいぞ！その調子！',
            'もうちょっとで揃いそう！',
            '運が温まってきた！',
            'だんだん近づいてる！',
            '次は大当たりの予感！',
            'ナイスチャレンジ！',
            'その意気だ！頑張って！'
        ];
        
        // 数字の組み合わせによる特別メッセージ
        const digits = results.digits.join('');
        if (digits.includes('777')) {
            resultMessage.textContent = 'おお！777が入ってる！ラッキー！';
        } else if (digits === '1234' || digits === '2345' || digits === '3456') {
            resultMessage.textContent = 'きれいな連番！いいことありそう！';
        } else if (digits.match(/(\d)\1{2}/)) {
            resultMessage.textContent = 'すごい！3つも揃ってる！あと1つ！';
        } else {
            resultMessage.textContent = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        }
        
        resultMessage.className = 'result-message';
    }
}

// 花火エフェクト
function createFireworks() {
    const container = document.createElement('div');
    container.className = 'fireworks';
    document.body.appendChild(container);
    
    // 複数の花火を作成
    for (let f = 0; f < 8; f++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5;
            
            // 花火の粒子を作成
            for (let i = 0; i < 40; i++) {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = x + 'px';
                firework.style.top = y + 'px';
                
                const angle = (Math.PI * 2 * i) / 40;
                const velocity = 150 + Math.random() * 150;
                const xVel = Math.cos(angle) * velocity;
                const yVel = Math.sin(angle) * velocity;
                
                firework.style.setProperty('--x', xVel + 'px');
                firework.style.setProperty('--y', yVel + 'px');
                // トリコロールカラーの花火
                const colors = ['#0055A4', '#EF4135', '#FFFFFF'];
                firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                firework.style.boxShadow = `0 0 10px ${colors[Math.floor(Math.random() * colors.length)]}`;
                
                container.appendChild(firework);
            }
        }, f * 200);
    }
    
    setTimeout(() => container.remove(), 4000);
}

// 紙吹雪エフェクト
function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    // トリコロールカラーの紙吹雪
    const colors = ['#0055A4', '#EF4135', '#FFFFFF'];
    
    // たくさんの紙吹雪を作成
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
        confetti.style.transform = `scale(${0.5 + Math.random() * 0.5})`;
        
        container.appendChild(confetti);
    }
    
    setTimeout(() => container.remove(), 6000);
}

// ジャックポット音（視覚的な表現）
function playJackpotSound() {
    const plate = document.querySelector('.license-plate');
    plate.style.animation = 'jackpotGlow 0.5s ease-in-out 8';
    
    setTimeout(() => {
        plate.style.animation = '';
    }, 4000);
}

// エフェクトを全て削除
function removeAllEffects() {
    document.querySelectorAll('.fireworks, .confetti-container').forEach(el => el.remove());
}

// ユーティリティ関数
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDigit() {
    return Math.floor(Math.random() * 10).toString();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

