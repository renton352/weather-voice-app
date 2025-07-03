const characterSelect = document.getElementById("characterSelect");
const backgroundSelect = document.getElementById("backgroundSelect");
const characterImg = document.getElementById("characterImg");
const backgroundImg = document.getElementById("backgroundImg");
const message = document.getElementById("message");

// キャラクター一覧取得
fetch("characters.json")
  .then(res => res.json())
  .then(data => {
    Object.entries(data).forEach(([key, value]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = value.name;
      characterSelect.appendChild(option);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const charKey = urlParams.get("character") || "alice";
    characterSelect.value = charKey;
    updateCharacter(charKey);
  });

// 天気APIと時間取得
function getTimeZonePeriod() {
  const hour = new Date().getHours();
  if (hour < 10) return "morning";
  if (hour < 15) return "afternoon";
  if (hour < 18) return "evening";
  return "night";
}

function fetchWeatherAndUpdate(character) {
  const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
  const city = "Tokyo,jp";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=ja`)
    .then(res => res.json())
    .then(weatherData => {
      const weatherMain = weatherData.weather[0].main.toLowerCase();
      let weatherType = "clear";
      if (weatherMain.includes("cloud")) weatherType = "cloudy";
      else if (weatherMain.includes("rain")) weatherType = "rain";
      else if (weatherMain.includes("snow")) weatherType = "snow";
      const timeZone = getTimeZonePeriod();
      const key = `${timeZone}_${weatherType}`;
      loadCharacterData(character, key);
    }).catch(() => {
      message.textContent = "天気情報の取得に失敗しました";
    });
}

function updateCharacter(charKey) {
  fetch("characters.json")
    .then(res => res.json())
    .then(data => {
      const charData = data[charKey];
      if (!charData) return;
      characterImg.src = charData.image;
      fetchWeatherAndUpdate(charKey);
    });
}

function loadCharacterData(name, key) {
  fetch(`${name}.json`)
    .then(res => res.json())
    .then(lines => {
      message.textContent = lines[key] || "セリフが見つかりません";
    }).catch(err => {
      message.textContent = "セリフの読み込みに失敗しました";
    });
}

characterSelect.addEventListener("change", () => {
  updateCharacter(characterSelect.value);
});
