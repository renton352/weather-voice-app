document.addEventListener("DOMContentLoaded", async () => {
  const characterSelect = document.getElementById("character-select");
  const bgSelect = document.getElementById("bg-select");
  const backgroundImage = document.getElementById("background-image");
  const characterImage = document.getElementById("character-image");
  const serifElement = document.getElementById("serif");

  let characters = {};
  let currentCharacterData = null;

  async function fetchJSON(url) {
    const response = await fetch(url);
    return await response.json();
  }

  function getTimeSlot() {
    const hour = new Date().getHours();
    if (hour < 6) return "midnight";
    if (hour < 9) return "early_morning";
    if (hour < 17) return "afternoon";
    if (hour < 20) return "evening";
    return "night";
  }

  async function getWeather() {
    const response = await fetch("https://weather.tsukumijima.net/api/forecast?city=130010");
    const data = await response.json();
    const forecast = data.forecasts[0].telop.toLowerCase();
    if (forecast.includes("晴")) return "sunny";
    if (forecast.includes("雪")) return "snowy";
    if (forecast.includes("雨")) return "rainy";
    if (forecast.includes("曇")) return "cloudy";
    return "cloudy";
  }

  function updateDisplay() {
    const time = getTimeSlot();
    const weather = currentWeather;
    const key = `${time}_${weather}`;

    const bgPath = `img/bg_${key}.png`;
    const expression = currentCharacterData[key]?.expression || "normal";
    const imagePath = `img/${currentCharacter}-${expression}.png`;
    const serif = currentCharacterData[key]?.serif || "セリフが見つかりません";

    backgroundImage.src = bgPath;
    characterImage.src = imagePath;
    serifElement.textContent = serif;
  }

  let currentCharacter = "alice";
  let currentWeather = "cloudy";

  try {
    characters = await fetchJSON("data/characters.json");

    Object.keys(characters).forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = characters[name].display;
      characterSelect.appendChild(option);
    });

    characterSelect.value = currentCharacter;
    currentWeather = await getWeather();
    currentCharacterData = await fetchJSON(`data/${currentCharacter}.json`);
    updateDisplay();
  } catch (e) {
    console.error("初期化エラー:", e);
    serifElement.textContent = "データ読み込みエラー";
  }

  characterSelect.addEventListener("change", async () => {
    currentCharacter = characterSelect.value;
    currentCharacterData = await fetchJSON(`data/${currentCharacter}.json`);
    updateDisplay();
  });
});
