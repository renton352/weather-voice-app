const apiKey = "a8bc86e4c135f3c44f72bb4b957aa213";
const characterSelect = document.getElementById("characterSelect");
const backgroundSelect = document.getElementById("backgroundSelect");
const characterImage = document.getElementById("characterImage");
const backgroundImage = document.getElementById("backgroundImage");
const serifText = document.getElementById("serifText");

async function fetchWeather() {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=${apiKey}&lang=ja`);
    const data = await response.json();
    return data.weather[0].main.toLowerCase(); // e.g., "clear", "clouds", etc.
}

async function loadCharacters() {
    try {
        const res = await fetch("characters.json");
        const characters = await res.json();
        characterSelect.innerHTML = "";
        characters.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.name;
            characterSelect.appendChild(opt);
        });
        loadCharacterData(); // 初回読込
    } catch (err) {
        serifText.textContent = "キャラクター読み込み失敗";
    }
}

async function loadCharacterData() {
    const id = characterSelect.value;
    try {
        const [charRes, weather] = await Promise.all([
            fetch(`${id}.json`).then(r => r.json()),
            fetchWeather()
        ]);
        const hour = new Date().getHours();
        let timeOfDay = "day";
        if (hour < 5) timeOfDay = "night";
        else if (hour < 10) timeOfDay = "morning";
        else if (hour < 17) timeOfDay = "afternoon";
        else timeOfDay = "evening";

        const key = `${timeOfDay}_${weather}`;
        const data = charRes[key] || { text: "セリフが未設定です", image: "default.png" };
        serifText.textContent = data.text;
        characterImage.src = `images/${data.image}`;
    } catch (err) {
        console.error("データ読み込みエラー:", err);
        serifText.textContent = "セリフの読み込みに失敗しました";
    }
}

characterSelect.addEventListener("change", loadCharacterData);

loadCharacters();
