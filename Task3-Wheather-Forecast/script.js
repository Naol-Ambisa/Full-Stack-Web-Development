const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const WEATHER_CODES = {
    0: ["Clear sky", "☀️", "sunny"],
    1: ["Mainly clear", "🌤️", "sunny"],
    2: ["Partly cloudy", "⛅", "cloudy"],
    3: ["Overcast", "☁️", "cloudy"],
    45: ["Fog", "🌫️", "cloudy"],
    48: ["Depositing rime fog", "🌫️", "cloudy"],
    51: ["Light drizzle", "🌦️", "rainy"],
    53: ["Moderate drizzle", "🌦️", "rainy"],
    55: ["Dense drizzle", "🌧️", "rainy"],
    56: ["Light freezing drizzle", "🌧️", "rainy"],
    57: ["Dense freezing drizzle", "🌧️", "rainy"],
    61: ["Slight rain", "🌧️", "rainy"],
    63: ["Moderate rain", "🌧️", "rainy"],
    65: ["Heavy rain", "🌧️", "rainy"],
    66: ["Light freezing rain", "🌧️", "rainy"],
    67: ["Heavy freezing rain", "🌧️", "rainy"],
    71: ["Slight snowfall", "🌨️", "snowy"],
    73: ["Moderate snowfall", "🌨️", "snowy"],
    75: ["Heavy snowfall", "❄️", "snowy"],
    77: ["Snow grains", "🌨️", "snowy"],
    80: ["Slight rain showers", "🌦️", "rainy"],
    81: ["Moderate rain showers", "🌧️", "rainy"],
    82: ["Violent rain showers", "⛈️", "rainy"],
    85: ["Slight snow showers", "🌨️", "snowy"],
    86: ["Heavy snow showers", "❄️", "snowy"],
    95: ["Thunderstorm", "⛈️", "rainy"],
    96: ["Thunderstorm with light hail", "⛈️", "rainy"],
    99: ["Thunderstorm with heavy hail", "⛈️", "rainy"]
};

let currentUnit = "C";
let activeController = null;
let requestId = 0;
let latestWeather = null;
let latestForecast = null;

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const locationButton = document.getElementById("location-button");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const weatherDashboard = document.getElementById("weather-dashboard");
const currentDate = document.getElementById("current-date");
const footerYear = document.getElementById("footer-year");
const temperatureUnit = document.getElementById("temperature-unit");

document.addEventListener("DOMContentLoaded", () => {
    currentDate.textContent = new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    }).format(new Date());
    footerYear.textContent = new Date().getFullYear();

    searchForm.addEventListener("submit", handleSearch);
    locationButton.addEventListener("click", handleLocate);
    temperatureUnit.addEventListener("change", handleUnitChange);

    loadWeather("Addis Ababa");
});

async function handleSearch(event) {
    event.preventDefault();
    const city = cityInput.value.trim();

    if (!city) {
        showError("Enter a city name to search.");
        cityInput.focus();
        return;
    }

    const request = startRequest();
    setLoading(true);
    hideError();

    try {
        const url = new URL(GEOCODING_URL);
        url.search = new URLSearchParams({
            name: city,
            count: "1",
            language: "en",
            format: "json"
        });
        const result = await fetchJson(url, request.controller.signal);
        const place = result.results?.[0];

        if (!place) {
            throw new Error("City not found. Check the spelling and try again.");
        }

        await showWeather({
            latitude: place.latitude,
            longitude: place.longitude,
            name: place.name,
            country: place.country
        }, request);
    } catch (error) {
        finishRequest(request, error);
    }
}

function loadWeather(city) {
    cityInput.value = city;
    searchForm.requestSubmit();
}

function handleLocate() {
    if (!navigator.geolocation) {
        showError("Location is not supported by this browser.");
        return;
    }

    const request = startRequest();
    setLoading(true);
    hideError();

    navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
            if (request.id !== requestId) return;
            showWeather({
                latitude: coords.latitude,
                longitude: coords.longitude,
                name: "Your location",
                country: ""
            }, request);
        },
        (error) => {
            if (request.id !== requestId) return;
            const message = error.code === error.PERMISSION_DENIED
                ? "Location access was denied. Search for a city instead."
                : "Your location could not be determined. Try searching for a city.";
            finishRequest(request, new Error(message));
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
}

function startRequest() {
    activeController?.abort();
    activeController = new AbortController();
    requestId += 1;
    return { id: requestId, controller: activeController };
}

async function showWeather(location, request) {
    try {
        const url = new URL(FORECAST_URL);
        url.search = new URLSearchParams({
            latitude: location.latitude,
            longitude: location.longitude,
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "weather_code",
                "wind_speed_10m",
                "surface_pressure",
                "visibility"
            ].join(","),
            daily: "weather_code,temperature_2m_max,temperature_2m_min",
            temperature_unit: "celsius",
            wind_speed_unit: "ms",
            timezone: "auto",
            forecast_days: "6"
        });

        const data = await fetchJson(url, request.controller.signal);
        if (request.id !== requestId) return;

        latestWeather = { ...data.current, location };
        latestForecast = data.daily;
        displayCurrentWeather(latestWeather);
        displayForecast(latestForecast);
        weatherDashboard.hidden = false;
        document.getElementById("last-updated").textContent =
            new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date());
        document.getElementById("search-status").textContent =
            `Weather loaded for ${location.name}.`;
        errorMessage.hidden = true;
    } catch (error) {
        finishRequest(request, error);
        return;
    }

    if (request.id === requestId) setLoading(false);
}

