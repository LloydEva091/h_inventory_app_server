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
    const { user, name, categories, cost, current_stock, min_stock, max_stock, unit, currency } = req.body;
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
    } 


    // Check stock status level base on current stock and min stock
    stock_status = stockLevelChecker(min_stock, max_stock, current_stock);


    try {
        // Create and store the new user 
        const newStock = new Stock({ user, name, categories, cost, unit, current_stock, min_stock, max_stock, currency, stock_status });
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
    const { id, user, name, categories, cost, currency, current_stock, unit, min_stock, max_stock } = req.body;
    let { stock_status } = req.body;

    // Confirm data
    // if (!id || !user || !name || !Array.isArray(categories) || !cost || !current_stock || !min_stock || !max_stock  ||typeof completed !== 'boolean') {
    //     return res.status(400).json({ message: 'All fields are required' });
    // }
    // console.log(req.body)

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
    } else if (!currency) {
        return res.status(400).json({ message: 'Currency field are required' });
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
    stock.min_stock = min_stock;
    stock.max_stock = max_stock;
    stock.stock_status = stock_status;

    const updatedStock = await stock.save();

    res.json(`'${updatedStock.name}' updated`);
});

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