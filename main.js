document.addEventListener("DOMContentLoaded", () => {
  const characterSelect = document.getElementById("characterSelect");
  const backgroundSelect = document.getElementById("backgroundSelect");
  const characterImg = document.getElementById("characterImg");
  const backgroundImg = document.getElementById("backgroundImg");
  const messageBox = document.getElementById("messageBox");

  const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";

  async function loadCharacters() {
    const response = await fetch("data/characters.json");
    const characters = await response.json();
    characterSelect.innerHTML = "";
    characters.forEach((char) => {
      const option = document.createElement("option");
      option.value = char.id;
      option.textContent = char.name;
      characterSelect.appendChild(option);
    });

    // URLパラメータでキャラクターが指定されていたら選択
    const params = new URLSearchParams(window.location.search);
    const characterId = params.get("character") || characters[0].id;
    characterSelect.value = characterId;
    loadCharacterData(characterId);
  }

  async function loadCharacterData(characterId) {
    const response = await fetch(`data/${characterId}.json`);
    const data = await response.json();

    const { expressions, messages } = data;
    const now = new Date();
    const hour = now.getHours();
    const date = now.getDate();

    let timeOfDay = "morning";
    if (hour < 6) timeOfDay = "early_morning";
    else if (hour < 9) timeOfDay = "morning";
    else if (hour < 12) timeOfDay = "afternoon";
    else if (hour < 17) timeOfDay = "evening";
    else if (hour < 21) timeOfDay = "night";
    else timeOfDay = "midnight";

    // 位置情報取得＆天気取得
    let weather = "sunny"; // デフォルト
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const weatherData = await weatherRes.json();
      const mainWeather = weatherData.weather[0].main.toLowerCase();
      if (mainWeather.includes("rain")) weather = "rainy";
      else if (mainWeather.includes("cloud")) weather = "cloudy";
      else if (mainWeather.includes("snow")) weather = "snowy";
      else weather = "sunny";
    } catch (err) {
      console.warn("天気取得失敗、デフォルト値を使用します:", err);
    }

    // 表情と背景画像の選択
    const expressionKey = `${timeOfDay}_${weather}`;
    const expression = expressions[expressionKey] || expressions["default"];
    characterImg.src = `images/${expression}`;
    characterImg.alt = "キャラ画像";

    const backgroundKey = `background_${timeOfDay}_${weather}.png`;
    backgroundImg.src = `images/${backgroundKey}`;
    backgroundImg.alt = "背景画像";

    // メッセージの選択
    const key = `${timeOfDay}_${weather}_${date}`;
    const message =
      messages[key] || messages[`${timeOfDay}_${weather}`] || messages["default"];

    messageBox.textContent = message;
  }

  characterSelect.addEventListener("change", () => {
    const selectedCharacter = characterSelect.value;
    const params = new URLSearchParams(window.location.search);
    params.set("character", selectedCharacter);
    window.location.search = params.toString(); // ページリロード
  });

  loadCharacters();
});
