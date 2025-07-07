
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

function getWeekdayName(date) {
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][date.getDay()];
}

async function main() {
  const res = await fetch(`characters/${characterName}.json`);
  const character = await res.json();

  const weatherData = await fetchWeather();
  document.getElementById("temp").textContent = `気温: ${weatherData.temp}℃`;

  const now = new Date();
  const hour = now.getHours();
  const timeSlotA = getTimeSlotA(hour);
  const weekday = getWeekdayName(now);

  const currentTime = Math.floor(Date.now() / 1000);
  const timeSlotB = getTimeSlotB(currentTime, weatherData.sunrise, weatherData.sunset);
  const weather = normalizeWeather(weatherData.weather);

  // 背景設定
  const bgPath = `img/bg_${timeSlotB}_${weather}.png`;
  document.getElementById("background").src = bgPath;

  // キャラ表情設定
  const expression = character.expressions[timeSlotA] || "alice_normal.png";
  document.getElementById("character").src = `img/${expression}`;

  // セリフ選択
  const lines = character.lines?.[timeSlotA]?.[weather]?.[weekday];
  if (lines && lines.length > 0) {
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    document.getElementById("line").textContent = randomLine;
  } else {
    document.getElementById("line").textContent = "セリフが見つかりません";
  }
}

main();
