// Database Service Layer for Weather App
class DatabaseService {
    constructor() {
        this.baseURL = 'http://localhost:3001';
        this.userId = this.getOrCreateUserId();
    }

    // Generate or retrieve user ID from localStorage
    getOrCreateUserId() {
        let userId = localStorage.getItem('weather_app_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('weather_app_user_id', userId);
        }
        return userId;
    }

    // Save weather data to history collection
    async saveWeatherData(weatherData) {
        try {
            console.log('Saving weather data to history collection...');
            console.log('User ID:', this.userId);
            console.log('Weather data:', weatherData);
            
            const response = await fetch(`${this.baseURL}/api/history/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...weatherData,
                    user_id: this.userId
                })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to save weather data. Status:', response.status, 'Error:', errorText);
                throw new Error(`Failed to save weather data: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Save result:', result);
            return result;
        } catch (error) {
            console.error('Error saving weather data:', error);
            return null;
        }
    }

    // Get weather history for user
    async getUserHistory(limit = 50) {
        try {
            const response = await fetch(`${this.baseURL}/api/history/${this.userId}?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch user history');
            return await response.json();
        } catch (error) {
            console.error('Error fetching user history:', error);
            return [];
        }
    }

    // Get weather history for a city
    async getWeatherHistory(city, limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/api/history/city/${encodeURIComponent(city)}?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch weather history');
            return await response.json();
        } catch (error) {
            console.error('Error fetching weather history:', error);
            return [];
        }
    }

    // Get weather trends for a city
    async getWeatherTrends(city, days = 7) {
        try {
            const response = await fetch(`${this.baseURL}/api/weather/trends/${encodeURIComponent(city)}?days=${days}`);
            if (!response.ok) throw new Error('Failed to fetch weather trends');
            return await response.json();
        } catch (error) {
            console.error('Error fetching weather trends:', error);
            return [];
        }
    }

    // Get user favorites
    async getUserFavorites() {
        try {
            const response = await fetch(`${this.baseURL}/api/favorites/${this.userId}`);
            if (!response.ok) throw new Error('Failed to fetch user favorites');
            return await response.json();
        } catch (error) {
            console.error('Error fetching user favorites:', error);
            return [];
        }
    }

    // Get user preferences
    async getUserPreferences() {
        try {
            const response = await fetch(`${this.baseURL}/api/users/preferences/${this.userId}`);
            if (!response.ok) {
                if (response.status === 500) {
                    console.warn('Server error, using fallback preferences');
                    return this.getDefaultPreferences();
                }
                throw new Error('Failed to fetch user preferences');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user preferences:', error);
            return this.getDefaultPreferences();
        }
    }

    // Update user preferences
    async updateUserPreferences(preferences) {
        try {
            const response = await fetch(`${this.baseURL}/api/users/preferences/${this.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences)
            });
            
            if (!response.ok) throw new Error('Failed to update preferences');
            return await response.json();
        } catch (error) {
            console.error('Error updating preferences:', error);
            return null;
        }
    }

    // Add city to favorites
    async addToFavorites(cityData) {
        try {
            console.log('Adding to favorites:', cityData);
            console.log('User ID:', this.userId);
            console.log('API endpoint:', `${this.baseURL}/api/favorites/${this.userId}`);
            
            const response = await fetch(`${this.baseURL}/api/favorites/${this.userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cityData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to add to favorites. Status:', response.status, 'Error:', errorText);
                throw new Error(`Failed to add to favorites: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Add to favorites result:', result);
            return result;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return null;
        }
    }

    // Remove city from favorites
    async removeFromFavorites(city) {
        try {
            const response = await fetch(`${this.baseURL}/api/favorites/${this.userId}/${encodeURIComponent(city)}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to remove from favorites');
            return await response.json();
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return null;
        }
    }

    // Get user analytics
    async getUserAnalytics() {
        try {
            const response = await fetch(`${this.baseURL}/api/analytics/${this.userId}`);
            if (!response.ok) throw new Error('Failed to fetch analytics');
            return await response.json();
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return [];
        }
    }

    // Default preferences
    getDefaultPreferences() {
        return {
            user_id: this.userId,
            favorite_cities: [],
            default_units: 'metric',
            notifications: {
                enabled: false,
                temperature_threshold: null,
                weather_conditions: []
            },
            theme: 'light',
            created_at: new Date(),
            last_updated: new Date()
        };
    }

    // Check if backend is available
    async isBackendAvailable() {
        try {
            const response = await fetch(`${this.baseURL}/api/users/preferences/${this.userId}`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Initialize database service
window.dbService = new DatabaseService();
