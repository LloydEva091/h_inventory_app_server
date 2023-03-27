// Import the `express-rate-limit` package and the `logEvents` function from the `logger` module
const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

// Create a rate limiter middleware function for the login endpoint
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // Set the time window for the rate limiter to 1 minute
  max: 5, // Set the maximum number of requests allowed per IP address per window to 5
  message: {
    message:
      "Too many login attempts from this IP, please try again after a 60 second pause",
  }, // Set a custom error message to be returned when the rate limit is exceeded
  handler: (req, res, next, options) => {
    // Customize the response behavior when the rate limit is exceeded
    // Log the rate limit error message, request method, URL, and origin to an error log file using the `logEvents` function
    logEvents(
      `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );
    // Send the error message and status code in the response
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = loginLimiter;
