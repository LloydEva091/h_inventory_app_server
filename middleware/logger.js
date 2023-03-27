// Import required modules
const { format } = require("date-fns"); // A library for formatting dates
const { v4: uuid } = require("uuid"); // A library for generating UUIDs
const fs = require("fs"); // The built-in Node.js file system module
const fsPromises = require("fs").promises; // The Promises version of the file system module
const path = require("path"); // The built-in Node.js path module

// Define an async function for logging events to a file
const logEvents = async (message, logFileName) => {
  // Get the current date and time in the format 'yyyyMMdd HH:mm:ss'
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  // Generate a new UUID
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`; // Format the log message with the timestamp and UUID
  try {
    // Check if the logs directory exists; if not, create it
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    // Append the log message to the specified log file
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    // Log any errors to the console
    console.log(err);
  }
};
// Define a middleware function for logging HTTP requests
const logger = (req, res, next) => {
  // Log the request details using the logEvents function defined above
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  // Log the request method and path to the console
  console.log(`${req.method} ${req.path}`);
  // Call the next middleware function in the stack
  next();
};

module.exports = { logEvents, logger };
