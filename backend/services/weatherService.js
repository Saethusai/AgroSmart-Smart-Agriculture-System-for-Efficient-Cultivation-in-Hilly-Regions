const axios = require('axios');

class WeatherService {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getForecast(lat, lon) {
        try {
            if (!this.apiKey || this.apiKey === 'your_api_key_here') {
                return this.getMockForecast();
            }

            const response = await axios.get(`${this.baseUrl}/forecast`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Weather API Error:', error.message);
            return this.getMockForecast();
        }
    }

    async getCurrentWeather(lat, lon) {
        try {
            if (!this.apiKey || this.apiKey === 'your_api_key_here') {
                return this.getMockCurrent();
            }

            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Weather API Error:', error.message);
            return this.getMockCurrent();
        }
    }

    getMockCurrent() {
        const hour = new Date().getHours();
        const baseTemp = 20;
        const temp = baseTemp + (hour < 12 ? hour / 2 : (24 - hour) / 2);
        const isRaining = hour % 4 === 0;

        return {
            weather: [{ 
                main: isRaining ? 'Rain' : 'Clouds', 
                description: isRaining ? 'light rain' : 'scattered clouds', 
                icon: isRaining ? '10d' : '03d' 
            }],
            main: { 
                temp: parseFloat(temp.toFixed(1)), 
                humidity: 50 + hour, 
                pressure: 1012 
            },
            wind: { speed: parseFloat((3 + (hour % 5)).toFixed(1)) },
            name: 'Simulated Station',
            dt: Math.floor(Date.now() / 1000)
        };
    }

    getMockForecast() {
        const list = [];
        const now = Math.floor(Date.now() / 1000);

        // Generate 5 entries for the next 15 hours (3-hour intervals)
        for (let i = 0; i < 5; i++) {
            list.push({
                dt: now + (i + 1) * 3 * 3600,
                main: { temp: 22 + i, humidity: 60 + i * 2 },
                weather: [{ main: i === 2 ? 'Rain' : 'Clouds', description: i === 2 ? 'light rain' : 'cloudy', icon: i === 2 ? '10d' : '03d' }],
                pop: i === 2 ? 0.85 : 0.1 // Probability of precipitation
            });
        }

        return { list };
    }

    /**
     * Predictive Check: Will it rain in the next 12 hours?
     */
    async willItRainSoon(lat, lon) {
        const forecast = await this.getForecast(lat, lon);
        if (!forecast || !forecast.list) return false;

        // Check first 4 intervals (12 hours)
        const next12Hours = forecast.list.slice(0, 4);
        const rainChance = next12Hours.some(item =>
            item.weather.some(w => w.main === 'Rain') || (item.pop && item.pop > 0.5)
        );

        return rainChance;
    }
}

module.exports = new WeatherService();
