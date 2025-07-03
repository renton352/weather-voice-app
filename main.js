async function loadCharacters() {
  const res = await fetch("data/characters.json");
  const characters = await res.json();
  const selector = document.getElementById("characterSelector");

  characters.forEach((char, index) => {
    const option = document.createElement("option");
    option.value = char.id;
    option.textContent = char.name;
    selector.appendChild(option);
  });

  selector.addEventListener("change", () => loadCharacter(selector.value));
  loadCharacter(selector.value);
}

async function loadCharacter(id) {
  const res = await fetch(`data/${id}.json`);
  const data = await res.json();
  const expression = "normal"; // default
  const imagePath = `images/${data.imagePrefix}_${expression}.png`;
  document.getElementById("characterImage").src = imagePath;
  document.getElementById("message").textContent = data.lines[0]?.text || "";
  document.getElementById("background").src = "images/" + data.lines[0]?.background || "";
}

window.onload = loadCharacters;
