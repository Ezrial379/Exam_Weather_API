// Use your own OpenWeatherMap API Key below
const apiKey = 'fd89cc39f42a75ef6d46da58ae09757e';

const weatherContainer = document.getElementById("weather");
const city = document.getElementById("city");
const error = document.getElementById('error');

const units = 'imperial'; // can be imperial or metric
let temperatureSymbol = units === 'imperial' ? "°F" : "°C";

async function fetchWeather() {
    try {
        weatherContainer.innerHTML = '';
        error.innerHTML = '';
        city.innerHTML = '';

        const cityInputtedByUser = document.getElementById('cityInput').value;

        // Get coordinates of the city using the Geocoding API
        const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInputtedByUser}&appid=${apiKey}&units=${units}`;
        const geoResponse = await fetch(geoApiUrl);
        const geoData = await geoResponse.json();

        if (geoData.cod === '404') {
            error.innerHTML = `Not valid city. Please input another city`;
            return;
        }

        const { lat, lon } = geoData.coord;

        // Use the One Call API to get weather data using the coordinates
        const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=${units}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        // Display the current weather
        const currentWeatherDiv = createCurrentWeatherDescription(data.current);
        weatherContainer.appendChild(currentWeatherDiv);

        // Display the daily forecast
        data.daily.forEach(dailyWeatherData => {
            const dailyWeatherDiv = createDailyWeatherDescription(dailyWeatherData);
            weatherContainer.appendChild(dailyWeatherDiv);
        });

        // Display city name
        city.innerHTML = `Weather for ${geoData.name}`;

    } catch (err) {
        console.log(err);
        error.innerHTML = `Error fetching data. Please try again later.`;
    }
}

function convertToLocalTime(dt) {
    const date = new Date(dt * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${year}-${month}-${day} ${hours}:${minutes} ${period}`;
}

function createCurrentWeatherDescription(currentWeather) {
    const description = document.createElement("div");
    description.innerHTML = `
        <div class="weather_description">Current: ${currentWeather.temp}${temperatureSymbol}, ${currentWeather.weather[0].description}</div>
    `;
    return description;
}

function createDailyWeatherDescription(dailyWeather) {
    const description = document.createElement("div");
    const convertedDateAndTime = convertToLocalTime(dailyWeather.dt);

    description.innerHTML = `
        <div class="weather_description">${dailyWeather.temp.day}${temperatureSymbol} - ${dailyWeather.weather[0].description} - ${convertedDateAndTime.substring(5, 10)}</div>
    `;
    return description;
}
