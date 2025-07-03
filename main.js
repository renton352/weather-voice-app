
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return await response.json();
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
}

function getWeatherCondition() {
    return "cloudy"; // ダミー天気、必要ならAPI連携
}

async function updateDisplay() {
    const characterKey = document.getElementById("characterSelector").value;
    const characterImage = document.getElementById("character");
    const backgroundImage = document.getElementById("background");
    const serifElement = document.getElementById("serif");

    const time = getTimeOfDay();
    const weather = getWeatherCondition();
    const expressionKey = `${time}_${weather}`;

    try {
        const characterData = await fetchJson(`data/${characterKey}.json`);
        const imageName = characterData.expressions[expressionKey] || characterData.expressions["default"];
        const line = characterData.lines[expressionKey] || "セリフが見つかりません。";

        characterImage.src = `img/${imageName}`;
        backgroundImage.src = `img/bg_${time}_${weather}.png`;

        if (serifElement) {
            serifElement.textContent = line;
        }
    } catch (err) {
        console.error("データ読み込みエラー:", err);
    }
}

document.getElementById("characterSelector").addEventListener("change", updateDisplay);
document.addEventListener("DOMContentLoaded", updateDisplay);
