// 修正済み main.js
const params = new URLSearchParams(window.location.search);
const characterKey = params.get("ch") || "alice";

async function loadCharacter() {
  const res = await fetch(`characters/${characterKey}.json`);
  return await res.json();
}

function getTimeZoneLabel(hour, sunrise, sunset) {
  if (hour < sunrise - 1) return "before_sunrise";
  if (hour < sunset - 1) return "daytime";
  if (hour < sunset + 1) return "sunset";
  return "night";
}

function getWeatherLabel(id) {
  if (id === 800) return "sunny";
  if (id >= 200 && id < 600) return "rainy";
  if (id >= 600 && id < 700) return "snowy";
  return "cloudy";
}

async function main() {
  const character = await loadCharacter();
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const weather = await res.json();
    const now = new Date();
    const hour = now.getHours();
    const temp = weather.main.temp;
    const weatherLabel = getWeatherLabel(weather.weather[0].id);
    const sunrise = new Date(weather.sys.sunrise * 1000).getHours();
    const sunset = new Date(weather.sys.sunset * 1000).getHours();
    const timeZone = getTimeZoneLabel(hour, sunrise, sunset);

    const bgFile = `img/bg_${timeZone}_${weatherLabel}.png`;
    document.getElementById("background").src = bgFile;

    const line = character.lines[timeZone]?.[weatherLabel] || "セリフが見つかりませんでした";
    document.getElementById("dialogue").innerText = line;
    document.getElementById("tempDisplay").innerText = `現在の気温：${temp.toFixed(1)}℃`;
  });
}

main();