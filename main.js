// キャラクター情報を格納
let characters = {};
let currentCharacter = null;
let currentVoiceData = null;

// HTML要素の取得
const characterSelect = document.getElementById('character-select');
const characterImage = document.getElementById('character-image');
const speechBubble = document.getElementById('speech-bubble');
const background = document.getElementById('background');

// キャラクター選択変更時
characterSelect.addEventListener('change', () => {
    const selected = characterSelect.value;
    if (selected) {
        loadCharacterData(selected);
    }
});

// 初期化処理
function init() {
    const params = new URLSearchParams(window.location.search);
    const charFromURL = params.get('character');

    // キャラクター一覧を読み込む
    fetch('data/characters.json')
        .then(res => res.json())
        .then(data => {
            characters = data.characters;
            // プルダウンにキャラクターを追加
            data.characters.forEach(char => {
                const option = document.createElement('option');
                option.value = char.id;
                option.textContent = char.name;
                characterSelect.appendChild(option);
            });

            // URLにキャラ指定があれば初期選択
            if (charFromURL && characters.some(c => c.id === charFromURL)) {
                characterSelect.value = charFromURL;
                loadCharacterData(charFromURL);
            }
        })
        .catch(err => {
            console.error('キャラクター一覧の読み込みに失敗しました:', err);
        });
}

// キャラクターのJSONデータを読み込み
function loadCharacterData(characterId) {
    fetch(`data/${characterId}.json`)
        .then(res => res.json())
        .then(data => {
            currentCharacter = characterId;
            currentVoiceData = data;
            updateVisuals();
        })
        .catch(err => {
            console.error(`${characterId}.json の読み込みに失敗しました:`, err);
        });
}

// 現在の時刻と天気（仮）に応じたセリフと画像を設定
function updateVisuals() {
    const date = new Date();
    const hour = date.getHours();
    const day = date.getDay();
    const timeZone = getTimeZone(hour);
    const weather = "sunny"; // 天気APIが未実装のため仮設定

    const key = `${timeZone}_${weather}_${day}`;
    const voiceEntry = currentVoiceData.voiceLines[key] || currentVoiceData.voiceLines["default"];

    // 表情・背景パスを構築
    const imagePath = `images/${currentCharacter}_${voiceEntry.expression}.png`;
    const bgPath = `images/${voiceEntry.background}.png`;

    // 更新
    characterImage.src = imagePath;
    background.src = bgPath;
    speechBubble.textContent = voiceEntry.text;
}

// 時間帯の区分を返す
function getTimeZone(hour) {
    if (hour >= 5 && hour < 7) return "early_morning";
    if (hour >= 7 && hour < 10) return "morning";
    if (hour >= 10 && hour < 15) return "afternoon";
    if (hour >= 15 && hour < 18) return "evening";
    if (hour >= 18 && hour < 23) return "night";
    return "midnight";
}

init();
