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

function getTimeSegment(now, sunrise, sunset) {
  const noon = new Date(now);
  noon.setHours(12, 0, 0);

  const lateEvening = new Date(now);
  lateEvening.setHours(20, 0, 0);

  if (now < sunrise) return "before_sunrise";
  if (now < noon) return "morning";
  if (now < sunset) return "afternoon";
  if (now < lateEvening) return "sunset";
  return "night";
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
    const sunrise = new Date(weatherData.sys.sunrise * 1000);
    const sunset = new Date(weatherData.sys.sunset * 1000);
    const timeSegment = getTimeSegment(now, sunrise, sunset);

    const bg = `img/bg_${timeSegment}_${weather}.png`;
    document.getElementById("background").src = bg;

    const expression = "normal";
    document.getElementById("character").src = `img/${character.expressions[expression]}`;

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
