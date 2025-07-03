
// main.js

let selectedCharacter = new URLSearchParams(window.location.search).get("character") || "alice";

async function fetchJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.json();
}

function getTimeSlot() {
    const hour = new Date().getHours();
    if (hour < 6) return "early_morning";
    if (hour < 9) return "morning";
    if (hour < 12) return "late_morning";
    if (hour < 17) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
}

async function getWeather() {
    const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
    try {
        const position = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject)
        );
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`
        );
        const data = await response.json();

        const weatherId = data.weather[0].id;
        if (weatherId < 600) return "rainy";
        else if (weatherId < 700) return "snowy";
        else if (weatherId < 800) return "cloudy";
        else return "sunny";
    } catch (error) {
        console.warn("天気情報の取得に失敗しました", error);
        return "sunny";
    }
}

async function loadCharacterAssets(characterName, weather, timeSlot) {
    const charData = await fetchJSON(`data/${characterName}.json`);
    const voiceKey = `${weather}_${timeSlot}`;
    const message = charData.voices[voiceKey]?.text || "こんにちは。";
    const expression = charData.voices[voiceKey]?.expression || "normal";

    document.getElementById("character-img").src = `images/${characterName}_${expression}.png`;
    document.getElementById("speech-bubble").textContent = message;
}

async function updateScene() {
    const weather = await getWeather();
    const timeSlot = getTimeSlot();
    const backgroundImage = `images/background_${timeSlot}_${weather}.png`;
    document.body.style.backgroundImage = `url('${backgroundImage}')`;

    await loadCharacterAssets(selectedCharacter, weather, timeSlot);
}

async function init() {
    try {
        const characters = await fetchJSON("data/characters.json");
        const selectEl = document.getElementById("character-select");

        characters.forEach(char => {
            const option = document.createElement("option");
            option.value = char.id;
            option.textContent = char.name;
            if (char.id === selectedCharacter) option.selected = true;
            selectEl.appendChild(option);
        });

        selectEl.addEventListener("change", (e) => {
            selectedCharacter = e.target.value;
            updateScene();
        });

        updateScene();
    } catch (err) {
        console.error("初期化エラー:", err);
    }
}

window.addEventListener("DOMContentLoaded", init);
