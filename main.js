// ユーザーがURLで指定したキャラID（例：?ch=alice）
const getCharacterIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('ch') || 'alice'; // デフォルトはalice
};

const getTimeSlotA = hour => {
  if (hour < 5) return 'midnight';
  if (hour < 8) return 'early_morning';
  if (hour < 12) return 'morning';
  if (hour < 15) return 'noon';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const getTimeSlotB = hour => {
  if (hour < 5) return 'night';
  if (hour < 7) return 'before_sunrise';
  if (hour < 17) return 'daytime';
  if (hour < 19) return 'sunset';
  return 'night';
};

const getTemperatureCategory = feelsLike => {
  if (feelsLike >= 33) return 'veryhot';
  if (feelsLike >= 28) return 'hot';
  if (feelsLike >= 20) return 'warm';
  if (feelsLike >= 15) return 'cool';
  return 'cold';
};

const getWeekday = () => {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][(new Date()).getDay()];
};

const updateView = async () => {
  const characterId = getCharacterIdFromURL();
  const weatherApiKey = 'a8bc86e4c135f3c44f72bb4b957aa213'; // ← ここは各自のキーをセット
  const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q=Tokyo&units=metric&appid=' + weatherApiKey;

  try {
    const [weatherRes, charRes, bgRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(`./data/${characterId}.json`),
      fetch(`./data/backgrounds.json`)
    ]);
    const weatherData = await weatherRes.json();
    const character = await charRes.json();
    const backgrounds = await bgRes.json();

    const now = new Date();
    const hour = now.getHours();
    const timeSlotA = getTimeSlotA(hour);
    const timeSlotB = getTimeSlotB(hour);
    const weekday = getWeekday();
    const weather = weatherData.weather[0].main.toLowerCase(); // "Clear", "Clouds", "Rain"...
    const feelsLike = weatherData.main.feels_like;
    const tempCategory = getTemperatureCategory(feelsLike);

    // 天気を4分類にマッピング
    const weatherMap = {
      clear: 'sunny',
      clouds: 'cloudy',
      rain: 'rainy',
      drizzle: 'rainy',
      thunderstorm: 'rainy',
      snow: 'snowy',
      mist: 'cloudy',
      haze: 'cloudy',
      fog: 'cloudy'
    };
    const weatherKey = weatherMap[weather] || 'sunny';

    const expression = character.expressions?.[timeSlotA] || '';
    const line = character.lines?.[timeSlotA]?.[tempCategory]?.[weekday] || 'セリフが見つかりません';
    const bgPath = `./img/${backgrounds[timeSlotB]?.[weatherKey] || 'bg_default.png'}`;

    // 更新
    document.getElementById('character').src = `./img/${expression}`;
    document.getElementById('text').innerText = line;
    document.getElementById('background').style.backgroundImage = `url('${bgPath}')`;

  } catch (err) {
    console.error('エラー:', err);
    document.getElementById('text').innerText = 'データ取得エラー';
  }
};

updateView();
