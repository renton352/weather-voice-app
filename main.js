const params = new URLSearchParams(window.location.search);
const characterKey = params.get("ch") || "alice";

async function loadCharacter() {
  const res = await fetch(`./${characterKey}.json`);
  const data = await res.json();
  return data;
}

function getTimeZoneForDialogue(hour) {
  if (hour < 4) return "midnight";
  if (hour < 7) return "early_morning";
  if (hour < 10) return "morning";
  if (hour < 13) return "noon";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getWeatherLabel(weatherId) {
  if (weatherId === 800) return "sunny";
  if (weatherId >= 200 && weatherId < 600) return "rainy";
  if (weatherId >= 600 && weatherId < 700) return "snowy";
  return "cloudy";
}

function getTimeZoneForBackground(hour, sunrise, sunset) {
  const sunriseHour = new Date(sunrise * 1000).getHours();
  const sunsetHour = new Date(sunset * 1000).getHours();

  if (hour < sunriseHour - 1 || hour >= sunsetHour + 1) {
    return "night";
  } else if (hour >= sunriseHour - 1 && hour < sunriseHour + 1) {
    return "before_sunrise";
  } else if (hour >= sunsetHour - 1 && hour < sunsetHour + 1) {
    return "sunset";
  } else {
    return "daytime";
  }
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
    const weather = getWeatherLabel(weatherId);
    const now = new Date();
    const hour = now.getHours();
    const timeZoneDialogue = getTimeZoneForDialogue(hour);
    const timeZoneBackground = getTimeZoneForBackground(
      hour,
      weatherData.sys.sunrise,
      weatherData.sys.sunset
    );

    const bg = `img/bg_${timeZoneBackground}_${weather}.png`;
    document.getElementById("background").src = bg;

    const expression = "normal";
    document.getElementById("character").src = `img/${character.expressions[expression]}`;

    const lines = character.lines?.[timeZoneDialogue]?.[weather];
    const line = lines || "セリフが設定されていません。";
    document.getElementById("dialogue").innerText = line;

    document.getElementById("tempDisplay").innerText = `現在の気温：${temp.toFixed(1)}℃`;
  });
}

main();
