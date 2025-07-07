
const params = new URLSearchParams(window.location.search);
const characterName = params.get('ch') || 'alice';

async function loadCharacterData(name) {
    try {
        const response = await fetch(`characters/${name}.json`);
        return await response.json();
    } catch (error) {
        console.error("キャラクターJSONの読み込みに失敗しました:", error);
        document.getElementById('message').textContent = "キャラクターデータを取得できませんでした。";
        throw error;
    }
}

function getTimeSegmentA(date) {
    const hour = date.getHours();
    if (hour < 6) return 'midnight';
    if (hour < 9) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 15) return 'noon';
    if (hour < 18) return 'afternoon';
    return 'evening';
}

function getTimeSegmentB(date, sunrise, sunset) {
    const hour = date.getHours();
    const time = date.getTime();
    const beforeSunrise = new Date(sunrise.getTime() - 60 * 60 * 1000);
    const afterSunrise = new Date(sunrise.getTime() + 60 * 60 * 1000);
    const beforeSunset = new Date(sunset.getTime() - 60 * 60 * 1000);
    const afterSunset = new Date(sunset.getTime() + 60 * 60 * 1000);

    if (time >= beforeSunrise.getTime() && time <= afterSunrise.getTime()) return 'before_sunrise';
    if (time > afterSunrise.getTime() && time < beforeSunset.getTime()) return 'daytime';
    if (time >= beforeSunset.getTime() && time <= afterSunset.getTime()) return 'sunset';
    return 'night';
}

const weatherImageMap = {
    Clear: 'sunny',
    Clouds: 'cloudy',
    Rain: 'rainy',
    Drizzle: 'rainy',
    Thunderstorm: 'rainy',
    Snow: 'snowy'
};

async function loadWeatherData() {
    try {
        const lat = 35.8572;
        const lon = 139.4196;
        const apiKey = 'a8bc86e4c135f3c44f72bb4b957aa213';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        return await response.json();
    } catch (error) {
        console.error("天気データの取得に失敗:", error);
        document.getElementById('message').textContent = "天気情報の取得に失敗しました。";
        throw error;
    }
}

function getTodayEntry(data, segment) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[new Date().getDay()];
    return data[segment][day] || null;
}

async function main() {
    const character = await loadCharacterData(characterName);
    const weather = await loadWeatherData();

    const weatherMain = weather.weather[0].main;
    const weatherType = weatherImageMap[weatherMain] || 'sunny';
    const temp = weather.main.temp;
    const sunrise = new Date(weather.sys.sunrise * 1000);
    const sunset = new Date(weather.sys.sunset * 1000);
    const now = new Date();

    const timeSegmentA = getTimeSegmentA(now);
    const timeSegmentB = getTimeSegmentB(now, sunrise, sunset);

    const entry = getTodayEntry(character, timeSegmentA);

    const bgFilename = `bg_${timeSegmentB}_${weatherType}.png`;

    document.getElementById('background').src = `img/${bgFilename}`;
    document.getElementById('character').src = `img/${character.expressions[entry.expression]}`;
    document.getElementById('message').textContent = entry.text;
    document.getElementById('temp').textContent = `${Math.round(temp)}°C`;
}

main();
