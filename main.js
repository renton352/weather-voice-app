async function loadData() {
  const character = 'alice';
  const response = await fetch(`${character}.json`);
  const data = await response.json();

  const now = new Date();
  const day = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][now.getDay()];
  const hour = now.getHours();
  let timeOfDay;

  if (hour < 6) timeOfDay = 'early_morning';
  else if (hour < 10) timeOfDay = 'morning';
  else if (hour < 14) timeOfDay = 'noon';
  else if (hour < 17) timeOfDay = 'afternoon';
  else if (hour < 20) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const key = `${day}_${timeOfDay}`;
  console.log(`🔍 セリフキー: ${key}`);

  const lineOptions = data.lines[key];
  let selectedLine = 'セリフが見つかりません';

  if (lineOptions && lineOptions.length > 0) {
    selectedLine = lineOptions[Math.floor(Math.random() * lineOptions.length)];
  }

  document.getElementById('text-box').textContent = selectedLine;
  document.getElementById('character').src = `./img/${data.expressions.default}`;
  document.body.style.backgroundImage = 'url(./img/bg_sample.jpg)';
}

window.onload = loadData;
