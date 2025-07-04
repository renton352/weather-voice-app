
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
  return 'evening';const apiKey = 'a8bc86e4c135f3c44f72bb4b957aa213';
const characterName = new URLSearchParams(window.location.search).get('character') || 'alice';

const characterPath = `./characters/${characterName}.json`;
let weatherData = null;

// DOM取得
const background = document.getElementById('background');
const characterImg = document.getElementById('character');
const temperatureDiv = document.getElementById('temperature');
const messageDiv = document.getElementById('message');

// 位置情報取得
navigator.geolocation.getCurrentPosition(async (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`
    );
    weatherData = await weatherRes.json();

    const temp = Math.round(weatherData.main.temp);
    temperatureDiv.textContent = `${temp}℃`;

    const weather = weatherData.weather[0].main.toLowerCase();
    const now = new Date();
    const hour = now.getHours();

    // セリフ時間帯A
    const timeZoneA = getTimeZoneA(hour);

    // 日の出・日の入り取得
    const sunrise = new Date(weatherData.sys.sunrise * 1000);
    const sunset = new Date(weatherData.sys.sunset * 1000);
    const timeZoneB = getTimeZoneB(now, sunrise, sunset);

    const weatherType = getWeatherType(weather);
    const backgroundFilename = `./img/bg_${timeZoneB}_${weatherType}.png`;
    background.src = backgroundFilename;

    loadCharacterData(characterPath, timeZoneA, weatherType);
  } catch (error) {
    temperatureDiv.textContent = '天気情報取得失敗';
    console.error(error);
  }
}, () => {
  temperatureDiv.textContent = '位置情報が取得できません';
});

// セリフ時間帯（A）
function getTimeZoneA(hour) {
  if (hour < 6) return 'midnight';
  if (hour < 9) return 'early_morning';
  if (hour < 12) return 'morning';
  if (hour < 15) return 'noon';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// 背景時間帯（B）
function getTimeZoneB(now, sunrise, sunset) {
  const oneHour = 60 * 60 * 1000;
  if (now < new Date(sunrise.getTime() - oneHour)) return 'night';
  if (now < new Date(sunrise.getTime() + oneHour)) return 'before_sunrise';
  if (now < new Date(sunset.getTime() - oneHour)) return 'daytime';
  if (now < new Date(sunset.getTime() + oneHour)) return 'sunset';
  return 'night';
}

// 天気変換
function getWeatherType(main) {
  if (main.includes('snow')) return 'snowy';
  if (main.includes('rain') || main.includes('drizzle') || main.includes('thunderstorm')) return 'rainy';
  if (main.includes('cloud')) return 'cloudy';
  return 'sunny';
}

// キャラクターデータ読み込み
async function loadCharacterData(path, timeZoneA, weatherType) {
  try {
    const res = await fetch(path);
    const data = await res.json();

    const today = new Date().getDay(); // 0:日曜〜6:土曜
    const entry = data.dialogues.find(d =>
      d.time === timeZoneA && (d.weather === weatherType || d.weather === 'any') && (d.day === today || d.day === 'any')
    );

    characterImg.src = `./img/${characterName}_${entry.expression}.png`;
    messageDiv.textContent = entry.message;
  } catch (error) {
    messageDiv.textContent = 'セリフ読み込み失敗';
    console.error(error);
  }
}

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
