console.log("✅ main.js 読み込み完了");

const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
const characterName = new URLSearchParams(window.location.search).get("ch") || "alice";

async function fetchWeather() {
  const response = await fetch("https://api.openweathermap.org/data/2.5/weather?lat=35.6895&lon=139.6917&units=metric&lang=ja&appid=" + apiKey);
  const data = await response.json();
  return {
    temp: Math.round(data.main.temp),
    weather: data.weather[0].main.toLowerCase(),
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset
  };
}

function getTimeSlotA(hour) {
  if (hour < 6) return "midnight";
  if (hour < 9) return "early_morning";
  if (hour < 12) return "morning";
  if (hour < 15) return "noon";
  if (hour < 18) return "afternoon";
  return "evening";
};

  const oneHour = 60 * 60;
  if (now < sunrise - oneHour || now > sunset + oneHour) return "night";
  if (now >= sunrise - oneHour && now <= sunrise + oneHour) return "before_sunrise";
  if (now >= sunset - oneHour && now <= sunset + oneHour) return "sunset";
  return "daytime";
};

const getTempCategory = (feelsLike) => {
  if (feelsLike < 0) return "freezing";
  if (feelsLike < 10) return "cold";
  if (feelsLike < 20) return "cool";
  if (feelsLike < 28) return "warm";
  return "hot";
};

const loadCharacterData = async () => {
  const res = await fetch(`./data/${characterKey}.json`);
  return res.json();
};

const displayContent = async () => {
  try {
    const character = await loadCharacterData();
    const now = new Date();
    const hour = now.getHours();
    const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()];
    const timeSlotA = getTimeSlotA(hour);

    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=35.6895&lon=139.6917&appid=${weatherApiKey}&units=metric`);
    const weatherData = await weatherRes.json();
    const feelsLike = weatherData.main.feels_like;
    const sunrise = new Date(weatherData.sys.sunrise * 1000).getHours();
    const sunset = new Date(weatherData.sys.sunset * 1000).getHours();
    const timeSlotB = getTimeSlotB(hour, sunrise, sunset);

    const bgFileName = `bg_${timeSlotB}_sunny.png`; // 天気要素は背景だけに使用
    document.body.style.backgroundImage = `url('./img/${bgFileName}')`;

    document.getElementById("character").src = `./img/${character.expressions.default}`;
    document.getElementById("temp").textContent = `${feelsLike.toFixed(1)}℃`;

    const tempCategory = getTempCategory(feelsLike);
    const lineOptions = character.lines[tempCategory]?.[timeSlotA]?.[day];

    console.log("🕐 時間帯A:", timeSlotA);
    console.log("🕒 時間帯B:", timeSlotB);
    console.log("📅 曜日:", day);
    console.log("🌡️ 体感温度:", feelsLike, "=>", tempCategory);
    console.log("🗨️ 候補セリフ:", lineOptions);

    if (lineOptions && lineOptions.length > 0) {
      const selectedLine = lineOptions[Math.floor(Math.random() * lineOptions.length)];
      document.getElementById("line").textContent = selectedLine;
    } else {
      document.getElementById("line").textContent = "セリフが見つかりません";
    }
  } catch (error) {
    console.error("エラー:", error);
    document.getElementById("line").textContent = "情報の取得に失敗しました";
  }
};

window.addEventListener("DOMContentLoaded", displayContent);
