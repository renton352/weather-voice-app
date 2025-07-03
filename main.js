document.addEventListener("DOMContentLoaded", () => {
  const characterSelect = document.getElementById("characterSelect");
  const characterImage = document.getElementById("characterImage");
  const dialogueBox = document.getElementById("dialogue");

  let charactersData = {};
  let currentCharacter = null;

  async function fetchJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path} 読み込み失敗`);
    return response.json();
  }

  function getTimeSlot(hour) {
    if (hour < 5) return "midnight";
    if (hour < 9) return "morning";
    if (hour < 13) return "noon";
    if (hour < 17) return "afternoon";
    if (hour < 20) return "evening";
    return "night";
  }

  function getTodayInfo() {
    const now = new Date();
    const hour = now.getHours();
    const day = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][now.getDay()];
    const slot = getTimeSlot(hour);
    return { hour, slot, day };
  }

  function updateView(characterName, data) {
    const { hour, slot, day } = getTodayInfo();
    const weather = "sunny"; // 仮設定。将来的には天気APIなどに置換可能

    // セリフ取得
    const line = data.lines?.[weather]?.[slot]?.[day]?.[0] || "セリフが見つかりません";
    dialogueBox.textContent = line;

    // 表情切り替え（セリフの種類に応じた分岐があるなら）
    let expression = "normal";
    if (line.includes("うれ")) expression = "happy";
    else if (line.includes("びっくり")) expression = "surprised";
    else if (line.includes("困")) expression = "troubled";

    const charImgPath = `images/${characterName}_${expression}.png`;
    characterImage.src = charImgPath;

    // 背景画像更新
    const bg = `images/background_${slot}_${weather}.png`;
    document.body.style.backgroundImage = `url('${bg}')`;
  }

  async function loadCharacterData(characterName) {
    try {
      const data = await fetchJSON(`data/${characterName}.json`);
      currentCharacter = characterName;
      updateView(characterName, data);
    } catch (err) {
      console.error("キャラデータ読み込み失敗:", err);
      dialogueBox.textContent = "セリフ読み込みに失敗しました。";
    }
  }

  async function init() {
    try {
      const charList = await fetchJSON("data/characters.json");
      charactersData = charList;

      // ドロップダウンを生成
      for (const name of charList.characters) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        characterSelect.appendChild(option);
      }

      characterSelect.addEventListener("change", () => {
        loadCharacterData(characterSelect.value);
      });

      // 初期表示キャラ
      if (charList.characters.length > 0) {
        characterSelect.value = charList.characters[0];
        loadCharacterData(charList.characters[0]);
      }
    } catch (e) {
      console.error("初期化エラー:", e);
      dialogueBox.textContent = "初期化に失敗しました。";
    }
  }

  init();
});
