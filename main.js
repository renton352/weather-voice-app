const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
const characterName = new URLSearchParams(window.location.search).get("ch") || "alice";

async function fetchWeather() {
  const response = await fetch("https://api.openweathermap.org/data/2.5/weather?lat=35.6895&lon=139.6917&units=metric&lang=ja&appid=" + apiKey);
  const data = await response.json();
  return {
    temp: Math.round(data.main.feels_like), // 体感温度
    weather: data.weather[0].main.toLowerCase(),
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset
  };
}

function getTempCategory(temp) {
  if (temp <= 4) return "very_cold";
  if (temp <= 14) return "cold";
  if (temp <= 24) return "mild";
  if (temp <= 30) return "hot";
  return "very_hot";
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

async function main() {
  const res = await fetch(`characters/${characterName}.json`);
  const character = await res.json();

  const weatherData = await fetchWeather();
  const temp = weatherData.temp;
  const tempCategory = getTempCategory(temp);

  document.getElementById("temp").textContent = `気温: ${temp}℃`;

  const now = new Date();
  const hour = now.getHours();
  const timeSlotA = getTimeSlotA(hour);

  const currentTime = Math.floor(Date.now() / 1000);
  const sunrise = weatherData.sunrise;
  const sunset = weatherData.sunset;
  const timeSlotB = getTimeSlotB(currentTime, sunrise, sunset);

  const weather = weatherData.weather;
  const bgPath = `img/bg_${timeSlotB}_${normalizeWeather(weather)}.png`;
  document.getElementById("background").src = bgPath;

  const expression = character.expressions?.[timeSlotA] || "alice_normal.png";
  document.getElementById("character").src = `img/${expression}`;

  // ✅ セリフ選択（体感温度カテゴリ × 時間帯A）
  const lines = character.lines?.[tempCategory]?.[timeSlotA];
  const message = (lines && lines.length > 0)
    ? lines[Math.floor(Math.random() * lines.length)]
    : "セリフが見つかりません";

  document.getElementById("line").textContent = message;

  // ✅ デバッグ表示
  console.log("[DEBUG] temp:", temp);
  console.log("[DEBUG] tempCategory:", tempCategory);
  console.log("[DEBUG] timeSlotA:", timeSlotA);
  console.log("[DEBUG] timeSlotB:", timeSlotB);
  console.log("[DEBUG] weather:", weather);
  console.log("[DEBUG] line:", message);
  console.log("[DEBUG] background:", bgPath);
  console.log("[DEBUG] expression:", expression);
}

function normalizeWeather(w) {
  if (w.includes("rain")) return "rainy";
  if (w.includes("cloud")) return "cloudy";
  if (w.includes("snow")) return "snowy";
  return "sunny";
}

main();
