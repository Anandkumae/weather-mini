// Weather App Backend Server with MongoDB Integration
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas for separate collections

// History Collection Schema
const historySchema = new mongoose.Schema({
    user_id: String,
    city: String,
    country: String,
    coordinates: {
        lat: Number,
        lon: Number
    },
    timestamp: { type: Date, default: Date.now },
    temperature: Number,
    feels_like: Number,
    humidity: Number,
    pressure: Number,
    wind_speed: Number,
    wind_direction: Number,
    visibility: Number,
    weather_type: String,
    weather_description: String,
    sunrise: Date,
    sunset: Date,
    api_source: { type: String, default: 'openweathermap' }
});

// Favorites Collection Schema
const favoritesSchema = new mongoose.Schema({
    user_id: String,
    city: String,
    country: String,
    coordinates: {
        lat: Number,
        lon: Number
    },
    added_date: { type: Date, default: Date.now },
    last_searched: { type: Date, default: Date.now }
});

// Trends Collection Schema
const trendsSchema = new mongoose.Schema({
    user_id: String,
    city: String,
    date: String, // YYYY-MM-DD format
    avg_temperature: Number,
    max_temperature: Number,
    min_temperature: Number,
    avg_humidity: Number,
    data_points: Number,
    created_at: { type: Date, default: Date.now }
});

// User Preferences Schema (for user management)
const userPreferencesSchema = new mongoose.Schema({
    user_id: { type: String, unique: true },
    default_units: { type: String, default: 'metric' },
    notifications: {
        enabled: { type: Boolean, default: false },
        temperature_threshold: Number,
        weather_conditions: [String]
    },
    theme: { type: String, default: 'light' },
    created_at: { type: Date, default: Date.now },
    last_updated: { type: Date, default: Date.now }
});

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
    event_type: String,
    user_id: String,
    city: String,
    timestamp: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
});

// Create Models for separate collections
const History = mongoose.model('History', historySchema);
const Favorites = mongoose.model('Favorites', favoritesSchema);
const Trends = mongoose.model('Trends', trendsSchema);
const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);

// API Routes for Separate Collections

// Save to History Collection
app.post('/api/history/save', async (req, res) => {
    try {
        const weatherData = req.body;
        const newHistory = new History(weatherData);
        await newHistory.save();
        
        // Log analytics event
        await new Analytics({
            event_type: 'weather_search',
            user_id: req.body.user_id || 'anonymous',
            city: weatherData.city,
            metadata: { temperature: weatherData.temperature }
        }).save();
        
        res.status(201).json(newHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get History for User
app.get('/api/history/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const history = await History
            .find({ user_id })
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get History for Specific City
app.get('/api/history/city/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const history = await History
            .find({ city: new RegExp(city, 'i') })
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add to Favorites Collection
app.post('/api/favorites/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const favoriteData = req.body;
        
        // Check if already exists
        const existing = await Favorites.findOne({ 
            user_id, 
            city: favoriteData.city 
        });
        
        if (existing) {
            // Update last searched
            existing.last_searched = new Date();
            await existing.save();
            return res.json({ message: 'Favorite updated successfully' });
        }
        
        const newFavorite = new Favorites({
            ...favoriteData,
            user_id
        });
        await newFavorite.save();
        
        res.status(201).json(newFavorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Favorites
app.get('/api/favorites/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const favorites = await Favorites
            .find({ user_id })
            .sort({ added_date: -1 });
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove from Favorites
app.delete('/api/favorites/:user_id/:city', async (req, res) => {
    try {
        const { user_id, city } = req.params;
        
        const result = await Favorites.deleteOne({ 
            user_id, 
            city: city 
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }
        
        res.json({ message: 'Favorite removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Trends for City
app.get('/api/trends/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Calculate trends from history data
        const trends = await History.aggregate([
            { $match: { city: new RegExp(city, 'i'), timestamp: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    avgTemperature: { $avg: "$temperature" },
                    maxTemperature: { $max: "$temperature" },
                    minTemperature: { $min: "$temperature" },
                    avgHumidity: { $avg: "$humidity" },
                    dataPoints: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Trends
app.get('/api/trends/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const trends = await History.aggregate([
            { $match: { user_id, timestamp: { $gte: startDate } } },
            {
                $group: {
                    _id: { city: "$city" },
                    searches: { $sum: 1 },
                    avgTemperature: { $avg: "$temperature" },
                    lastSearched: { $max: "$timestamp" }
                }
            },
            { $sort: { searches: -1 } }
        ]);
        
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Preferences Routes
app.get('/api/users/preferences/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        let preferences = await UserPreferences.findOne({ user_id });
        
        if (!preferences) {
            preferences = new UserPreferences({ user_id });
            await preferences.save();
        }
        
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/preferences/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const updates = req.body;
        updates.last_updated = new Date();
        
        const preferences = await UserPreferences.findOneAndUpdate(
            { user_id },
            updates,
            { new: true, upsert: true }
        );
        
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analytics Routes
app.get('/api/analytics/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const analytics = await Analytics.find({ user_id })
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Legacy route for compatibility
app.post('/api/weather/save', async (req, res) => {
    try {
        const weatherData = req.body;
        const newHistory = new History(weatherData);
        await newHistory.save();
        
        // Log analytics event
        await new Analytics({
            event_type: 'weather_search',
            user_id: req.body.user_id || 'anonymous',
            city: weatherData.city,
            metadata: { temperature: weatherData.temperature }
        }).save();
        
        res.status(201).json(newHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
