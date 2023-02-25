const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/')
    .get(stocksController.getAllStocks)
    .post(stocksController.createNewStock)
    .patch(stocksController.updateStock)
    .delete(stocksController.deleteStock)

module.exports = router;