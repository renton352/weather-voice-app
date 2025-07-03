async function updateDisplay() {
  const characterName = document.getElementById("characterSelect").value;
  const characterImg = document.getElementById("character");
  const bgImg = document.getElementById("bg");
  const text = document.getElementById("text");

  try {
    const weatherResponse = await fetch("https://wttr.in/Tokyo?format=j1");
    const weatherJson = await weatherResponse.json();
    const weatherDesc = weatherJson.current_condition[0].weatherDesc[0].value.toLowerCase();
    const weather = weatherDesc.includes("cloud") ? "cloudy" :
                    weatherDesc.includes("rain") ? "rainy" :
                    "sunny";

    const hour = new Date().getHours();
    const timeOfDay = hour < 10 ? "morning" : hour < 17 ? "afternoon" : "evening";

    const characterRes = await fetch(`data/${characterName}.json`);
    const characterData = await characterRes.json();

    const expression = "normal";
    characterImg.src = `img/${characterName}_${expression}.png`;

    const bgFileName = `bg_${timeOfDay}_${weather}.png`;
    bgImg.src = `img/${bgFileName}`;

    const timeData = characterData[timeOfDay] || {};
    const message = timeData[weather] || "セリフが見つかりませんでした。";
    text.textContent = `${characterName.charAt(0).toUpperCase() + characterName.slice(1)}だよ。 ${message}`;
  } catch (e) {
    console.error("データ読み込みエラー:", e);
    text.textContent = "セリフの読み込みに失敗しました。";
  }
}

document.getElementById("characterSelect").addEventListener("change", updateDisplay);
window.addEventListener("DOMContentLoaded", updateDisplay);
