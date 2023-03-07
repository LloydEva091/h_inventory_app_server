const Stock = require('../models/Stock');
const User = require('../models/User');
const Recipe = require('../models/Recipe')
const asyncHandler = require('express-async-handler');


// Check stock level
const stockLevelChecker = (min, max, current) => {
    if (current >= max) {
        return 'Full';
    } else if (current >= min) {
        return 'Good';
    } else {
        return 'Low';
    }
};



// @desc Get all stocks 
// @route GET /stocks
// @access Private
const getAllStocks = asyncHandler(async (req, res) => {
    // Get all stocks from MongoDB
    const stocks = await Stock.find().lean();

    // If no stocks 
    if (!stocks?.length) {
        return res.status(400).json({ message: 'No stocks found' });
    }

    // Add username to each stock before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const stocksWithUser = await Promise.all(stocks.map(async (stock) => {
        const user = await User.findById(stock.user).lean().exec();
        return { ...stock, username: user.username };
    }))
    res.json(stocksWithUser);
});

// @desc Create new stock
// @route POST /stocks
// @access Private
const createNewStock = asyncHandler(async (req, res) => {
    const { user, name, categories, cost, current_stock, min_stock, max_stock, unit, currency, per_unit, per_stock, per_cost } = req.body;
    let  stock_status = ''  // Using let, as stock_status will change depending on current stock level


    // Confirm data
    if (!user) {
        return res.status(400).json({ message: 'User field are required' });
    } else if (!name ) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!categories) {
        return res.status(400).json({ message: 'Category field are required' });
    } else if (!cost) {
        return res.status(400).json({ message: 'Cost field are required' });
    } else if (!current_stock ) {
        return res.status(400).json({ message: 'current stock field are required' });
    } else if (!min_stock ) {
        return res.status(400).json({ message: 'Min stock field are required' });
    } else if (!max_stock ) {
        return res.status(400).json({ message: 'Max stock field are required' }); 
    } else if (!unit) {
        return res.status(400).json({ message: 'Unit field are required' }); 
    } else if (!currency) {
        return res.status(400).json({ message: 'Currency field are required' });
    } else if (!per_unit) {
        return res.status(400).json({ message: 'Per Unit field are required' });
    } else if (!per_stock) {
        return res.status(400).json({ message: 'Per Stock field are required' });
    } else if (!per_cost) {
        return res.status(400).json({ message: 'Per Stock Cost field are required' });
    } 



    // Check stock status level base on current stock and min stock
    stock_status = stockLevelChecker(min_stock, max_stock, current_stock);


    try {
        // Create and store the new user 
        const newStock = new Stock({ user, name, categories, cost, unit, current_stock, min_stock, max_stock, currency, stock_status, per_stock, per_unit, per_cost });
        const savedStock = await newStock.save();
        res.status(201).json({ message: 'New stock created' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ message: 'Duplicate stock name detected' });
        } else {
            res.status(400).json({ message: 'Invalid stock data received' });
        }
    }
});

