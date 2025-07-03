
const params = new URLSearchParams(window.location.search);
const characterKey = params.get("ch") || "alice";

async function loadCharacter() {
  const res = await fetch(`./characters/${characterKey}.json`);
  const data = await res.json();
  return data;
}

function getWeatherLabel(weatherId) {
  if (weatherId === 800) return "sunny";
  if (weatherId >= 200 && weatherId < 600) return "rainy";
  if (weatherId >= 600 && weatherId < 700) return "snowy";
  return "cloudy";
}

function getTimeSegment(date, sunrise, sunset) {
  const hour = date.getHours();
  const time = date.getTime();
  const sunriseTime = new Date(sunrise * 1000).getTime();
  const sunsetTime = new Date(sunset * 1000).getTime();

  if (time < sunriseTime) return "night";
  if (time < sunriseTime + 2 * 3600 * 1000) return "sunrise";
  if (time < sunsetTime - 2 * 3600 * 1000) return "day";
  if (time < sunsetTime + 2 * 3600 * 1000) return "sunset";
  return "night";
}

function getDialogueTimeLabel(hour) {
  if (hour < 6) return "midnight";
  if (hour < 9) return "early_morning";
  if (hour < 12) return "morning";
  if (hour < 15) return "noon";
  if (hour < 18) return "afternoon";
  return "evening";
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
    const timeLabel = getDialogueTimeLabel(hour);
    const timeSegment = getTimeSegment(now, weatherData.sys.sunrise, weatherData.sys.sunset);

    const bg = `img/bg_${timeSegment}_${weather}.png`;
    document.getElementById("background").src = bg;

    const expression = "normal";
    document.getElementById("character").src = `img/${character.expressions[expression]}`;

    // セリフ分岐
    const line = character.lines[timeLabel]?.[weather] || "セリフが見つかりません";

    // 気温コメント
    let tempComment = "";
    if (temp <= 5) tempComment = character.lines.temp.cold;
    else if (temp >= 30) tempComment = character.lines.temp.hot;
    else if (temp >= 20) tempComment = character.lines.temp.warm;
    else tempComment = character.lines.temp.cool;

    // セリフ表示
    document.getElementById("dialogue").innerText = `${line}
${tempComment}`;
    document.getElementById("tempDisplay").innerText = `現在の気温：${temp.toFixed(1)}℃`;
  });
}

main();
