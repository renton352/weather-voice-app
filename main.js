
console.log("✅ main.js は読み込まれています");

async function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterName = urlParams.get("ch") || "alice";
  const response = await fetch(`./characters/${characterName}.json`);
  const character = await response.json();

  const now = new Date();
  const hour = now.getHours();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  // 時間帯A判定（セリフ用）
  let timeSlotA = "";
  if (hour <= 5) timeSlotA = "midnight";
  else if (hour <= 8) timeSlotA = "early_morning";
  else if (hour <= 11) timeSlotA = "morning";
  else if (hour <= 14) timeSlotA = "noon";
  else if (hour <= 17) timeSlotA = "afternoon";
  else timeSlotA = "evening";

  console.log("⏰ 現在時刻:", now);
  console.log("🗓️ 曜日:", weekday);
  console.log("🕒 時間帯A:", timeSlotA);

  // セリフ検索
  const match = character.find(item => item.weekday === weekday && item.time === timeSlotA);
  const message = match ? match.line : "セリフが見つかりません";
  const expression = match ? `${characterName}_${match.expression}.png` : `${characterName}_normal.png`;

  console.log("💬 セリフ:", message);
  console.log("🖼️ 表情ファイル:", expression);

  document.getElementById("line").textContent = message;
  document.getElementById("character").src = `img/${expression}`;

  // 天気・背景・気温取得
  const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const weatherData = await weatherResponse.json();
    const weather = weatherData.weather[0].main.toLowerCase();
    const temp = Math.round(weatherData.main.temp);
    const sunrise = new Date(weatherData.sys.sunrise * 1000);
    const sunset = new Date(weatherData.sys.sunset * 1000);

    document.getElementById("temp").textContent = `${temp}℃`;

    const current = new Date();
    const oneHour = 60 * 60 * 1000;
    let timeSlotB = "";

    if (current >= new Date(sunrise.getTime() - oneHour) && current <= new Date(sunrise.getTime() + oneHour)) {
      timeSlotB = "before_sunrise";
    } else if (current > new Date(sunrise.getTime() + oneHour) && current < new Date(sunset.getTime() - oneHour)) {
      timeSlotB = "daytime";
    } else if (current >= new Date(sunset.getTime() - oneHour) && current <= new Date(sunset.getTime() + oneHour)) {
      timeSlotB = "sunset";
    } else {
      timeSlotB = "night";
    }

    let weatherCategory = "sunny";
    if (weather.includes("cloud")) weatherCategory = "cloudy";
    else if (weather.includes("rain") || weather.includes("drizzle")) weatherCategory = "rainy";
    else if (weather.includes("snow")) weatherCategory = "snowy";

    const bgFileName = `bg_${timeSlotB}_${weatherCategory}.png`;
    document.body.style.backgroundImage = `url('./img/${bgFileName}')`;

    console.log("🌤️ 天気:", weather);
    console.log("📷 背景画像:", bgFileName);
  });
}

main();
