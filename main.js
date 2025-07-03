async function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err)
    );
  });
}

async function fetchWeather() {
  const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
  let lat = 35.6895, lon = 139.6917; // デフォルト：東京

  try {
    const loc = await getUserLocation();
    lat = loc.lat;
    lon = loc.lon;
  } catch (e) {
    console.warn("位置情報が取得できなかったため、東京の天気を使用します。");
  }

  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey}`);
  const data = await response.json();
  return data.weather[0].main.toLowerCase();
}

function getTimePeriod() {
  const hour = new Date().getHours();
  if (hour < 6) return "midnight";
  if (hour < 9) return "early_morning";
  if (hour < 12) return "morning";
  if (hour < 16) return "afternoon";
  if (hour < 19) return "evening";
  return "night";
}

function normalizeWeather(weather) {
  if (weather.includes("clear")) return "sunny";
  if (weather.includes("cloud")) return "cloudy";
  if (weather.includes("rain")) return "rainy";
  if (weather.includes("snow")) return "snowy";
  return "sunny";
}

function getCharacterFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ch") || "alice";
}

async function main() {
  const character = getCharacterFromURL();
  const time = getTimePeriod();
  const weatherRaw = await fetchWeather();
  const weather = normalizeWeather(weatherRaw);

  const background = document.getElementById("background");
  background.src = `./img/bg_${time}_${weather}.png`;

  const res = await fetch(`./characters/${character}.json`);
  const characterData = await res.json();
  const info = characterData[time]?.[weather] || {
    expression: "normal",
    line: "データが見つかりません"
  };

  const characterImg = document.getElementById("character");
  characterImg.src = `./img/${character}_${info.expression}.png`;

  const dialogue = document.getElementById("dialogue");
  dialogue.textContent = info.line;
}

main();