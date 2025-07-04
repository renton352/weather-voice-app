async function fetchWeather(lat, lon) {
    const apiKey = 'YOUR_API_KEY';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ja`;

    try {
        const response = await fetch(url);
        const weatherData = await response.json();

        if (weatherData && weatherData.main && typeof weatherData.main.temp === 'number') {
            const temp = Math.round(weatherData.main.temp);
            document.getElementById('temperature').textContent = `${temp}°C`;
        } else {
            console.warn("温度情報が取得できませんでした:", weatherData);
            document.getElementById('temperature').textContent = '';
        }

        return weatherData;
    } catch (error) {
        console.error("天気情報の取得に失敗しました:", error);
        return null;
    }
}

// 他のコードは既存の main.js の構造に合わせて実装されていると仮定