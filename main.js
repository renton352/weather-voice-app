const charactersData = {};
let currentCharacter = null;

async function loadJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
}

function getTimeSegment(hour) {
  if (hour >= 4 && hour < 8) return 'early_morning';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 16) return 'afternoon';
  if (hour >= 16 && hour < 18) return 'evening';
  if (hour >= 18 && hour < 21) return 'night';
  return 'midnight';
}

function getWeatherCategory(weatherId) {
  if (weatherId >= 200 && weatherId < 600) return 'rainy';
  if (weatherId >= 600 && weatherId < 700) return 'snowy';
  if (weatherId === 800) return 'sunny';
  return 'cloudy';
}

async function setCharacter(name) {
  currentCharacter = name;
  const character = charactersData[name];
  if (!character) return;

  const characterData = await loadJSON(`./data/${name}.json`);

  const now = new Date();
  const hour = now.getHours();
  const timeSegment = getTimeSegment(hour);

  try {
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=35.6895&lon=139.6917&appid=a8bc86e4c135f3c44f72bb4b957aa213`);
    const weatherData = await weatherResponse.json();
    const weatherCategory = getWeatherCategory(weatherData.weather[0].id);
    const key = `${timeSegment}_${weatherCategory}`;

    const entry = characterData[key];

    document.getElementById('background').src = `./img/${entry.background}`;
    document.getElementById('character').src = `./img/${character.expressions[entry.expression]}`;
    document.getElementById('text').innerText = entry.text;

  } catch (e) {
    console.error('Error setting character view:', e);
  }
}

async function init() {
  const data = await loadJSON('./data/characters.json');
  for (const char of data.characters) {
    charactersData[char.name] = char;
  }

  const params = new URLSearchParams(window.location.search);
  const selected = params.get("ch") || "alice";
  await setCharacter(selected);
}

window.onload = init;