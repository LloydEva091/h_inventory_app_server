require('dotenv').config();
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

const PORT = process.env.PORT || 3500;

connectDB();

console.log(process.env.NODE_ENV);

app.use(logger);

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Tell express where to find static files 
app.use('/', express.static(path.join(__dirname, 'public')));
//app.use(express.static('public'));  // works as it depends where our server.js is

app.use('/', require('./routes/root'));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/menus', require('./routes/menusRoutes'));

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

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});