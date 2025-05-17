// --- Configuration: Platform Dependent Characters and their replacements ---
const platformCharsDictionary = {
    // 丸数字
    "①": "(1)", "②": "(2)", "③": "(3)", "④": "(4)", "⑤": "(5)",
    "⑥": "(6)", "⑦": "(7)", "⑧": "(8)", "⑨": "(9)", "⑩": "(10)",
    "⑪": "(11)", "⑫": "(12)", "⑬": "(13)", "⑭": "(14)", "⑮": "(15)",
    "⑯": "(16)", "⑰": "(17)", "⑱": "(18)", "⑲": "(19)", "⑳": "(20)",

    // ローマ数字
    "Ⅰ": "I", "Ⅱ": "II", "Ⅲ": "III", "Ⅳ": "IV", "Ⅴ": "V",
    "Ⅵ": "VI", "Ⅶ": "VII", "Ⅷ": "VIII", "Ⅸ": "IX", "Ⅹ": "X",

    // 単位など
    "㎜": "mm", "㎝": "cm", "㎞": "km", "㎎": "mg", "㎏": "kg", "㏄": "cc",
    "㍉": "ミリ", "㍍": "メートル", "㌔": "キロ", "㍻": "平成", "㍼": "昭和",
    "㍽": "大正", "㍾": "明治", "㋿": "令和",

    // 企業・商業記号
    "㈱": "(株)", "㈲": "(有)", "㈹": "(代)", "㍿": "株式会社",

    // 記号系
    "№": "No.", "℡": "TEL", "㍂": "アパート", "㍇": "マンション",

    // 異体字
    "髙": "高", "﨑": "崎", "濵": "浜", "桒": "桑", "塚": "塚",

    // ★追加：伏せ字や環境依存になりがちな記号（明示的に置換定義）
    "○": "◯",     // 通常の丸
    "×": "X",     // 全角バツ（用途によっては "x" に）
    "△": "▲",     // 三角（用途によるが環境によって崩れやすい）
    "◇": "◆",     // 菱形記号（視認性調整）
    "・": "-",     // 中黒を安全なハイフンへ（場合によっては半角スペースでも可）
    "　": " ",     // 全角スペース → 半角スペース
};


// --- DOM Elements ---
const inputText = document.getElementById('inputText');
const scanButton = document.getElementById('scanButton');
const replaceAllButton = document.getElementById('replaceAllButton');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const resultsSummary = document.getElementById('resultsSummary');
const detectedCharsList = document.getElementById('detectedCharsList');
const darkModeToggle = document.getElementById('darkModeToggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
const messageBox = document.getElementById('messageBox');

let detectedCharsMap = new Map();

// --- Dark Mode ---
function updateThemeIcons() {
    if (document.querySelector('html').classList.contains('dark')) {
        themeToggleLightIcon.classList.remove('hidden');
        themeToggleDarkIcon.classList.add('hidden');
    } else {
        themeToggleLightIcon.classList.add('hidden');
        themeToggleDarkIcon.classList.remove('hidden');
    }
}
updateThemeIcons();

darkModeToggle.addEventListener('click', () => {
    const isDarkMode = document.querySelector('html').classList.toggle('dark');
    localStorage.setItem('darkMode', isDarkMode);
    updateThemeIcons();
});

// --- Utility: Show Message ---
function showMessage(text, type = 'success', duration = 3000) {
    messageBox.textContent = text;
    messageBox.className = 'show';
    if (type === 'success') {
        messageBox.classList.add('success');
    } else if (type === 'error') {
        messageBox.classList.add('error');
    }
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, duration);
}

// --- Scan Text Function ---
scanButton.addEventListener('click', () => {
    const text = inputText.value;
    detectedCharsMap.clear();
    detectedCharsList.innerHTML = '';

    if (!text.trim()) {
        resultsSummary.textContent = 'テキストが入力されていません。';
        replaceAllButton.disabled = true;
        return;
    }

    let foundCount = 0;
    for (const char of text) {
        if (platformCharsDictionary.hasOwnProperty(char)) {
            detectedCharsMap.set(char, (detectedCharsMap.get(char) || 0) + 1);
            foundCount++;
        }
    }

    if (detectedCharsMap.size > 0) {
        resultsSummary.textContent = `${detectedCharsMap.size} 種類の機種依存文字 (合計 ${foundCount} 個) が見つかりました。`;
        detectedCharsMap.forEach((count, char) => {
            const listItem = document.createElement('li');
            listItem.className = 'flex justify-between items-center p-2 text-sm text-gray-700 dark:text-gray-300';

            const charDisplay = document.createElement('span');
            charDisplay.className = 'font-mono bg-red-100 dark:bg-red-700 px-1 rounded';
            charDisplay.textContent = char;

            const replacementDisplay = document.createElement('span');
            replacementDisplay.className = 'font-mono bg-green-100 dark:bg-green-700 px-1 rounded';
            replacementDisplay.textContent = platformCharsDictionary[char];

            const countDisplay = document.createElement('span');
            countDisplay.className = 'text-xs text-gray-500 dark:text-gray-400';
            countDisplay.textContent = `${count}個`;

            listItem.appendChild(charDisplay);
            listItem.innerHTML += ` <span class="mx-1">→</span> `;
            listItem.appendChild(replacementDisplay);
            listItem.appendChild(countDisplay);
            detectedCharsList.appendChild(listItem);
        });
        replaceAllButton.disabled = false;
    } else {
        resultsSummary.textContent = '機種依存文字は見つかりませんでした。';
        replaceAllButton.disabled = true;
    }
});

// --- Replace All Function ---
replaceAllButton.addEventListener('click', () => {
    let currentText = inputText.value;
    let replacementMade = false;
    detectedCharsMap.forEach((count, char) => {
        const replacement = platformCharsDictionary[char];
        const regex = new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (currentText.includes(char)) {
            currentText = currentText.replace(regex, replacement);
            replacementMade = true;
        }
    });

    if (replacementMade) {
        inputText.value = currentText;
        showMessage('すべての機種依存文字を置換しました。', 'success');
        scanButton.click();
    } else {
        showMessage('置換対象の文字がありませんでした。', 'error');
    }
});

// --- Copy to Clipboard Function ---
copyButton.addEventListener('click', () => {
    if (inputText.value) {
        navigator.clipboard.writeText(inputText.value)
            .then(() => {
                showMessage('テキストをクリップボードにコピーしました!', 'success');
            })
            .catch(err => {
                showMessage('コピーに失敗しました: ' + err, 'error');
            });
    } else {
        showMessage('コピーするテキストがありません。', 'error');
    }
});

// --- Clear Function ---
clearButton.addEventListener('click', () => {
    inputText.value = '';
    detectedCharsList.innerHTML = '';
    resultsSummary.textContent = 'スキャン待機中です...';
    replaceAllButton.disabled = true;
    detectedCharsMap.clear();
    showMessage('入力と結果をクリアしました。', 'success');
});
