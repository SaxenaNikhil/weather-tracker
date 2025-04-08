// OpenWeatherMap API configuration
const API_KEY = '532618c21bb952bf18260e50a38f937a'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const weatherContent = document.getElementById('weatherContent');
const currentWeather = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');
const favoritesList = document.getElementById('favoritesList');
const settingsBtn = document.getElementById('settingsBtn');
const tempChartCanvas = document.getElementById('temperatureChart');
const precipChartCanvas = document.getElementById('precipitationChart');

// Chart instances
let temperatureChart = null;
let precipitationChart = null;

// Chart configuration
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: 'var(--text-color)',
                font: {
                    size: window.innerWidth < 768 ? 10 : 14,
                    weight: '600',
                    family: "'Segoe UI', sans-serif"
                },
                padding: window.innerWidth < 768 ? 10 : 20,
                boxWidth: window.innerWidth < 768 ? 12 : 40,
                usePointStyle: true,
                pointStyle: 'circle'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            titleFont: {
                size: window.innerWidth < 768 ? 12 : 14,
                weight: '600',
                family: "'Segoe UI', sans-serif"
            },
            bodyColor: '#666',
            bodyFont: {
                size: window.innerWidth < 768 ? 11 : 13,
                family: "'Segoe UI', sans-serif"
            },
            padding: window.innerWidth < 768 ? 8 : 12,
            boxPadding: window.innerWidth < 768 ? 4 : 6,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            usePointStyle: true,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    label += context.parsed.y.toFixed(1);
                    return label;
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false,
                drawBorder: false
            },
            ticks: {
                color: 'var(--text-color)',
                font: {
                    size: window.innerWidth < 768 ? 8 : 12,
                    family: "'Segoe UI', sans-serif"
                },
                maxRotation: window.innerWidth < 768 ? 45 : 45,
                minRotation: window.innerWidth < 768 ? 45 : 45,
                autoSkip: true,
                maxTicksLimit: window.innerWidth < 768 ? 6 : 12
            }
        },
        y: {
            beginAtZero: false,
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                drawBorder: false
            },
            ticks: {
                color: 'var(--text-color)',
                font: {
                    size: window.innerWidth < 768 ? 8 : 12,
                    family: "'Segoe UI', sans-serif"
                },
                padding: window.innerWidth < 768 ? 5 : 10,
                maxTicksLimit: window.innerWidth < 768 ? 5 : 8
            }
        }
    },
    elements: {
        line: {
            tension: 0.4
        },
        point: {
            radius: window.innerWidth < 768 ? 2 : 4,
            hoverRadius: window.innerWidth < 768 ? 4 : 6
        }
    },
    layout: {
        padding: {
            left: window.innerWidth < 768 ? 5 : 10,
            right: window.innerWidth < 768 ? 5 : 10,
            top: window.innerWidth < 768 ? 5 : 10,
            bottom: window.innerWidth < 768 ? 5 : 10
        }
    }
};

// Initialize favorite cities from localStorage
let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];

