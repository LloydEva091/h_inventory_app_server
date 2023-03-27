const Stock = require("../models/Stock");
const Recipe = require("../models/Recipe");
const asyncHandler = require("express-async-handler");
const cron = require("node-cron");

const requiredFields = {
  user: "User",
  name: "Name",
  categories: "Category",
  cost: "Cost",
  current_stock: "Current stock",
  min_stock: "Min stock",
  max_stock: "Max stock",
  unit: "Unit",
  currency: "Currency",
  per_unit: "Per Unit",
  per_stock: "Per Stock",
  per_cost: "Per Stock Cost",
};

// Schedule a cron job to run every week
cron.schedule("0 0 */1 * *", () => {
  // Run code to update isChecked property for relevant inventory items
  // Find all items where isChecked is true
  Stock.find({ isChecked: true }, (err, items) => {
    // If there is an error while finding items to update, log an error message and return
    if (err) {
      console.error(`Error finding items to update: ${err}`);
      return;
    }
    // Iterate over each item and update its isChecked property to false
    items.forEach((item) => {
      item.isChecked = false;
      // Save the updated item to the database
      item.save((err) => {
        if (err) {
          // If there is an error while updating an item, log an error message
          console.error(`Error updating item ${item._id}: ${err}`);
        } else {
          // If the item is updated successfully, log a success message
          console.log(`Item ${item._id} updated successfully.`);
        }
      });
    });
  });
});


// Check stock level
const stockLevelChecker = (min, max, current) => {
  current = Math.floor(current);
  if (current >= max && current > min) {
    return "Full";
  } else if (current >= min && current < max) {
    return "Good";
  } else {
    return "Low";
  }
};

// @desc Get all stocks
// @route GET /stocks
// @access Private
const getAllStocks = asyncHandler(async (req, res) => {
  // Get all stocks from MongoDB
  const stocks = await Stock.find().lean();
  // If no stocks are found, return a 400 status code with a message
  if (!stocks?.length) {
    return res.status(400).json({ message: "No stocks found" });
  }
  // Return all the stocks
  res.json(stocks);
});

// @desc Create new stock
// @route POST /stocks
// @access Private
const createNewStock = asyncHandler(async (req, res) => {
  // Destructure request body to extract data
  const {
    user,
    name,
    categories,
    cost,
    current_stock,
    min_stock,
    max_stock,
    unit,
    currency,
    per_unit,
    per_stock,
    per_cost,
  } = req.body;

  // Initialize variable to hold stock status
  let stock_status = "";

  // Confirm that required fields are present
  for (const [field, message] of Object.entries(requiredFields)) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${message} field is required` });
    }
  }

  // Check the current stock level and set the stock status accordingly
  stock_status = stockLevelChecker(min_stock, max_stock, current_stock);

  try {
    // Create a new Stock object and save it to the database
    const newStock = new Stock({
      user,
      name,
      categories,
      cost,
      unit,
      current_stock,
      min_stock,
      max_stock,
      currency,
      stock_status,
      per_stock,
      per_unit,
      per_cost,
    });
    const savedStock = await newStock.save();
    res.status(201).json({ message: "New stock created" });
  } catch (error) {
    // Handle any errors that occur during the creation of the stock
    if (error.code === 11000) {
      res.status(409).json({ message: "Duplicate stock name detected" });
    } else {
      res.status(400).json({ message: "Invalid stock data received" });
    }
  }
});

// @desc Update a stock
// @route PATCH /stocks
// @access Private
const updateStock = asyncHandler(async (req, res) => {
  // Destructure request body to extract data
  const {
    id,
    user,
    name,
    categories,
    cost,
    currency,
    current_stock,
    unit,
    min_stock,
    max_stock,
    per_stock,
    per_unit,
    per_cost,
    isChecked,
  } = req.body;

  let { stock_status } = req.body; // Get the stock status from the request body, but make it mutable

  // Confirm that required fields are present
  for (const [field, message] of Object.entries(requiredFields)) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${message} field is required` });
    }
  }
  // Check if there is a duplicate name for a different stock item
  const duplicate = await Stock.findOne({ name }).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate stock title" });
  }
  // Check the stock status based on the current stock and minimum stock values
  stock_status = stockLevelChecker(min_stock, max_stock, current_stock);

  // Check if the stock to update exists in the database
  const stock = await Stock.findById(id).exec();
  if (!stock) {
    return res.status(400).json({ message: "Stock not found" });
  }

  // Set the new stock data to the old stock data
  stock.user = user;
  stock.name = name;
  stock.categories = categories;
  stock.cost = cost;
  stock.unit = unit;
  stock.currency = currency;
  stock.per_stock = per_stock;
  stock.per_unit = per_unit;
  stock.per_cost = per_cost;
  stock.min_stock = min_stock;
  stock.max_stock = max_stock;
  stock.stock_status = stock_status;
  stock.isChecked = isChecked;

  // If current stock is less than or equal to zero, set it to zero
  if (current_stock > 0) {
    stock.current_stock = current_stock;
  } else {
    stock.current_stock = 0;
  }
  // Save the updated stock data to the database
  const updatedStock = await stock.save();
  res.json(`'${updatedStock.name}' updated`);
});

// @desc Delete a stock
// @route DELETE /stocks
// @access Private
const deleteStock = asyncHandler(async (req, res) => {
  // Retrieve the stock ID from the request body
  const { id } = req.body;
  // Confirm that the ID parameter is present
  if (!id) {
    // Return a 400 Bad Request response if the ID is missing
    return res.status(400).json({ message: "Stock ID required" });
  }
  // Check if the stock is used in any recipe
  const recipe = await Recipe.findOne({ "ingredients.stock": { $in: [id] } })
    .lean()
    .exec();
  // If the stock is used in a recipe, return an error message
  if (recipe) {
    return res.status(400).json({
      message: "Stock has assigned recipe, please delete the recipe first",
    });
  }
  // Retrieve the stock to delete by ID
  const stock = await Stock.findById(id).exec();
  // If the stock with the provided ID is not found, return an error message
  if (!stock) {
    return res.status(400).json({ message: "Stock not found" });
  }
  // Attempt to delete the stock from the database
  const result = await stock.deleteOne();
  // Construct a success message with the name and ID of the deleted stock
  const reply = `Stock '${result.name}' with ID ${result._id} deleted`;
  // Return a JSON response with the success message
  res.json(reply);
});


// @desc Check a stock
// @route /stocks/checks/:id
// @access Private
const checkStock = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the 'id' parameter from the request object
  // Check if 'id' is present
  // If not present, return a response with a 400 status code and an error message
  if (!id) {
    return res.status(400).json({ message: "Id field are required." });
  }
  // Use the 'findById' method on the 'Stock' collection to search for a stock with the given 'id'
  const stock = await Stock.findById(id).exec();

  // Check if a stock was found
  // If no stock was found, return a response with a 400 status code and an error message
  if (!stock) {
    return res.status(400).json({ message: "Stock not found" });
  }
  // Update the 'isChecked' property of the stock to true
  stock.isChecked = true;
  // Save the updated stock object to the database
  const updateStock = await stock.save();
  // Return a response with a JSON message indicating that the stock was checked
  res.json(`${updateStock.name} was checked`);
});

module.exports = {
  getAllStocks,
  createNewStock,
  updateStock,
  deleteStock,
  checkStock,
};
