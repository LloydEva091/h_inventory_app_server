const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body; // Get email and password from request body

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let userLowerCase = await email.toLowerCase();
  const foundUser = await User.findOne({ email: userLowerCase }).exec(); // Find user in database with matching email

  // Check if user exists and is active
  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Compare password with hash stored in database
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  // Create access token with user information
  const accessToken = jwt.sign(
    {
      UserInfo: {
        email: foundUser.email,
        roles: foundUser.roles,
        userId: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key for signing token
    { expiresIn: "30m" } // Expiration time for token
  );
  // Create refresh token with email
  const refreshToken = jwt.sign(
    { email: foundUser.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  // Create and send secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // Only accessible by web server
    secure: true, // HTTPS
    sameSite: "None", // Cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry time set to match refresh token
  });
  // Send access token containing user information
  res.json({ accessToken });
});
// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  // Check if refresh token cookie exists
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  // Verify refresh token and create new access token
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findOne({ email: decoded.email }).exec();

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            email: foundUser.email,
            roles: foundUser.roles,
            userId: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    })
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
