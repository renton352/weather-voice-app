
const params = new URLSearchParams(window.location.search);
const characterKey = params.get("ch") || "alice";

async function loadCharacter() {
  const res = await fetch(`${characterKey}.json`);
  const data = await res.json();
  return data;
}

function getTimeZoneLabel(hour) {
  if (hour < 6) return "midnight";
  if (hour < 9) return "early_morning";
  if (hour < 12) return "morning";
  if (hour < 15) return "noon";
  if (hour < 18) return "afternoon";
  return "evening";
}

function getWeatherLabel(weatherId) {
  if (weatherId === 800) return "sunny";
  if (weatherId >= 200 && weatherId < 600) return "rainy";
  if (weatherId >= 600 && weatherId < 700) return "snowy";
  return "cloudy";
}

async function main() {
  const character = await loadCharacter();

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`
    );
    const weatherData = await weatherRes.json();
    const temp = weatherData.main.temp;
    const weatherId = weatherData.weather[0].id;

    const now = new Date();
    const hour = now.getHours();
    const timeZone = getTimeZoneLabel(hour);
    const weather = getWeatherLabel(weatherId);

    const bg = `img/bg_${timeZone}_${weather}.png`;
    document.getElementById("background").src = bg;

    const expression = "normal";
    document.getElementById("character").src = `img/${character.expressions[expression]}`;

    // 基本セリフ + 気温セリフ
    const tempLines = character.lines.temp;
    let tempComment = "";
    if (temp <= 5) tempComment = tempLines.cold;
    else if (temp >= 30) tempComment = tempLines.hot;
    else if (temp >= 20) tempComment = tempLines.warm;
    else tempComment = tempLines.cool;

    document.getElementById("dialogue").innerText = tempComment;
    document.getElementById("tempDisplay").innerText = `現在の気温：${temp.toFixed(1)}℃`;
  });
}

main();
