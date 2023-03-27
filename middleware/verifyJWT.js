// Import the 'jsonwebtoken' library
const jwt = require("jsonwebtoken");

// Define a middleware function named 'verifyJWT' that takes in the request, response, and next middleware function
const verifyJWT = (req, res, next) => {
  // Get the Authorization header value from the request headers
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // If the Authorization header is not found or it doesn't start with 'Bearer ', return a 401 Unauthorized response
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Extract the token from the Authorization header value
  const token = authHeader.split(" ")[1];
  // Verify the token using the 'jsonwebtoken' library's 'verify' function
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET, // The secret key used to sign the token
    (err, decoded) => {
      // A callback function that is called with either an error or the decoded token
      if (err) return res.status(403).json({ message: "Forbidden" }); // If an error occurs, return a 403 Forbidden response
      // Set the email, roles, and userId properties of the request object to the corresponding values from the decoded token
      req.user = decoded.UserInfo.email;
      req.roles = decoded.UserInfo.roles;
      req.userId = decoded.UserInfo.userId;
      next(); // Call the next middleware function in the pipeline
    }
  );
};

module.exports = verifyJWT;
