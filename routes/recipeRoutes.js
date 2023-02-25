const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipesController');
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/')
    .get(recipeController.getAllRecipes)
    .post(recipeController.createNewRecipe)
    .patch(recipeController.updateRecipe)
    .delete(recipeController.deleteRecipe)

module.exports = router;