async function fetchJson(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`Weather service returned an error (${response.status}).`);
    }
    return response.json();
}

function finishRequest(request, error) {
    if (request.id !== requestId) return;
    if (error.name !== "AbortError") showError(getFriendlyError(error));
    setLoading(false);
}

function displayCurrentWeather(data) {
    document.getElementById("city-name").textContent = data.location.name;
    document.getElementById("country-name").textContent = data.location.country;
    document.getElementById("weather-description").textContent =
        describeWeather(data.weather_code);
    document.getElementById("humidity").textContent = data.relative_humidity_2m;
    document.getElementById("wind-speed").textContent = data.wind_speed_10m.toFixed(1);
    document.getElementById("pressure").textContent = Math.round(data.surface_pressure);
    document.getElementById("visibility").textContent =
        Number.isFinite(data.visibility) ? (data.visibility / 1000).toFixed(1) : "N/A";

    const [description, icon, condition] = weatherInfo(data.weather_code, data.is_day);
    const weatherIcon = document.getElementById("weather-icon");
    weatherIcon.textContent = icon;
    weatherIcon.setAttribute("aria-label", description);
    document.body.classList.remove(
        "weather-sunny", "weather-rainy", "weather-cloudy", "weather-night", "weather-snowy"
    );
    document.body.classList.add(data.is_day ? `weather-${condition}` : "weather-night");
    updateTemperatureDisplay();
}

function weatherInfo(code, isDay = 1) {
    if (code === 0 && !isDay) return ["Clear sky", "🌙", "weather-night"];
    return WEATHER_CODES[code] || ["Conditions unavailable", "🌡️", "weather-cloudy"];
}

function describeWeather(code) {
    return weatherInfo(code, latestWeather?.is_day)[0];
}

function convertTemperature(celsius) {
    return currentUnit === "F" ? (celsius * 9 / 5) + 32 : celsius;
}

function formatTemperature(celsius) {
    return `${Math.round(convertTemperature(celsius))}°${currentUnit}`;
}

function updateTemperatureDisplay() {
    if (!latestWeather) return;

    document.getElementById("current-temperature").textContent =
        Math.round(convertTemperature(latestWeather.temperature_2m));
    document.querySelector(".degree").textContent = `°${currentUnit}`;
    document.getElementById("feels-like").textContent =
        formatTemperature(latestWeather.apparent_temperature);
    document.getElementById("minimum-temperature").textContent =
        formatTemperature(latestForecast.temperature_2m_min[0]);
    document.getElementById("maximum-temperature").textContent =
        formatTemperature(latestForecast.temperature_2m_max[0]);
    displayForecast(latestForecast);
}

function handleUnitChange(event) {
    currentUnit = event.target.value;
    updateTemperatureDisplay();
}

function displayForecast(data) {
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.replaceChildren();

    data.time.slice(0, 5).forEach((date, index) => {
        const code = data.weather_code[index];
        const [description, icon] = weatherInfo(code);
        const card = document.createElement("article");
        card.className = "forecast-card";

        const dayName = document.createElement("p");
        dayName.className = "forecast-day";
        dayName.textContent = index === 0
            ? "Today"
            : new Date(`${date}T12:00:00Z`).toLocaleDateString("en", {
                weekday: "short",
                timeZone: "UTC"
            });

        const weatherIcon = document.createElement("span");
        weatherIcon.className = "forecast-icon";
        weatherIcon.setAttribute("role", "img");
        weatherIcon.setAttribute("aria-label", description);
        weatherIcon.textContent = icon;

        const condition = document.createElement("p");
        condition.className = "forecast-description";
        condition.textContent = description;

        const temperatures = document.createElement("div");
        temperatures.className = "forecast-temperatures";
        const maximum = document.createElement("span");
        maximum.textContent = formatTemperature(data.temperature_2m_max[index]);
        const minimum = document.createElement("span");
        minimum.textContent = formatTemperature(data.temperature_2m_min[index]);
        temperatures.append(maximum, minimum);

        card.append(dayName, weatherIcon, condition, temperatures);
        forecastContainer.appendChild(card);
    });
}

function setLoading(isLoading) {
    loading.hidden = !isLoading;
    searchButton.disabled = isLoading;
    locationButton.disabled = isLoading;
    searchButton.textContent = isLoading ? "Loading..." : "Search Weather";
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    weatherDashboard.hidden = true;
    document.getElementById("search-status").textContent = "";
}

function hideError() {
    errorMessage.hidden = true;
    errorMessage.textContent = "";
}

function getFriendlyError(error) {
    if (!navigator.onLine) {
        return "You appear to be offline. Check your internet connection and try again.";
    }
    if (error instanceof TypeError) {
        return "Could not connect to the weather service. Check your connection and try again.";
    }
    return error.message || "Unable to load weather data. Please try again.";
}
