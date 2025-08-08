// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const locationElement = document.getElementById('location');
const dateTimeElement = document.getElementById('date-time');
const weatherIcon = document.getElementById('weather-icon');
const temperatureElement = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');
const citiesContainer = document.getElementById('cities-container');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');

// API Configuration
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

// State
let currentUnit = 'celsius';
let currentData = null;

// Popular cities
const popularCities = [
    { name: 'New York', country: 'US' },
    { name: 'Los Angeles', country: 'US' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Paris', country: 'France' },
    { name: 'London', country: 'UK' },
    { name: 'Sydney', country: 'Australia' }
];

// Initialize the app
function initApp() {
    // Set current date and time
    updateDateTime();
    
    // Load popular cities
    loadPopularCities();
    
    // Fetch weather for default location
    fetchWeather('New York');
    
    // Set up event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    celsiusBtn.addEventListener('click', () => switchUnit('celsius'));
    fahrenheitBtn.addEventListener('click', () => switchUnit('fahrenheit'));
}

// Handle search
function handleSearch() {
    const location = searchInput.value.trim();
    if (location) {
        fetchWeather(location);
        searchInput.value = '';
    }
}

// Fetch weather data from API
async function fetchWeather(location) {
    try {
        // Show loading state
        forecastContainer.innerHTML = '<div class="loader"><i class="fas fa-spinner"></i></div>';
        citiesContainer.innerHTML = '<div class="loader"><i class="fas fa-spinner"></i></div>';
        
        const response = await fetch(`${BASE_URL}${encodeURIComponent(location)}?unitGroup=metric&key=${API_KEY}&contentType=json`);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // Handle non-JSON response (like API key error)
            const text = await response.text();
            throw new Error(text || 'Invalid API response');
        }
        
        if (response.ok) {
            currentData = data;
            updateCurrentWeather();
            updateForecast();
        } else {
            throw new Error(data.message || 'Unable to fetch weather data');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        forecastContainer.innerHTML = `<div class="error-message">${error.message || 'Error fetching weather data'}</div>`;
    }
}

// Update current weather display
function updateCurrentWeather() {
    if (!currentData) return;
    
    const current = currentData.currentConditions;
    const location = `${currentData.resolvedAddress}, ${currentData.timezone}`;
    
    locationElement.textContent = location;
    weatherDescription.textContent = current.conditions;
    
    // Update temperature based on selected unit
    updateTemperatureDisplay();
    
    // Update weather icon
    updateWeatherIcon(current.icon);
    
    // Update other weather details
    feelsLikeElement.textContent = currentUnit === 'celsius' 
        ? `${Math.round(current.feelslike)}°` 
        : `${Math.round(current.feelslike * 9/5 + 32)}°`;
        
    humidityElement.textContent = `${current.humidity}%`;
    
    windSpeedElement.textContent = currentUnit === 'celsius' 
        ? `${Math.round(current.windspeed)} km/h` 
        : `${Math.round(current.windspeed * 0.621371)} mph`;
        
    pressureElement.textContent = `${current.pressure} hPa`;
}

// Update temperature display based on selected unit
function updateTemperatureDisplay() {
    if (!currentData) return;
    
    const temp = currentData.currentConditions.temp;
    
    if (currentUnit === 'celsius') {
        temperatureElement.textContent = `${Math.round(temp)}°`;
    } else {
        temperatureElement.textContent = `${Math.round(temp * 9/5 + 32)}°`;
    }
}

// Update weather icon based on condition
function updateWeatherIcon(condition) {
    const iconMap = {
        'clear-day': 'fas fa-sun',
        'clear-night': 'fas fa-moon',
        'rain': 'fas fa-cloud-rain',
        'snow': 'fas fa-snowflake',
        'sleet': 'fas fa-cloud-meatball',
        'wind': 'fas fa-wind',
        'fog': 'fas fa-smog',
        'cloudy': 'fas fa-cloud',
        'partly-cloudy-day': 'fas fa-cloud-sun',
        'partly-cloudy-night': 'fas fa-cloud-moon',
        'thunderstorm': 'fas fa-bolt'
    };
    
    const defaultIcon = 'fas fa-cloud';
    const iconClass = iconMap[condition] || defaultIcon;
    weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
}

// Update forecast display
function updateForecast() {
    if (!currentData) return;
    
    forecastContainer.innerHTML = '';
    
    // Show next 5 days (skip today)
    for (let i = 1; i <= 5; i++) {
        const day = currentData.days[i];
        if (!day) continue;
        
        const date = new Date(day.datetime);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="day">${dayName}</div>
            <div class="icon"><i class="${getForecastIcon(day.icon)}"></i></div>
            <div class="temp">
                ${currentUnit === 'celsius' 
                    ? `${Math.round(day.tempmax)}° / ${Math.round(day.tempmin)}°` 
                    : `${Math.round(day.tempmax * 9/5 + 32)}° / ${Math.round(day.tempmin * 9/5 + 32)}°`}
            </div>
        `;
        
        forecastContainer.appendChild(forecastDay);
    }
}

// Get forecast icon
function getForecastIcon(condition) {
    const iconMap = {
        'clear-day': 'fas fa-sun',
        'clear-night': 'fas fa-moon',
        'rain': 'fas fa-cloud-rain',
        'snow': 'fas fa-snowflake',
        'sleet': 'fas fa-cloud-meatball',
        'wind': 'fas fa-wind',
        'fog': 'fas fa-smog',
        'cloudy': 'fas fa-cloud',
        'partly-cloudy-day': 'fas fa-cloud-sun',
        'partly-cloudy-night': 'fas fa-cloud-moon',
        'thunderstorm': 'fas fa-bolt'
    };
    
    return iconMap[condition] || 'fas fa-cloud';
}

// Load popular cities
function loadPopularCities() {
    citiesContainer.innerHTML = '';
    
    popularCities.forEach(city => {
        const cityCard = document.createElement('div');
        cityCard.className = 'city-card';
        cityCard.innerHTML = `
            <i class="fas fa-city"></i>
            <h4>${city.name}</h4>
            <p>${city.country}</p>
        `;
        
        cityCard.addEventListener('click', () => {
            fetchWeather(city.name);
        });
        
        citiesContainer.appendChild(cityCard);
    });
}

// Switch temperature unit
function switchUnit(unit) {
    if (currentUnit === unit) return;
    
    currentUnit = unit;
    
    // Update button states
    celsiusBtn.classList.toggle('active', unit === 'celsius');
    fahrenheitBtn.classList.toggle('active', unit === 'fahrenheit');
    
    // Update temperature displays
    if (currentData) {
        updateTemperatureDisplay();
        updateForecast();
        
        // Update feels like temperature
        const feelsLike = currentData.currentConditions.feelslike;
        feelsLikeElement.textContent = unit === 'celsius' 
            ? `${Math.round(feelsLike)}°` 
            : `${Math.round(feelsLike * 9/5 + 32)}°`;
        
        // Update wind speed
        const windSpeed = currentData.currentConditions.windspeed;
        windSpeedElement.textContent = unit === 'celsius' 
            ? `${Math.round(windSpeed)} km/h` 
            : `${Math.round(windSpeed * 0.621371)} mph`;
    }
}

// Update date and time display
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
    
    // Update every minute
    setTimeout(updateDateTime, 60000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Mock data for demonstration purposes
function mockData() {
    currentData = {
        "resolvedAddress": "New York, NY, USA",
        "timezone": "America/New_York",
        "currentConditions": {
            "datetime": "10:00:00",
            "temp": 24.5,
            "feelslike": 26.2,
            "humidity": 65.3,
            "windspeed": 12.8,
            "pressure": 1015.2,
            "conditions": "Partly cloudy",
            "icon": "partly-cloudy-day"
        },
        "days": [
            {
                "datetime": "2025-08-08",
                "tempmax": 27.8,
                "tempmin": 19.3,
                "icon": "partly-cloudy-day",
                "conditions": "Partly cloudy"
            },
            {
                "datetime": "2025-08-09",
                "tempmax": 29.1,
                "tempmin": 20.5,
                "icon": "clear-day",
                "conditions": "Sunny"
            },
            {
                "datetime": "2025-08-10",
                "tempmax": 26.7,
                "tempmin": 21.2,
                "icon": "rain",
                "conditions": "Rain"
            },
            {
                "datetime": "2025-08-11",
                "tempmax": 25.3,
                "tempmin": 18.9,
                "icon": "cloudy",
                "conditions": "Cloudy"
            },
            {
                "datetime": "2025-08-12",
                "tempmax": 28.4,
                "tempmin": 19.7,
                "icon": "partly-cloudy-day",
                "conditions": "Partly cloudy"
            },
            {
                "datetime": "2025-08-13",
                "tempmax": 30.2,
                "tempmin": 21.5,
                "icon": "clear-day",
                "conditions": "Sunny"
            }
        ]
    };
    
    updateCurrentWeather();
    updateForecast();
}

// For demonstration purposes, use mock data
mockData();