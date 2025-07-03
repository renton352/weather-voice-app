// DOM読み込み後に実行
window.addEventListener("DOMContentLoaded", () => {
    fetch("data/characters.json")
        .then((res) => res.json())
        .then((characters) => {
            setupCharacterSelect(characters);
            const defaultCharacter = Object.keys(characters)[0];
            loadCharacterData(defaultCharacter, characters[defaultCharacter]);
        });
});

// キャラクター選択肢の作成
function setupCharacterSelect(characters) {
    const select = document.getElementById("characterSelect");
    select.innerHTML = ""; // 初期化

    for (const name in characters) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }

    select.addEventListener("change", () => {
        const selectedName = select.value;
        loadCharacterData(selectedName, characters[selectedName]);
    });
}

function loadCharacterData(name, data) {
    const characterJsonPath = `data/${name}.json`;

    fetch(characterJsonPath)
        .then((res) => res.json())
        .then((characterData) => {
            updateScene(characterData);
        })
        .catch((err) => {
            console.error(`Failed to load ${characterJsonPath}`, err);
        });
}

function updateScene(characterData) {
    const time = getTimeSegment();
    const weather = getWeather();
    const day = getDayOfWeek();

    const expression = (
        characterData.expressionMap?.[time]?.[weather]?.[day] ||
        characterData.expressionMap?.[time]?.[weather]?.default ||
        characterData.expressionMap?.[time]?.default?.default ||
        "normal"
    );

    const message = (
        characterData.messages?.[time]?.[weather]?.[day] ||
        characterData.messages?.[time]?.[weather]?.default ||
        characterData.messages?.[time]?.default?.default ||
        "こんにちは！"
    );

    const characterImagePath = `data/${characterData.name}_${expression}.png`;
    const backgroundImagePath = `data/background_${time}_${weather}.png`;

    document.getElementById("character").src = characterImagePath;
    document.body.style.backgroundImage = `url('${backgroundImagePath}')`;

    document.getElementById("message").innerText = message;
}

// 時間帯取得
function getTimeSegment() {
    const hour = new Date().getHours();
    if (hour < 4) return "midnight";
    if (hour < 8) return "morning";
    if (hour < 12) return "noon";
    if (hour < 16) return "afternoon";
    if (hour < 20) return "evening";
    return "night";
}

// 曜日取得
function getDayOfWeek() {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
}

// 天気（仮ランダム）
function getWeather() {
    const weathers = ["sunny", "cloudy", "rainy"];
    return weathers[Math.floor(Math.random() * weathers.length)];
}
