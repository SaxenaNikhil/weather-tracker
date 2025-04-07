# Weather Tracker App

A modern, futuristic weather application that provides real-time weather information with dynamic themes and beautiful animations. The app automatically adjusts its appearance based on current weather conditions, creating an immersive and interactive experience.

![Weather Tracker App](screenshot.png)

## Features

### 🌟 Core Features
- Real-time weather data using OpenWeatherMap API
- Current weather conditions display
- 5-day weather forecast
- Automatic location detection
- Manual city search
- Favorite cities management
- Dynamic weather-based themes

### 🎨 Dynamic Themes
The app's appearance changes automatically based on weather conditions:
- ☀️ Clear/Sunny: Warm orange theme
- 🌧️ Rain: Dark blue theme with rain animation
- ❄️ Snow: Light blue theme with snow animation
- ☁️ Cloudy: Grey theme
- ⛈️ Storm: Dark theme with lightning effects

### 💫 Visual Effects
- Glassmorphism UI elements
- Smooth animations and transitions
- Weather-specific animations
- Responsive design for all devices
- Interactive hover effects
- Dynamic color gradients

### ⚙️ Customization Options
- Background color
- Text color
- Font size
- Accent color
- Card background color

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenWeatherMap API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/weather-tracker.git
```

2. Navigate to the project directory:
```bash
cd weather-tracker
```

3. Open `script.js` and replace the API key placeholder:
```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
```

4. Open `index.html` in your web browser or set up a local server.

### Getting an API Key
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key and paste it in `script.js`

## Usage

### Current Weather
1. Allow location access when prompted for automatic weather detection
2. Or use the search bar to enter a city name
3. View current weather conditions including:
   - Temperature
   - Weather description
   - Humidity
   - Wind speed
   - Pressure

### 5-Day Forecast
- Scroll down to view the 5-day forecast
- Each forecast card shows:
  - Date
  - Temperature
  - Weather condition
  - Weather icon

### Favorites
- Click the heart icon to add a city to favorites
- Access favorite cities quickly from the favorites section
- Click on a favorite city to view its weather

### Customization
1. Click the settings icon (⚙️) in the bottom right
2. Adjust:
   - Background color
   - Text color
   - Font size
   - Accent color
   - Card background

## Technical Details

### Built With
- HTML5
- CSS3
- JavaScript (ES6+)
- jQuery & jQuery UI
- Font Awesome Icons
- OpenWeatherMap API

### Key Features Implementation
- Geolocation API for location detection
- Dynamic theme switching based on weather conditions
- CSS animations and transitions
- Responsive grid layouts
- Local storage for favorites management

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Font Awesome](https://fontawesome.com/)
- UI inspiration from modern weather applications

## Support
For support, email your-email@example.com or open an issue in the repository. 