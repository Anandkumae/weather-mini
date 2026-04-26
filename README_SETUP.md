# Weather App with MongoDB - Setup Guide

## **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## **Installation Steps**

### **1. Install Dependencies**
```bash
cd weather-app-using-openweathermap-api
npm install
```

### **2. Environment Setup**
Update your `.env` file with your configurations:
```env
# OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_actual_api_key_here

# API Configuration
API_UNITS=metric
API_BASE_URL=https://api.openweathermap.org/data/2.5

# MongoDB Connection (choose one)
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/weather-app

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weather-app
```

### **3. MongoDB Setup**

#### **Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
mongod
```

#### **Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add to `.env` file

### **4. Start the Application**

#### **Development Mode**
```bash
npm run dev
```
This starts the server with auto-restart on file changes.

#### **Production Mode**
```bash
npm start
```

### **5. Access the Application**
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3001 (served by Express)
- **Database**: MongoDB (local or Atlas)

## **Features Available**

### **1. Weather Search**
- Real-time weather data from OpenWeatherMap API
- Automatic saving to database

### **2. Weather History**
- View past weather searches
- Detailed weather information for each search
- Chronological ordering

### **3. Favorite Cities**
- Save frequently searched cities
- Quick access to favorite locations
- Remove favorites functionality

### **4. Weather Trends**
- Analyze weather patterns over time
- Temperature averages (min, max, avg)
- Humidity trends
- Data point counts

### **5. User Preferences**
- Persistent user settings
- Favorite cities management
- Unit preferences (metric/imperial)

## **API Endpoints**

### **Weather Data**
- `POST /api/weather/save` - Save weather data
- `GET /api/weather/history/:city` - Get weather history
- `GET /api/weather/trends/:city` - Get weather trends

### **User Management**
- `GET /api/users/preferences/:user_id` - Get user preferences
- `PUT /api/users/preferences/:user_id` - Update preferences

### **Favorites**
- `POST /api/favorites/:user_id` - Add favorite
- `DELETE /api/favorites/:user_id/:city` - Remove favorite

### **Analytics**
- `GET /api/analytics/:user_id` - Get user analytics

## **Database Schema**

### **Weather History**
```javascript
{
  city: String,
  country: String,
  coordinates: { lat: Number, lon: Number },
  timestamp: Date,
  temperature: Number,
  feels_like: Number,
  humidity: Number,
  pressure: Number,
  wind_speed: Number,
  weather_type: String
}
```

### **User Preferences**
```javascript
{
  user_id: String,
  favorite_cities: [{
    city: String,
    country: String,
    coordinates: { lat: Number, lon: Number },
    added_date: Date
  }],
  default_units: String,
  theme: String
}
```

## **Troubleshooting**

### **Common Issues**

#### **1. MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# For local MongoDB, ensure service is running
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### **2. API Key Issues**
- Verify your OpenWeatherMap API key is valid
- Check `.env` file has correct key
- Ensure API key has sufficient quota

#### **3. Port Conflicts**
- Change port in `.env`: `PORT=3002`
- Or stop conflicting services

#### **4. CORS Issues**
- Backend handles CORS for frontend
- Ensure both frontend and backend use same origin in development

### **Debug Mode**
Enable debug logging:
```bash
DEBUG=app:* npm run dev
```

## **Development Workflow**

### **1. Make Changes**
- Frontend: Edit HTML/CSS/JS files
- Backend: Edit `server.js`
- Database: Modify schemas in `server.js`

### **2. Test Changes**
- Server auto-restarts with `npm run dev`
- Refresh browser to see frontend changes
- Check browser console for errors

### **3. Database Management**
```bash
# Access MongoDB shell
mongosh

# View collections
use weather-app
show collections

# Query weather history
db.weatherhistories.find().pretty()

# Query user preferences
db.userpreferences.find().pretty()
```

## **Production Deployment**

### **Environment Variables**
Set these in your hosting environment:
- `MONGODB_URI`
- `OPENWEATHER_API_KEY`
- `PORT`

### **Hosting Options**
1. **Heroku**: Connect to MongoDB Atlas
2. **Vercel**: Serverless functions
3. **AWS EC2**: Full server control
4. **DigitalOcean**: Simple deployment

### **Security Considerations**
- Use environment variables for all secrets
- Enable MongoDB Atlas IP whitelisting
- Implement rate limiting
- Use HTTPS in production

## **Performance Optimization**

### **Database Indexing**
```javascript
// Add these indexes for better performance
db.weatherhistories.createIndex({ city: 1, timestamp: -1 })
db.weatherhistories.createIndex({ user_id: 1 })
db.userpreferences.createIndex({ user_id: 1 })
```

### **Caching**
- Implement Redis for frequently accessed data
- Cache API responses from OpenWeatherMap
- Use browser caching for static assets

## **Monitoring**

### **Application Metrics**
- Response times
- Error rates
- Database query performance
- API usage statistics

### **Logs**
```bash
# View application logs
npm run dev 2>&1 | tee app.log

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## **Contributing**

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## **Support**

For issues:
1. Check browser console for errors
2. Verify MongoDB connection
3. Validate API key
4. Review this setup guide

## **Next Steps**

After successful setup:
1. Explore the History tab
2. Add favorite cities
3. View weather trends
4. Customize user preferences
5. Check analytics data

Enjoy your enhanced weather application with MongoDB integration!
