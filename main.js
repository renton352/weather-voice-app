document.addEventListener("DOMContentLoaded", () => {
  const characterSelect = document.getElementById("characterSelect");
  const backgroundSelect = document.getElementById("backgroundSelect");
  const backgroundImage = document.getElementById("backgroundImage");
  const characterImage = document.getElementById("characterImage");
  const textBox = document.getElementById("textBox");

  fetch("data/characters.json")
    .then(res => res.json())
    .then(data => {
      data.characters.forEach(char => {
        const option = document.createElement("option");
        option.value = char.id;
        option.textContent = char.name;
        characterSelect.appendChild(option);
      });

      const url = new URL(window.location.href);
      const selectedChar = url.searchParams.get("character");
      if (selectedChar) {
        characterSelect.value = selectedChar;
        loadCharacterData(selectedChar);
      }
    });

  characterSelect.addEventListener("change", () => {
    const charId = characterSelect.value;
    loadCharacterData(charId);
  });

  function loadCharacterData(charId) {
    fetch(`data/${charId}.json`)
      .then(res => res.json())
      .then(data => {
        characterImage.src = `images/${data.images.normal}`;
        backgroundImage.src = "images/background_morning_sunny.png";
        textBox.textContent = data.serif["morning"]["sunny"];
      })
      .catch(err => {
        console.error("データ読み込みエラー:", err);
        textBox.textContent = "セリフの読み込みに失敗しました";
      });
  }
});
