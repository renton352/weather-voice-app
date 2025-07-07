console.log("✅ main.js は読み込まれています");

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
}

function getTimeSlotB(now, sunrise, sunset) {
  const oneHour = 60 * 60;
  if (now < sunrise - oneHour || now > sunset + oneHour) return "night";
  if (now >= sunrise - oneHour && now <= sunrise + oneHour) return "before_sunrise";
  if (now >= sunset - oneHour && now <= sunset + oneHour) return "sunset";
  return "daytime";
}

function normalizeWeather(w) {
  if (w.includes("rain")) return "rainy";
  if (w.includes("cloud")) return "cloudy";
  if (w.includes("snow")) return "snowy";
  return "sunny";
}

async function main() {
  console.log("▶ main() が呼び出されました");

  const res = await fetch(`characters/${characterName}.json`);
  const character = await res.json();
  console.log("キャラクター情報:", character);

  const weatherData = await fetchWeather();
  console.log("天気データ:", weatherData);

  document.getElementById("temp").textContent = `気温: ${weatherData.temp}℃`;

  const now = new Date();
  const hour = now.getHours();
  const timeSlotA = getTimeSlotA(hour);
  console.log("現在の時刻:", hour, "→ timeSlotA:", timeSlotA);

  const currentTime = Math.floor(Date.now() / 1000);
  const sunrise = weatherData.sunrise;
  const sunset = weatherData.sunset;
  const timeSlotB = getTimeSlotB(currentTime, sunrise, sunset);
  console.log("timeSlotB:", timeSlotB);

  const weather = normalizeWeather(weatherData.weather);
  const bgPath = `img/bg_${timeSlotB}_${weather}.png`;
  console.log("背景画像パス:", bgPath);
  document.getElementById("background").src = bgPath;

  const expression = "normal";
  console.log("キャラクター表情パス:", character.expressions[expression]);
  document.getElementById("character").src = character.expressions[expression];

  const lines = character.lines[timeSlotA];
  console.log("セリフ候補:", lines);

  if (lines && lines.length > 0) {
    const chosen = lines[Math.floor(Math.random() * lines.length)];
    console.log("表示セリフ:", chosen);
    document.getElementById("line").textContent = chosen;
  } else {
    console.warn("セリフが見つかりません（timeSlotA: " + timeSlotA + "）");
    document.getElementById("line").textContent = "セリフが見つかりません";
  }
}

main();
