const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Attempt to connect to the MongoDB database using the DATABASE_URI environment variable
        await mongoose.connect(process.env.DATABASE_URI);
    } catch (error) {
        // If an error occurs while connecting to the database, log the error to the console
        console.log(error);
    }
}

module.exports = connectDB;
