const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(stocksController.getAllStocks)
    .post(stocksController.createNewStock)
    .delete(stocksController.deleteStock)

router.route('/:id')
    .patch(stocksController.updateStock)

router.route('/check/:id').patch(stocksController.checkStock)

module.exports = router;
