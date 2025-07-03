
const characterSelect = document.getElementById('characterSelect');
const backgroundSelect = document.getElementById('backgroundSelect');
const backgroundImage = document.getElementById('backgroundImage');
const characterImage = document.getElementById('characterImage');
const lineText = document.getElementById('lineText');
const weatherApiKey = "a8bc86e4c135f3c44f72bb4b957aa213";

let characters = [];
let currentCharacterData = null;

// 時間帯の判定
function getTimePeriod() {
  const hour = new Date().getHours();
  if (hour < 10) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 19) return 'evening';
  return 'night';
}

// 天気取得（東京固定）
async function getWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=${weatherApiKey}&lang=ja`;
    const res = await fetch(url);
    const data = await res.json();
    const main = data.weather[0].main.toLowerCase();
    if (main.includes('cloud')) return 'cloudy';
    if (main.includes('rain')) return 'rainy';
    return 'sunny';
  } catch (e) {
    console.error("天気取得エラー:", e);
    return 'sunny';
  }
}

async function loadCharacters() {
  const res = await fetch("data/characters.json");
  characters = await res.json();
  characters.forEach(c => {
    const option = document.createElement("option");
    option.value = c.name.toLowerCase();
    option.textContent = c.name;
    characterSelect.appendChild(option);
  });
}

async function loadCharacterData(name) {
  try {
    const res = await fetch(`data/${name}.json`);
    currentCharacterData = await res.json();
    updateDisplay();
  } catch (e) {
    console.error("データ読み込みエラー:", e);
    lineText.textContent = "セリフの読み込みに失敗しました";
  }
}

async function updateDisplay() {
  const period = getTimePeriod();
  const weather = await getWeather();
  const line = currentCharacterData.lines[period]?.[weather] || "セリフなし";
  const expressionFile = currentCharacterData.image["normal"];

  characterImage.src = `img/${expressionFile}`;
  characterImage.alt = "キャラ画像";
  lineText.textContent = line;

  const bgValue = backgroundSelect.value;
  if (bgValue) {
    backgroundImage.src = `img/${bgValue}`;
    backgroundImage.style.display = "inline";
  } else {
    backgroundImage.style.display = "none";
  }
}

characterSelect.addEventListener("change", () => {
  const selected = characterSelect.value;
  if (selected) loadCharacterData(selected);
});

backgroundSelect.addEventListener("change", () => updateDisplay());

(async () => {
  await loadCharacters();
  const urlParams = new URLSearchParams(window.location.search);
  const defaultChar = urlParams.get("character");
  if (defaultChar) {
    characterSelect.value = defaultChar.toLowerCase();
    await loadCharacterData(defaultChar.toLowerCase());
  }
})();
