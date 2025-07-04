
// main.js

const weatherApiKey = 'a8bc86e4c135f3c44f72bb4b957aa213'; // ← ご自身のAPIキーに差し替えてください
const weatherApiBase = 'https://api.openweathermap.org/data/2.5/weather';
const weatherLang = 'ja';
const weatherUnits = 'metric';

const characterName = new URLSearchParams(window.location.search).get('ch') || 'alice';
const characterJsonPath = `./characters/${characterName}.json`;

let character = null;

function getTimePeriodA(date) {
  const hour = date.getHours();
  if (hour < 6) return 'midnight';
  if (hour < 9) return 'early_morning';
  if (hour < 12) return 'morning';
  if (hour < 15) return 'noon';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function getTimePeriodB(date, sunrise, sunset) {
  const now = date.getTime() / 1000;
  if (now < sunrise - 3600 || now >= sunset + 3600) {
    return 'night';
  } else if (now >= sunrise - 3600 && now < sunrise + 3600) {
    return 'before_sunrise';
  } else if (now >= sunrise + 3600 && now < sunset - 3600) {
    return 'daytime';
  } else {
    return 'sunset';
  }
}

function getWeatherCategory(weatherId) {
  if (weatherId >= 200 && weatherId < 600) return 'rainy';
  if (weatherId >= 600 && weatherId < 700) return 'snowy';
  if (weatherId === 800) return 'sunny';
  return 'cloudy';
}

async function loadCharacter() {
  const response = await fetch(characterJsonPath);
  character = await response.json();
}

async function fetchWeather() {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  const url = `${weatherApiBase}?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=${weatherUnits}&lang=${weatherLang}`;
  const response = await fetch(url);
  return await response.json();
}

function updateView(timePeriodA, timePeriodB, weatherCategory, temperature) {
  const entry = character.dialogue.find(d => d.time === timePeriodA);
  const imagePath = `./img/${character.expressions[entry.expression]}`;
  const backgroundPath = `./img/bg_${timePeriodB}_${weatherCategory}.png`;

  document.getElementById('character').src = imagePath;
  document.getElementById('background').src = backgroundPath;
  document.getElementById('serif').textContent = entry.text;
  document.getElementById('temperature').textContent = `${Math.round(temperature)}°C`;
}

async function initialize() {
  try {
    await loadCharacter();
    const weather = await fetchWeather();

    const now = new Date();
    const timePeriodA = getTimePeriodA(now);
    const timePeriodB = getTimePeriodB(now, weather.sys.sunrise, weather.sys.sunset);
    const weatherCategory = getWeatherCategory(weather.weather[0].id);
    const temperature = weather.main.temp;

    updateView(timePeriodA, timePeriodB, weatherCategory, temperature);
  } catch (error) {
    console.error('初期化エラー:', error);
    document.getElementById('serif').textContent = 'データを取得できませんでした。';
  }
}

window.addEventListener('load', initialize);
