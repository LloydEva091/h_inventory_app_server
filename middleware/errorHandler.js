// Import the logEvents function from the logger module
const { logEvents } = require("./logger");

// Define an error handler middleware function that logs errors and sends an error response to the client
const errorHandler = (err, req, res, next) => {
  // Log the error message, request method, URL, and origin to the error log file using the logEvents function
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  // Print the error stack trace to the console for debugging purposes
  console.log(err.stack);
  // Determine the HTTP status code to send in the response (default to 500 if not set)
  const status = res.statusCode ? res.statusCode : 500;
  // Set the HTTP status code in the response
  res.status(status);
  // Send a JSON response with an error message
  res.json({ message: err.message });
};

module.exports = errorHandler;
