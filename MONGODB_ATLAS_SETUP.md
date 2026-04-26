# MongoDB Atlas Integration Guide

## **Step 1: Create MongoDB Atlas Account**

1. **Sign Up**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" or "Sign Up"
   - Choose "Shared Cluster" (Free tier)
   - Fill in your details (email, password, etc.)

2. **Create Cluster**
   - Select "Cloud Provider": AWS, Azure, or GCP
   - Choose "Region" closest to your users
   - Cluster Tier: M0 Sandbox (Free)
   - Cluster Name: `weather-app-cluster` (or your choice)

## **Step 2: Configure Database Access**

1. **Create Database User**
   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - **Username**: `weatherapp` (or your choice)
   - **Password**: Generate a strong password (save it!)
   - **Permissions**: Read and write to any database

2. **Whitelist IP Address**
   - Go to "Network Access" in left menu
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - **OR** add your current IP for better security

## **Step 3: Get Connection String**

1. **Connect to Cluster**
   - Click "Connect" button on your cluster
   - Choose "Drivers" option
   - Select "Node.js" as driver
   - Copy the connection string

2. **Connection String Format**
   ```
   mongodb+srv://<username>:<password>@weather-app-cluster.xxxxx.mongodb.net/weather-app?retryWrites=true&w=majority
   ```

## **Step 4: Update Environment Variables**

1. **Edit .env file**
   ```env
   # OpenWeatherMap API Key (get yours from https://openweathermap.org/api)
   OPENWEATHER_API_KEY=your_api_key_here
   
   # API Configuration
   API_UNITS=metric
   API_BASE_URL=https://api.openweathermap.org/data/2.5
   
   # MongoDB Atlas Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weather-app?retryWrites=true&w=majority
   ```

2. **Replace placeholders**
   - `your_api_key_here` with your actual OpenWeatherMap API key
   - `username:password` with your MongoDB credentials
   - `cluster.mongodb.net` with your actual cluster URI

## **Step 5: Install MongoDB Dependencies**

```bash
# Already installed, but verify:
npm install mongoose
```

## **Step 6: Update Server Configuration**

The server.js is already configured, but let's verify the connection:

```javascript
// In server.js, this should already be present:
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
```

## **Step 7: Test Connection**

1. **Start the Server**
   ```bash
   npm run dev
   ```

2. **Check Console Output**
   - Should see: "Connected to MongoDB"
   - If error, check connection string and password

3. **Verify Database**
   - Go to MongoDB Atlas dashboard
   - Click "Collections" under your cluster
   - Should see collections being created when you use the app

## **Step 8: Deploy and Test**

1. **Test Weather Search**
   - Open http://localhost:3001
   - Search for any city (e.g., "London")
   - Check that data is saved to database

2. **Test Features**
   - Go to "History" tab - should show previous searches
   - Add favorites - should save to database
   - Check trends - should analyze saved data

3. **Verify in Atlas**
   - Go to Atlas dashboard
   - Click "Collections"
   - Should see:
     - `histories` collection
     - `favorites` collection
     - `userpreferences` collection

## **Troubleshooting**

### **Common Issues**

#### **1. Connection Timeout**
```
Error: MongooseServerSelectionError: Server selection timed out
```
**Solution**: Check IP whitelist in Network Access

#### **2. Authentication Failed**
```
Error: Authentication failed
```
**Solution**: Verify username and password in connection string

#### **3. Database Not Found**
```
Error: Database weather-app does not exist
```
**Solution**: Database is created automatically on first write

#### **4. CORS Issues**
Frontend can't connect to backend
**Solution**: Server.js already has CORS configured

### **Debug Connection**

Add this to server.js for debugging:
```javascript
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});
```

## **Step 9: Production Considerations**

### **Security**
1. **Environment Variables**
   - Never commit .env to Git
   - Use hosting provider's environment variables in production

2. **Network Security**
   - Remove "Allow Access from Anywhere" in production
   - Add specific IP addresses only

3. **Database Security**
   - Use strong passwords
   - Enable MongoDB Atlas authentication
   - Consider enabling encryption

### **Performance**
1. **Indexes**
   ```javascript
   // Add to server.js after connection
   const db = mongoose.connection.db;
   db.collection('histories').createIndex({ city: 1, timestamp: -1 });
   db.collection('favorites').createIndex({ user_id: 1 });
   ```

2. **Connection Pooling**
   ```javascript
   mongoose.connect(MONGODB_URI, {
       useNewUrlParser: true,
       useUnifiedTopology: true,
       maxPoolSize: 10,
       serverSelectionTimeoutMS: 5000,
       socketTimeoutMS: 45000,
   });
   ```

## **Step 10: Alternative Connection Methods**

### **Method 1: Using MongoDB Compass**
1. Download MongoDB Compass
2. Use connection string from Atlas
3. Browse collections visually

### **Method 2: Using Atlas UI**
1. Go to Atlas dashboard
2. Click "Collections"
3. View and edit data directly

### **Method 3: Programmatic Access**
```javascript
// Test connection directly
const mongoose = require('mongoose');

mongoose.connect('your-connection-string')
.then(() => {
    console.log('Connected successfully');
    return mongoose.connection.db.collection('histories').findOne();
})
.then(doc => {
    console.log('Sample document:', doc);
})
.catch(err => {
    console.error('Connection failed:', err);
});
```

## **Quick Setup Commands**

```bash
# 1. Install dependencies
npm install

# 2. Update .env with your Atlas connection string
# Edit .env file

# 3. Start development server
npm run dev

# 4. Test in browser
# Open http://localhost:3001

# 5. Search for weather data
# Should save to Atlas automatically
```

## **Verification Checklist**

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Sandbox)
- [ ] Database user created
- [ ] IP address whitelisted
- [ ] Connection string copied
- [ ] .env file updated with Atlas URI
- [ ] Server starts without errors
- [ ] "Connected to MongoDB" message appears
- [ ] Weather search works
- [ ] Data appears in Atlas collections
- [ ] History tab shows data
- [ ] Favorites work correctly
- [ ] Trends display properly

## **Next Steps**

After successful Atlas integration:

1. **Monitor Usage**: Check Atlas dashboard for storage usage
2. **Optimize Queries**: Add database indexes
3. **Scale Up**: Upgrade cluster if needed
4. **Backup**: Enable automated backups
5. **Security**: Review access logs regularly

Your weather app is now fully integrated with MongoDB Atlas!
