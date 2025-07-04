const params = new URLSearchParams(window.location.search);
const characterPath = `./characters/${params.get("ch")}.json`;

async function fetchWeather() {
  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=Asia%2FTokyo`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    temp: data.current.temperature_2m,
    code: data.current.weather_code,
    sunrise: new Date(data.daily.sunrise[0]),
    sunset: new Date(data.daily.sunset[0]),
  };
}

function getSpeechTimeSegment(hour) {
  if (hour < 6) return "before_sunrise";
  if (hour < 10) return "morning";
  if (hour < 16) return "daytime";
  if (hour < 18) return "sunset";
  if (hour < 22) return "night";
  return "midnight";
}

function getBackgroundTimeSegment(now, sunrise, sunset) {
  const oneHour = 60 * 60 * 1000;
  const beforeSunrise = new Date(sunrise.getTime() - oneHour);
  const afterSunrise = new Date(sunrise.getTime() + oneHour);
  const beforeSunset = new Date(sunset.getTime() - oneHour);
  const afterSunset = new Date(sunset.getTime() + oneHour);

  if (now < beforeSunrise) return "night";
  if (now < afterSunrise) return "before_sunrise";
  if (now < beforeSunset) return "daytime";
  if (now < afterSunset) return "sunset";
  return "night";
}

function getWeatherType(code) {
  if ([0, 1, 2, 3].includes(code)) return "sunny";
  if ([45, 48, 51, 53, 55].includes(code)) return "cloudy";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75, 85, 86].includes(code)) return "snowy";
  return "sunny";
}

async function main() {
  const characterRes = await fetch(characterPath);
  const character = await characterRes.json();

  const weather = await fetchWeather();
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const speechTime = getSpeechTimeSegment(hour);
  const bgTime = getBackgroundTimeSegment(now, weather.sunrise, weather.sunset);
  const weatherType = getWeatherType(weather.code);

  const backgroundName = `bg_${bgTime}_${weatherType}.png`;
  document.body.style.backgroundImage = `url('./img/${backgroundName}')`;

  const entry = character.entries.find(e =>
    e.time === speechTime &&
    e.weather === weatherType &&
    (e.day === undefined || e.day === day)
  );

  if (entry) {
    document.getElementById("character").src = `./img/${character.expressions[entry.expression]}`;
    document.getElementById("text").innerText = entry.text;
    const audio = new Audio(`./voice/${character.voicePrefix}_${entry.voice}.mp3`);
    audio.play();
  } else {
    document.getElementById("text").innerText = "セリフが見つかりませんでした";
  }

  document.getElementById("temperature").innerText = `${weather.temp}℃`;
}

main();
