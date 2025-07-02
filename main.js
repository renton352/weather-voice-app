const timeZone = "midnight";
const weather = "sunny";
const dayOfWeek = "wednesday";
const characterSelect = document.getElementById("character-select");
const characterImg = document.getElementById("character-img");
const backgroundImg = document.getElementById("background");
const messageBox = document.getElementById("message");

let characters = {};

fetch("data/characters.json")
    .then(res => res.json())
    .then(data => {
        characters = data;
        for (let key in characters) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = characters[key].name;
            characterSelect.appendChild(option);
        }
        characterSelect.value = Object.keys(characters)[0];
        updateCharacter(characterSelect.value);
    });

characterSelect.addEventListener("change", () => {
    updateCharacter(characterSelect.value);
});

function updateCharacter(id) {
    fetch(`data/${id}.json`)
        .then(res => res.json())
        .then(data => {
            characterImg.src = "img/" + data.images.normal;
            messageBox.textContent = data.messages[weather][timeZone][dayOfWeek] || "メッセージがありません";
            backgroundImg.src = `img/background_${timeZone}_${weather}.png`;
        });
}
