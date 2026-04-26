// Features JavaScript for MongoDB Integration
class WeatherFeatures {
    constructor() {
        this.currentCity = '';
        this.currentWeatherData = null;
        this.userPreferences = null;
        this.init();
    }

    async init() {
        // Load user preferences
        await this.loadUserPreferences();
        
        // Add favorite button to weather display
        this.addFavoriteButton();
        
        // Initialize tab functionality
        this.initTabs();
        
        // Auto-load favorites if any exist
        if (this.userPreferences && this.userPreferences.favorite_cities && this.userPreferences.favorite_cities.length > 0) {
            this.loadFavorites();
        }
    }

    async loadUserPreferences() {
        try {
            if (window.dbService) {
                this.userPreferences = await window.dbService.getUserPreferences();
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
            this.userPreferences = window.dbService?.getDefaultPreferences() || {};
        }
    }

    addFavoriteButton() {
        console.log('Adding favorite button...');
        const weatherContainer = document.querySelector('.temperature-container');
        console.log('Weather container found:', !!weatherContainer);
        
        if (weatherContainer) {
            // Remove existing button if any
            const existingBtn = document.getElementById('addFavoriteBtn');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'add-favorite-btn';
            favoriteBtn.textContent = '⭐ Add to Favorites';
            favoriteBtn.onclick = () => {
                console.log('Favorite button clicked!');
                this.addToFavorites();
            };
            favoriteBtn.id = 'addFavoriteBtn';
            weatherContainer.appendChild(favoriteBtn);
            console.log('Favorite button added successfully');
        } else {
            console.error('Weather container not found');
        }
    }

    initTabs() {
        // Tab switching functionality
        window.showTab = function(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected tab
            const selectedTab = document.getElementById(`${tabName}-tab`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
            
            // Add active class to clicked button
            if (event && event.target) {
                event.target.classList.add('active');
            }
        };
    }

    async addToFavorites() {
        console.log('addToFavorites called');
        console.log('Current city:', this.currentCity);
        console.log('Current weather data:', this.currentWeatherData);
        console.log('Database service available:', !!window.dbService);
        
        if (!this.currentCity || !this.currentWeatherData) {
            console.log('Missing city or weather data');
            this.showMessage('Please search for a city first', 'error');
            return;
        }

        try {
            const favoriteData = {
                city: this.currentCity,
                country: this.currentWeatherData.country || '',
                coordinates: {
                    lat: this.currentWeatherData.coordinates?.lat || 0,
                    lon: this.currentWeatherData.coordinates?.lon || 0
                }
            };

            console.log('Favorite data to save:', favoriteData);

            if (window.dbService) {
                console.log('Calling addToFavorites on database service...');
                const result = await window.dbService.addToFavorites(favoriteData);
                console.log('Add to favorites result:', result);
                
                if (result) {
                    this.showMessage(`${this.currentCity} added to favorites!`, 'success');
                    this.updateFavoriteButton(true);
                    // Refresh favorites list
                    this.loadFavorites();
                } else {
                    this.showMessage('Failed to add to favorites', 'error');
                }
            } else {
                console.log('Database service not available');
                this.showMessage('Database service not available', 'error');
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            this.showMessage('Error adding to favorites', 'error');
        }
    }

    updateFavoriteButton(isFavorite) {
        const btn = document.getElementById('addFavoriteBtn');
        if (btn) {
            if (isFavorite) {
                btn.textContent = '⭐ Added to Favorites';
                btn.disabled = true;
            } else {
                btn.textContent = '⭐ Add to Favorites';
                btn.disabled = false;
            }
        }
    }

    async loadFavorites() {
        try {
            if (!window.dbService) {
                this.showMessage('Database service not available', 'error');
                return;
            }

            console.log('Loading favorites from database...');
            const container = document.getElementById('favorites-container');
            container.innerHTML = '<div class="loading">Loading favorites...</div>';

            const favorites = await window.dbService.getUserFavorites();
            console.log('Favorites data:', favorites);

            if (favorites.length === 0) {
                container.innerHTML = '<p class="no-data">No favorite cities yet. Search and add cities to favorites!</p>';
                return;
            }

            container.innerHTML = '';
            favorites.forEach(favorite => {
                const card = this.createFavoriteCard(favorite);
                container.appendChild(card);
            });
            
            this.showMessage(`Loaded ${favorites.length} favorite cities`, 'success');
        } catch (error) {
            console.error('Error loading favorites:', error);
            this.showMessage('Error loading favorites', 'error');
        }
    }

    createFavoriteCard(favorite) {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.onclick = () => this.searchCity(favorite.city);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-favorite';
        removeBtn.textContent = '×';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            this.removeFromFavorites(favorite.city);
        };

        card.innerHTML = `
            <div class="favorite-city">${favorite.city}</div>
            <div class="favorite-country">${favorite.country}</div>
            <div class="favorite-date">Added ${new Date(favorite.added_date).toLocaleDateString()}</div>
        `;

        card.appendChild(removeBtn);
        return card;
    }

    async removeFromFavorites(city) {
        try {
            if (window.dbService) {
                const result = await window.dbService.removeFromFavorites(city);
                if (result) {
                    this.showMessage(`${city} removed from favorites`, 'success');
                    this.loadFavorites(); // Refresh the list
                } else {
                    this.showMessage('Failed to remove from favorites', 'error');
                }
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
            this.showMessage('Error removing from favorites', 'error');
        }
    }

    async loadHistory() {
        try {
            if (!window.dbService) {
                this.showMessage('Database service not available', 'error');
                return;
            }

            console.log('Loading user history from database...');
            const container = document.getElementById('history-container');
            container.innerHTML = '<div class="loading">Loading history...</div>';

            // Get user's complete history
            const history = await window.dbService.getUserHistory(50);
            console.log('History data:', history);

            if (history.length === 0) {
                container.innerHTML = `<p class="no-data">No weather history found. Search for cities to build your history!</p>`;
                return;
            }

            // Group history by city
            const groupedHistory = {};
            history.forEach(record => {
                if (!groupedHistory[record.city]) {
                    groupedHistory[record.city] = [];
                }
                groupedHistory[record.city].push(record);
            });

            container.innerHTML = '';
            
            // Display history grouped by city
            Object.keys(groupedHistory).forEach(city => {
                // Add city header
                const cityHeader = document.createElement('h3');
                cityHeader.textContent = city;
                cityHeader.style.cssText = 'color: white; margin: 20px 0 10px 0; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 5px;';
                container.appendChild(cityHeader);
                
                // Add history items for this city (limited to 5 most recent)
                groupedHistory[city].slice(0, 5).forEach(record => {
                    const item = this.createHistoryItem(record);
                    container.appendChild(item);
                });
            });
            
            this.showMessage(`Loaded history for ${Object.keys(groupedHistory).length} cities`, 'success');
        } catch (error) {
            console.error('Error loading history:', error);
            this.showMessage('Error loading weather history', 'error');
        }
    }

    createHistoryItem(record) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(record.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();

        item.innerHTML = `
            <div class="history-item-header">
                <div class="history-city">${record.city}</div>
                <div class="history-date">${formattedDate} ${formattedTime}</div>
            </div>
            <div class="history-details">
                <div class="history-detail">
                    <span class="history-label">Temperature</span>
                    <span class="history-value">${record.temperature}°C</span>
                </div>
                <div class="history-detail">
                    <span class="history-label">Feels Like</span>
                    <span class="history-value">${record.feels_like}°C</span>
                </div>
                <div class="history-detail">
                    <span class="history-label">Humidity</span>
                    <span class="history-value">${record.humidity}%</span>
                </div>
                <div class="history-detail">
                    <span class="history-label">Wind Speed</span>
                    <span class="history-value">${record.wind_speed} km/h</span>
                </div>
                <div class="history-detail">
                    <span class="history-label">Pressure</span>
                    <span class="history-value">${record.pressure} hPa</span>
                </div>
                <div class="history-detail">
                    <span class="history-label">Weather</span>
                    <span class="history-value">${record.weather_type}</span>
                </div>
            </div>
        `;

        return item;
    }

    async loadTrends() {
        const cityInput = document.getElementById('trendsCityInput');
        const daysSelect = document.getElementById('trendsDaysSelect');
        const city = cityInput.value.trim();
        const days = parseInt(daysSelect.value);

        if (!city) {
            this.showMessage('Please enter a city name', 'error');
            return;
        }

        try {
            if (!window.dbService) {
                this.showMessage('Database service not available', 'error');
                return;
            }

            console.log(`Loading trends for ${city} over ${days} days...`);
            const container = document.getElementById('trends-container');
            container.innerHTML = '<div class="loading">Loading trends...</div>';

            const trends = await window.dbService.getWeatherTrends(city, days);
            console.log('Trends data received:', trends);

            if (trends.length === 0) {
                container.innerHTML = `<p class="no-data">No weather trends found for ${city}. Search for this city multiple times to build trend data!</p>`;
                return;
            }

            container.innerHTML = '';
            trends.forEach(trend => {
                const item = this.createTrendItem(trend);
                container.appendChild(item);
            });
            
            this.showMessage(`Loaded trends for ${city} (${trends.length} days)`, 'success');
        } catch (error) {
            console.error('Error loading trends:', error);
            this.showMessage('Error loading weather trends', 'error');
        }
    }

    createTrendItem(trend) {
        const item = document.createElement('div');
        item.className = 'trend-item';

        item.innerHTML = `
            <div class="trend-date">${trend._id}</div>
            <div class="trend-stats">
                <div class="trend-stat">
                    <div class="trend-stat-label">Avg Temp</div>
                    <div class="trend-stat-value avg">${Math.round(trend.avgTemperature)}°C</div>
                </div>
                <div class="trend-stat">
                    <div class="trend-stat-label">Max Temp</div>
                    <div class="trend-stat-value high">${Math.round(trend.maxTemperature)}°C</div>
                </div>
                <div class="trend-stat">
                    <div class="trend-stat-label">Min Temp</div>
                    <div class="trend-stat-value low">${Math.round(trend.minTemperature)}°C</div>
                </div>
                <div class="trend-stat">
                    <div class="trend-stat-label">Avg Humidity</div>
                    <div class="trend-stat-value avg">${Math.round(trend.avgHumidity)}%</div>
                </div>
                <div class="trend-stat">
                    <div class="trend-stat-label">Data Points</div>
                    <div class="trend-stat-value">${trend.count}</div>
                </div>
            </div>
        `;

        return item;
    }

    searchCity(city) {
        // Set the city in the search input and trigger search
        const searchInput = document.getElementById('searchCity');
        if (searchInput) {
            searchInput.value = city;
            searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
        }
    }

    showMessage(message, type = 'info') {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 10000;
            font-family: "Montserrat", sans-serif;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Update current weather data when new search is made
    updateCurrentWeather(city, weatherData) {
        this.currentCity = city;
        this.currentWeatherData = weatherData;
        
        // Save to database
        this.saveWeatherData(weatherData);
        
        // Update favorite button
        this.checkIfFavorite(city);
    }

    async saveWeatherData(weatherData) {
        try {
            if (window.dbService) {
                console.log('Attempting to save weather data to database...');
                const result = await window.dbService.saveWeatherData(weatherData);
                console.log('Weather data saved successfully:', result);
                
                // Show success message
                this.showMessage('Weather data saved successfully!', 'success');
            } else {
                console.error('Database service not available');
                this.showMessage('Database service not available', 'error');
            }
        } catch (error) {
            console.error('Error saving weather data:', error);
            this.showMessage('Error saving weather data', 'error');
        }
    }

    async checkIfFavorite(city) {
        try {
            if (this.userPreferences && this.userPreferences.favorite_cities) {
                const isFavorite = this.userPreferences.favorite_cities.some(fav => 
                    fav.city.toLowerCase() === city.toLowerCase()
                );
                this.updateFavoriteButton(isFavorite);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    }
}

// Global functions for button onclick handlers
window.loadHistory = async () => {
    if (window.weatherFeatures) {
        await window.weatherFeatures.loadHistory();
    }
};

window.loadFavorites = async () => {
    if (window.weatherFeatures) {
        await window.weatherFeatures.loadFavorites();
    }
};

window.loadTrends = async () => {
    if (window.weatherFeatures) {
        await window.weatherFeatures.loadTrends();
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .loading {
        text-align: center;
        color: white;
        padding: 20px;
        font-style: italic;
    }
`;
document.head.appendChild(style);

// Initialize features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing weather features...');
    window.weatherFeatures = new WeatherFeatures();
    console.log('Weather features initialized:', !!window.weatherFeatures);
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing weather features...');
    window.weatherFeatures = new WeatherFeatures();
    console.log('Weather features initialized:', !!window.weatherFeatures);
}
