const allowedOrigins = require('./allowedOrigins');

// Create a corsOptions object with origin, credentials, and optionSuccessStatus properties
const corsOptions = {
    // Set the origin property to a function that checks if the request's origin is in the allowedOrigins array
    origin: (origin, callback) => {
        // If the origin is in the allowedOrigins array or is null/undefined, call the callback function with a null error and true as the second argument
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            callback(null, true);
        } else {
            // Otherwise, call the callback function with a new Error object as the first argument and false as the second argument
            callback(new Error('Not allowed by CORS'));
        }
    },
    // Set the credentials property to true to allow cookies to be sent with the request
    credentials: true,
    // Set the optionSuccessStatus property to 200 to return a 200 status code for preflight requests
    optionSuccessStatus : 200
}

module.exports = corsOptions;
