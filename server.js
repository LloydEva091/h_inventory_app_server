// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOption');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');

// Define the port on which the server will listen for requests
const PORT = process.env.PORT || 3500;

// Connect to the MongoDB database
connectDB();

// Log the current environment
console.log(process.env.NODE_ENV);

// Use the following middleware for every request
app.use(logger); // log each incoming request
app.use(cors(corsOptions)); // allow cross-origin requests
app.use(express.json()); // parse incoming requests with JSON payloads
app.use(cookieParser()); // parse cookies from incoming requests

// Tell express where to find static files 
app.use('/', express.static(path.join(__dirname, 'public')));

// Define routes for the different API endpoints
app.use('/', require('./routes/root'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/menus', require('./routes/menusRoutes'));
app.use('/api/weekly', require('./routes/weeklyMenuRoutes'));

// A catch all to send to user that access page that does not exist
app.all('*', (req,res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views','404.html'));
    } else if(req.accepts('json')) {
        res.json({message: '404 Not Found'});
    } else {
        res.type('txt').send('404 Not Found');
    }
});

// Use the errorHandler middleware to handle errors
app.use(errorHandler);

// When the MongoDB connection is open, start the server
mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// When there is an error in the MongoDB connection, log it
mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});