// Initialize settings dialog
$(document).ready(() => {
    // Initialize jQuery UI dialog
    $("#settingsDialog").dialog({
        autoOpen: false,
        width: 400,
        modal: true,
        buttons: {
            "Save": function() {
                saveSettings();
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });

    // Initialize font size slider
    $("#fontSizeSlider").slider({
        min: 12,
        max: 24,
        value: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size')),
        slide: function(event, ui) {
            document.documentElement.style.setProperty('--font-size', ui.value + 'px');
        }
    });

    // Load saved settings
    loadSettings();

    // Event listeners for color inputs
    $('#bgColor').on('input', function() {
        document.documentElement.style.setProperty('--background-color', this.value);
    });

    $('#textColor').on('input', function() {
        document.documentElement.style.setProperty('--text-color', this.value);
    });

    $('#accentColor').on('input', function() {
        document.documentElement.style.setProperty('--accent-color', this.value);
    });

    $('#cardBgColor').on('input', function() {
        document.documentElement.style.setProperty('--card-bg-color', this.value);
    });
});

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
settingsBtn.addEventListener('click', () => $("#settingsDialog").dialog("open"));
locationBtn.addEventListener('click', getLocationAndWeather);

// Input validation
function validateCity(city) {
    return /^[a-zA-Z\s-]+$/.test(city);
}

// Handle search
async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!validateCity(city)) {
        showError('Please enter a valid city name (letters only)');
        return;
    }

    showLoading();
    try {
        const weatherData = await fetchWeatherData(city);
        const forecastData = await fetchForecastData(city);
        hideError();
        displayWeatherData(weatherData);
        displayForecastData(forecastData);
        weatherContent.style.display = 'block';
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(`Failed to fetch weather data: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Fetch weather data
async function fetchWeatherData(city) {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'City not found');
        }
        return await response.json();
    } catch (error) {
        console.error('Weather API Error:', error);
        throw error;
    }
}

// Fetch forecast data
async function fetchForecastData(city) {
    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Forecast data not found');
        }
        return await response.json();
    } catch (error) {
        console.error('Forecast API Error:', error);
        throw error;
    }
}

// Display current weather
function displayWeatherData(data) {
    const html = `
        <div class="fade-in">
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
            <h3>${Math.round(data.main.temp)}°C</h3>
            <p>${data.weather[0].description}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind: ${data.wind.speed} m/s</p>
            <button onclick="toggleFavorite('${data.name}')" class="favorite-btn">
                ${favoriteCities.includes(data.name) ? '★' : '☆'}
            </button>
        </div>
    `;
    currentWeather.innerHTML = html;
}

// Display 5-day forecast
function displayForecastData(data) {
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    const html = dailyForecasts.slice(0, 5).map((forecast, index) => `
        <div class="forecast-card slide-in" style="animation-delay: ${index * 0.1}s">
            <h3>${new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</h3>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            <p>${Math.round(forecast.main.temp)}°C</p>
            <p>${forecast.weather[0].description}</p>
        </div>
    `).join('');
    forecastContainer.innerHTML = html;
}

// Toggle favorite city
function toggleFavorite(city) {
    const index = favoriteCities.indexOf(city);
    if (index === -1) {
        favoriteCities.push(city);
    } else {
        favoriteCities.splice(index, 1);
    }
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
    updateFavoritesList();
    handleSearch(); // Refresh current weather display to update favorite button
}

// Update favorites list
function updateFavoritesList() {
    const html = favoriteCities.map(city => `
        <div class="favorite-city" onclick="searchCity('${city}')">
            ${city}
        </div>
    `).join('');
    favoritesList.innerHTML = html;
}

// Search for a favorite city
function searchCity(city) {
    cityInput.value = city;
    handleSearch();
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        backgroundColor: document.documentElement.style.getPropertyValue('--background-color'),
        textColor: document.documentElement.style.getPropertyValue('--text-color'),
        accentColor: document.documentElement.style.getPropertyValue('--accent-color'),
        fontSize: document.documentElement.style.getPropertyValue('--font-size'),
        cardBgColor: document.documentElement.style.getPropertyValue('--card-bg-color')
    };
    localStorage.setItem('weatherAppSettings', JSON.stringify(settings));
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('weatherAppSettings'));
    if (settings) {
        document.documentElement.style.setProperty('--background-color', settings.backgroundColor);
        document.documentElement.style.setProperty('--text-color', settings.textColor);
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
        document.documentElement.style.setProperty('--font-size', settings.fontSize);
        document.documentElement.style.setProperty('--card-bg-color', settings.cardBgColor);
        
        // Update input values
        $('#bgColor').val(settings.backgroundColor);
        $('#textColor').val(settings.textColor);
        $('#accentColor').val(settings.accentColor);
        $('#cardBgColor').val(settings.cardBgColor);
        $('#fontSizeSlider').slider('value', parseInt(settings.fontSize));
    }
}

// Helper functions for loading and error states
function showLoading() {
    loadingSpinner.style.display = 'block';
    weatherContent.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Initialize favorites list on page load
updateFavoritesList();

// Theme handling
function setThemeBasedOnWeather(weatherCode) {
    const body = document.body;
    // Remove all existing themes
    body.classList.remove('theme-clear', 'theme-rain', 'theme-snow', 'theme-clouds', 'theme-storm');
    
    // Set new theme based on weather condition codes
    // Reference: https://openweathermap.org/weather-conditions
    if (weatherCode >= 200 && weatherCode < 300) {
        body.classList.add('theme-storm');
    } else if (weatherCode >= 300 && weatherCode < 600) {
        body.classList.add('theme-rain');
    } else if (weatherCode >= 600 && weatherCode < 700) {
        body.classList.add('theme-snow');
    } else if (weatherCode >= 801 && weatherCode <= 804) {
        body.classList.add('theme-clouds');
    } else if (weatherCode === 800) {
        body.classList.add('theme-clear');
    }
}

// Add resize handler for charts
window.addEventListener('resize', () => {
    if (temperatureChart) {
        temperatureChart.resize();
    }
    if (precipitationChart) {
        precipitationChart.resize();
    }
});

// Create and update temperature chart
function updateTemperatureChart(forecastData) {
    const timestamps = forecastData.list.map(item => {
        const date = new Date(item.dt * 1000);
        return window.innerWidth < 768 ? 
            date.toLocaleString('en-US', { 
                hour: 'numeric',
                hour12: true
            }) :
            date.toLocaleString('en-US', { 
                weekday: 'short',
                hour: 'numeric',
                hour12: true
            });
    });
    const temperatures = forecastData.list.map(item => item.main.temp);

    const gradient = tempChartCanvas.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 99, 132, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 99, 132, 0.0)');

    const data = {
        labels: timestamps,
        datasets: [{
            label: 'Temperature (°C)',
            data: temperatures,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: gradient,
            borderWidth: window.innerWidth < 768 ? 1.5 : 2,
            fill: true,
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)',
            pointHoverBorderWidth: window.innerWidth < 768 ? 1 : 2
        }]
    };

    if (temperatureChart) {
        temperatureChart.destroy();
    }

    temperatureChart = new Chart(tempChartCanvas, {
        type: 'line',
        data: data,
        options: {
            ...chartOptions,
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: 'Temperature Trend',
                    color: 'var(--text-color)',
                    font: {
                        size: window.innerWidth < 768 ? 14 : 16,
                        weight: '600',
                        family: "'Segoe UI', sans-serif"
                    },
                    padding: window.innerWidth < 768 ? 10 : 20
                }
            }
        }
    });
}

// Create and update precipitation chart
function updatePrecipitationChart(forecastData) {
    const timestamps = forecastData.list.map(item => {
        const date = new Date(item.dt * 1000);
        return window.innerWidth < 768 ? 
            date.toLocaleString('en-US', { 
                hour: 'numeric',
                hour12: true
            }) :
            date.toLocaleString('en-US', { 
                weekday: 'short',
                hour: 'numeric',
                hour12: true
            });
    });
    const precipitation = forecastData.list.map(item => item.rain ? item.rain['3h'] || 0 : 0);

    const gradient = precipChartCanvas.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.5)');
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.0)');

    const data = {
        labels: timestamps,
        datasets: [{
            label: 'Precipitation (mm)',
            data: precipitation,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: gradient,
            borderWidth: window.innerWidth < 768 ? 1.5 : 2,
            borderRadius: window.innerWidth < 768 ? 2 : 4,
            hoverBackgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
    };

    if (precipitationChart) {
        precipitationChart.destroy();
    }

    precipitationChart = new Chart(precipChartCanvas, {
        type: 'bar',
        data: data,
        options: {
            ...chartOptions,
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: 'Precipitation Forecast',
                    color: 'var(--text-color)',
                    font: {
                        size: window.innerWidth < 768 ? 14 : 16,
                        weight: '600',
                        family: "'Segoe UI', sans-serif"
                    },
                    padding: window.innerWidth < 768 ? 10 : 20
                }
            }
        }
    });
}

// Update both charts with new forecast data
function updateCharts(forecastData) {
    updateTemperatureChart(forecastData);
    updatePrecipitationChart(forecastData);
}

// Fetch current weather
async function getCurrentWeather(city) {
    try {
        loadingSpinner.style.display = 'block';
        errorMessage.textContent = '';
        
        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        
        // Set theme based on weather
        setThemeBasedOnWeather(data.weather[0].id);
        
        // Update UI with weather data
        currentWeather.innerHTML = `
            <div class="weather-main">
                <i class="weather-icon fas ${getWeatherIcon(data.weather[0].id)}"></i>
                <div class="temperature">${Math.round(data.main.temp)}°C</div>
                <div class="weather-description">${data.weather[0].description}</div>
            </div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <i class="fas fa-tint"></i>
                    <div>Humidity</div>
                    <div>${data.main.humidity}%</div>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-wind"></i>
                    <div>Wind</div>
                    <div>${Math.round(data.wind.speed * 3.6)} km/h</div>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-compress-arrows-alt"></i>
                    <div>Pressure</div>
                    <div>${data.main.pressure} hPa</div>
                </div>
            </div>
        `;
        
        // Get and display forecast
        getForecast(city);
        
    } catch (error) {
        errorMessage.textContent = error.message;
        currentWeather.innerHTML = '';
        forecastContainer.innerHTML = '';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Get weather icon class based on condition code
function getWeatherIcon(code) {
    if (code >= 200 && code < 300) return 'fa-bolt';
    if (code >= 300 && code < 500) return 'fa-cloud-rain';
    if (code >= 500 && code < 600) return 'fa-rain';
    if (code >= 600 && code < 700) return 'fa-snowflake';
    if (code >= 700 && code < 800) return 'fa-smog';
    if (code === 800) return 'fa-sun';
    if (code > 800) return 'fa-cloud';
    return 'fa-cloud';
}

// Fetch 5-day forecast
async function getForecast(city) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Forecast data not available');
        
        const data = await response.json();
        
        // Update charts with all forecast data
        updateCharts(data);
        
        // Filter forecast data for each day (every 24 hours)
        const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);
        
        // Update forecast container
        forecastContainer.innerHTML = dailyForecasts
            .map(
                day => `
                    <div class="forecast-item">
                        <div class="forecast-date">
                            ${new Date(day.dt * 1000).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                        <i class="weather-icon fas ${getWeatherIcon(day.weather[0].id)}"></i>
                        <div class="forecast-temp">
                            ${Math.round(day.main.temp)}°C
                        </div>
                        <div class="forecast-desc">
                            ${day.weather[0].description}
                        </div>
                    </div>
                `
            )
            .join('');
            
    } catch (error) {
        forecastContainer.innerHTML = '<p>Forecast data not available</p>';
    }
}

// Get user's location and weather on page load
document.addEventListener('DOMContentLoaded', () => {
    if ("geolocation" in navigator) {
        getLocationAndWeather();
    }
});

// Geolocation functions
async function getLocationAndWeather() {
    try {
        loadingSpinner.style.display = 'block';
        errorMessage.textContent = '';

        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Get weather by coordinates
        await getWeatherByCoordinates(latitude, longitude);
        
        // Get city name for display
        const cityData = await getCityNameFromCoords(latitude, longitude);
        cityInput.value = cityData.name;
        
    } catch (error) {
        errorMessage.textContent = 'Unable to get location. Please search manually or try again.';
        loadingSpinner.style.display = 'none';
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
}

async function getCityNameFromCoords(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        if (!response.ok) throw new Error('Location not found');
        return await response.json();
    } catch (error) {
        throw new Error('Unable to get city name');
    }
}

async function getWeatherByCoordinates(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        
        const data = await response.json();
        
        // Set theme based on weather
        setThemeBasedOnWeather(data.weather[0].id);
        
        // Update UI with weather data
        currentWeather.innerHTML = `
            <div class="weather-main">
                <i class="weather-icon fas ${getWeatherIcon(data.weather[0].id)}"></i>
                <div class="temperature">${Math.round(data.main.temp)}°C</div>
                <div class="weather-description">${data.weather[0].description}</div>
            </div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <i class="fas fa-tint"></i>
                    <div>Humidity</div>
                    <div>${data.main.humidity}%</div>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-wind"></i>
                    <div>Wind</div>
                    <div>${Math.round(data.wind.speed * 3.6)} km/h</div>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-compress-arrows-alt"></i>
                    <div>Pressure</div>
                    <div>${data.main.pressure} hPa</div>
                </div>
            </div>
        `;
        
        // Get and display forecast using coordinates
        getForecastByCoordinates(lat, lon);
        
    } catch (error) {
        errorMessage.textContent = error.message;
        currentWeather.innerHTML = '';
        forecastContainer.innerHTML = '';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

async function getForecastByCoordinates(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Forecast data not available');
        
        const data = await response.json();
        
        // Update charts with all forecast data
        updateCharts(data);
        
        // Filter forecast data for each day (every 24 hours)
        const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);
        
        // Update forecast container
        forecastContainer.innerHTML = dailyForecasts
            .map(
                day => `
                    <div class="forecast-item">
                        <div class="forecast-date">
                            ${new Date(day.dt * 1000).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                        <i class="weather-icon fas ${getWeatherIcon(day.weather[0].id)}"></i>
                        <div class="forecast-temp">
                            ${Math.round(day.main.temp)}°C
                        </div>
                        <div class="forecast-desc">
                            ${day.weather[0].description}
                        </div>
                    </div>
                `
            )
            .join('');
            
    } catch (error) {
        forecastContainer.innerHTML = '<p>Forecast data not available</p>';
    }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getCurrentWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getCurrentWeather(city);
        }
    }
}); 