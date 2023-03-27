// Importing the required modules
const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const verifyJWT = require('../middleware/verifyJWT')

// Middleware to verify JWT token
router.use(verifyJWT)

// Define routes for stocks
router.route('/')
.get(stocksController.getAllStocks) // GET request to get all stocks
.post(stocksController.createNewStock) // POST request to create new stock
.delete(stocksController.deleteStock) // DELETE request to delete a stock

// PATCH request to update a stock
router.route('/:id').patch(stocksController.updateStock) 

// PATCH request to update the isChecked property
router.route('/check/:id').patch(stocksController.checkStock) 

// Exporting the router for use in other files
module.exports = router; 