// @desc Update a stock
// @route PATCH /stocks
// @access Private
const updateStock = asyncHandler(async (req, res) => {
    const { id, user, name, categories, cost, currency, current_stock, unit, min_stock, max_stock, per_stock, per_unit, per_cost } = req.body;
    let { stock_status } = req.body;

    
    // Confirm data
    // if (!id || !user || !name || !Array.isArray(categories) || !cost || !current_stock || !min_stock || !max_stock  ||typeof completed !== 'boolean') {
    //     return res.status(400).json({ message: 'All fields are required' });
    // }

    if (!user) {
        return res.status(400).json({ message: 'User field are required' });
    } else if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!categories) {
        return res.status(400).json({ message: 'Category field are required' });
    } else if (!cost) {
        return res.status(400).json({ message: 'Cost field are required' });
    } else if (!current_stock) {
        return res.status(400).json({ message: 'current stock field are required' });
    } else if (!min_stock) {
        return res.status(400).json({ message: 'Min stock field are required' });
    } else if (!max_stock) {
        return res.status(400).json({ message: 'Max stock field are required' });
    } else if (!unit) {
        return res.status(400).json({ message: 'Unit field are required' });
    } else if (!currency[0]) {
        return res.status(400).json({ message: 'Currency field are required' });
    } else if (!per_unit) {
        return res.status(400).json({ message: 'Per Unit field are required' });
    } else if (!per_stock) {
        return res.status(400).json({ message: 'Per Stock field are required' });
    } else if (!per_cost) {
        return res.status(400).json({ message: 'Per Stock Cost field are required' });
    } 



    // Confirm stock exists to update
    const stock = await Stock.findById(id).exec();

    if (!stock) {
        return res.status(400).json({ message: 'Stock not found' });
    }

    // Check for duplicate name
    const duplicate = await Stock.findOne({ name }).lean().exec();

    // Allow renaming of the original stock 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate stock title' });
    }

    // Check stock status level base on current stock and min stock
    stock_status = stockLevelChecker(min_stock, max_stock, current_stock);

    // Set new stock data to the old stock data
    stock.user = user;
    stock.name = name;
    stock.categories = categories;
    stock.cost = cost;
    stock.unit = unit;
    stock.currency = currency;
    stock.current_stock = current_stock;
    stock.per_stock = per_stock;
    stock.per_unit = per_unit;
    stock.per_cost = per_cost
    stock.min_stock = min_stock;
    stock.max_stock = max_stock;
    stock.stock_status = stock_status;

    const updatedStock = await stock.save();

    res.json(`'${updatedStock.name}' updated`);
});



// // @desc Update a stock
// // @route PATCH /stocks
// // @access Private
// const updateStock = asyncHandler(async (req, res) => {
//     const stocksToUpdate = req.body;
//     console.log(req.body)
//     let updatedStocks; // declare variable here
  
//     try {
//       updatedStocks = await Promise.all(
//         stocksToUpdate.map(async (stock) => {
//           const {
//             id,
//             user,
//             name,
//             categories,
//             cost,
//             currency,
//             current_stock,
//             unit,
//             min_stock,
//             max_stock,
//             per_stock,
//             per_unit,
//             per_cost,
//           } = stock;
//           let { stock_status } = stock;
  
//           // Confirm stock exists to update
//           const existingStock = await Stock.findById(id);
  
//           if (!existingStock) {
//             return res.status(400).json({ message: "Stock not found" });
//           }
  
//           // Check for duplicate name
//           const duplicate = await Stock.findOne({ name }).lean().exec();
  
//           // Allow renaming of the original stock
//           if (duplicate && duplicate?._id.toString() !== id) {
//             return res.status(409).json({ message: "Duplicate stock title" });
//           }
  
//           // Check stock status level base on current stock and min stock
//           stock_status = stockLevelChecker(min_stock, max_stock, current_stock);
  
//           // Update stock data
//           existingStock.user = user;
//           existingStock.name = name;
//           existingStock.categories = categories;
//           existingStock.cost = cost;
//           existingStock.unit = unit;
//           existingStock.currency = currency;
//           existingStock.current_stock = current_stock;
//           existingStock.per_stock = per_stock;
//           existingStock.per_unit = per_unit;
//           existingStock.per_cost = per_cost;
//           existingStock.min_stock = min_stock;
//           existingStock.max_stock = max_stock;
//           existingStock.stock_status = stock_status;
  
//           const updatedStock = await existingStock.save();
  
//           return updatedStock;
//         })
//       );
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
  
//     res.json(updatedStocks);
//   });

// @desc Delete a stock
// @route DELETE /stocks
// @access Private
const deleteStock = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Stock ID required' });
    }
    
    // Does the user still have assigned stocks?
    const recipe = await Recipe.findOne({ 'ingredients.stock': { $in: [id] } }).lean().exec();
    if (recipe) {
        return res.status(400).json({ message: 'Stock has assigned recipe, please delete the recipe first' });
    }

    // Confirm stock exists to delete 
    const stock = await Stock.findById(id).exec();

    if (!stock) {
        return res.status(400).json({ message: 'Stock not found' });
    }

    const result = await stock.deleteOne();

    const reply = `Stock '${result.name}' with ID ${result._id} deleted`;

    res.json(reply);
});

module.exports = {
    getAllStocks,
    createNewStock,
    updateStock,
    deleteStock
}