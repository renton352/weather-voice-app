const params = new URLSearchParams(window.location.search);
const characterKey = params.get("ch") || "alice";

async function loadCharacter() {
  const res = await fetch(`${characterKey}.json`);
  const data = await res.json();
  return data;
}

function getWeatherLabel(weatherId) {
  if (weatherId === 800) return "sunny";
  if (weatherId >= 200 && weatherId < 600) return "rainy";
  if (weatherId >= 600 && weatherId < 700) return "snowy";
  return "cloudy";
}

function getTimeZoneForDialogue(hour) {
  if (hour < 6) return "midnight";
  if (hour < 9) return "early_morning";
  if (hour < 12) return "morning";
  if (hour < 15) return "noon";
  if (hour < 18) return "afternoon";
  return "evening";
}

function getTimeZoneForBackground(now, sunrise, sunset) {
  const hour = now.getHours();
  const bufferMs = 60 * 60 * 1000; // 1時間
  const sunriseTime = new Date(sunrise * 1000);
  const sunsetTime = new Date(sunset * 1000);

  if (now < new Date(sunriseTime.getTime() + bufferMs)) {
    return "before_sunrise";
  } else if (now < new Date(sunsetTime.getTime() - bufferMs)) {
    return "daytime";
  } else if (now < new Date(sunsetTime.getTime() + bufferMs)) {
    return "sunset";
  } else {
    return "night";
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

    const temp = Math.round(weatherData.main.temp);
    const weatherId = weatherData.weather[0].id;
    const sunrise = weatherData.sys.sunrise;
    const sunset = weatherData.sys.sunset;

    const now = new Date();
    const hour = now.getHours();
    const dialogueZone = getTimeZoneForDialogue(hour);
    const backgroundZone = getTimeZoneForBackground(now, sunrise, sunset);
    const weather = getWeatherLabel(weatherId);

    // 背景画像設定
    const bgPath = `img/bg_${backgroundZone}_${weather}.png`;
    document.getElementById("background").src = bgPath;

    // キャラクター画像
    const expression = "normal";
    document.getElementById("character").src = `img/${character.expressions[expression]}`;

    // セリフ表示
    const lines = character.lines?.[dialogueZone]?.[weather];
    document.getElementById("dialogue").innerText = lines || "セリフが設定されていません。";

    // 気温表示
    document.getElementById("tempDisplay").innerText = `現在の気温：${temp}℃`;
  });
}

main();
