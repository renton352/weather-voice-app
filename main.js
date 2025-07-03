window.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("characterSelector");
  const image = document.getElementById("characterImage");
  const background = document.getElementById("background");
  const dialogue = document.getElementById("dialogue");

  fetch("characters.json")
    .then(res => res.json())
    .then(characters => {
      characters.forEach(c => {
        const option = document.createElement("option");
        option.value = c.name;
        option.textContent = c.label;
        selector.appendChild(option);
      });

      const urlParams = new URLSearchParams(window.location.search);
      let characterName = urlParams.get("character") || characters[0].name;
      selector.value = characterName;
      loadCharacter(characterName);
    });

  selector.addEventListener("change", () => {
    const name = selector.value;
    const url = new URL(window.location.href);
    url.searchParams.set("character", name);
    window.location.href = url.toString();
  });

  function loadCharacter(name) {
    fetch(`data/${name}.json`)
      .then(res => {
        if (!res.ok) throw new Error("キャラクターデータが見つかりません");
        return res.json();
      })
      .then(data => {
        image.src = `images/${name}_normal.png`;
        background.src = `images/background_night_clear.png`; // 仮の背景
        dialogue.textContent = data.message || "セリフがありません";
      })
      .catch(err => {
        console.error(err);
        dialogue.textContent = "エラーが発生しました";
      });
  }
});
