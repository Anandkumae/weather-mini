# MongoDB Collections Guide

## **📊 Database Structure**

Your weather app now uses **separate collections** for different features, making data management more efficient and organized.

## **🗂️ Collections Overview**

### **1. `history` Collection**
Stores all weather search history for all users.

**Schema:**
```javascript
{
    user_id: String,           // User identifier
    city: String,              // City name
    country: String,           // Country code
    coordinates: {
        lat: Number,           // Latitude
        lon: Number            // Longitude
    },
    timestamp: Date,           // When searched
    temperature: Number,       // Temperature in °C
    feels_like: Number,        // Feels like temperature
    humidity: Number,          // Humidity percentage
    pressure: Number,          // Atmospheric pressure
    wind_speed: Number,        // Wind speed km/h
    wind_direction: Number,    // Wind direction degrees
    visibility: Number,        // Visibility in km
    weather_type: String,      // Weather type (e.g., "Clear", "Clouds")
    weather_description: String, // Detailed description
    sunrise: Date,             // Sunrise time
    sunset: Date,              // Sunset time
    api_source: String         // API source (default: "openweathermap")
}
```

**API Endpoints:**
- `POST /api/history/save` - Save weather search
- `GET /api/history/:user_id` - Get user's history
- `GET /api/history/city/:city` - Get history for specific city

---

### **2. `favorites` Collection**
Stores user's favorite cities for quick access.

**Schema:**
```javascript
{
    user_id: String,           // User identifier
    city: String,              // City name
    country: String,           // Country code
    coordinates: {
        lat: Number,           // Latitude
        lon: Number            // Longitude
    },
    added_date: Date,          // When added to favorites
    last_searched: Date        // Last time this city was searched
}
```

**API Endpoints:**
- `POST /api/favorites/:user_id` - Add to favorites
- `GET /api/favorites/:user_id` - Get user's favorites
- `DELETE /api/favorites/:user_id/:city` - Remove from favorites

---

### **3. `trends` Collection**
Stores calculated weather trends and analytics.

**Schema:**
```javascript
{
    user_id: String,           // User identifier
    city: String,              // City name
    date: String,              // Date in YYYY-MM-DD format
    avg_temperature: Number,   // Average temperature for the day
    max_temperature: Number,   // Maximum temperature for the day
    min_temperature: Number,   // Minimum temperature for the day
    avg_humidity: Number,      // Average humidity for the day
    data_points: Number,       // Number of data points used
    created_at: Date           // When trend was calculated
}
```

**API Endpoints:**
- `GET /api/trends/:city` - Get trends for specific city
- `GET /api/trends/user/:user_id` - Get user's overall trends

---

### **4. `userpreferences` Collection**
Stores user settings and preferences.

**Schema:**
```javascript
{
    user_id: String,           // User identifier (unique)
    default_units: String,     // "metric" or "imperial"
    notifications: {
        enabled: Boolean,      // Whether notifications are enabled
        temperature_threshold: Number, // Alert threshold
        weather_conditions: [String] // Conditions to alert for
    },
    theme: String,            // UI theme ("light" or "dark")
    created_at: Date,          // When user account was created
    last_updated: Date         // Last time preferences were updated
}
```

**API Endpoints:**
- `GET /api/users/preferences/:user_id` - Get user preferences
- `PUT /api/users/preferences/:user_id` - Update preferences

---

### **5. `analytics` Collection**
Stores user activity and search analytics.

**Schema:**
```javascript
{
    event_type: String,        // Type of event ("weather_search", "favorite_added", etc.)
    user_id: String,           // User identifier
    city: String,              // City involved (if applicable)
    timestamp: Date,           // When event occurred
    metadata: Mixed            // Additional event data
}
```

**API Endpoints:**
- `GET /api/analytics/:user_id` - Get user's analytics

---

## **🔄 Data Flow**

### **When User Searches for Weather:**
1. Data is saved to `history` collection
2. Analytics event is logged to `analytics` collection
3. If city is a favorite, `last_searched` is updated in `favorites` collection

### **When User Adds Favorite:**
1. City is added to `favorites` collection
2. Analytics event is logged to `analytics` collection

### **When User Views History:**
1. Data is fetched from `history` collection
2. Results are grouped by city for display

### **When User Views Trends:**
1. Trends are calculated from `history` collection data
2. Results are aggregated and displayed

---

## **📈 Performance Benefits**

### **Separate Collections Advantages:**

1. **Faster Queries** - Each collection has specific indexes
2. **Scalability** - Collections can grow independently
3. **Data Organization** - Related data is grouped together
4. **Maintenance** - Easier to manage and backup specific data
5. **Security** - Different access patterns for different data types

### **Indexing Strategy:**
```javascript
// History collection indexes
db.history.createIndex({ user_id: 1, timestamp: -1 })
db.history.createIndex({ city: 1, timestamp: -1 })

// Favorites collection indexes
db.favorites.createIndex({ user_id: 1, added_date: -1 })
db.favorites.createIndex({ user_id: 1, city: 1 })

// Analytics collection indexes
db.analytics.createIndex({ user_id: 1, timestamp: -1 })
db.analytics.createIndex({ event_type: 1, timestamp: -1 })
```

---

## **🎯 UI Integration**

### **History Tab:**
- Fetches from `/api/history/:user_id`
- Groups results by city
- Shows most recent 5 searches per city

### **Favorites Tab:**
- Fetches from `/api/favorites/:user_id`
- Displays as clickable cards
- Shows "added date" and "last searched"

### **Trends Tab:**
- Fetches from `/api/trends/:city`
- Calculates from history data
- Shows temperature patterns over time

---

## **🔍 MongoDB Atlas View**

In your Atlas dashboard, you'll see these collections:

1. **histories** - All weather searches
2. **favorites** - User favorite cities  
3. **userpreferences** - User settings
4. **analytics** - Activity tracking

Each collection can be viewed, filtered, and managed independently in Atlas.

---

## **🚀 Future Enhancements**

### **Potential Additions:**

1. **Weather Alerts Collection**
   ```javascript
   {
       user_id: String,
       city: String,
       alert_type: String,
       condition: Object,
       is_active: Boolean,
       created_at: Date
   }
   ```

2. **User Sessions Collection**
   ```javascript
   {
       user_id: String,
       session_id: String,
       start_time: Date,
       end_time: Date,
       searches_count: Number
   }
   ```

3. **Weather Comparisons Collection**
   ```javascript
   {
       user_id: String,
       cities: [String],
       comparison_date: Date,
       metrics: Object
   }
   ```

---

## **📊 Data Relationships**

```
User (userpreferences)
├── History (history collection)
├── Favorites (favorites collection)
├── Trends (calculated from history)
└── Analytics (analytics collection)
```

Each user has:
- Multiple history records
- Multiple favorite cities
- Calculated trends based on history
- Analytics tracking all activities

---

## **🛠️ Management Commands**

### **View Collection Sizes:**
```javascript
db.histories.countDocuments()
db.favorites.countDocuments()
db.userpreferences.countDocuments()
db.analytics.countDocuments()
```

### **Sample Queries:**
```javascript
// Get most searched cities
db.histories.aggregate([
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
])

// Get user activity summary
db.analytics.aggregate([
    { $match: { user_id: "user_123" } },
    { $group: { 
        _id: "$event_type", 
        count: { $sum: 1 },
        last_occurred: { $max: "$timestamp" }
    }}
])
```

This structure provides a robust, scalable foundation for your weather application with clear separation of concerns and excellent performance characteristics.
