const Recipe = require("../models/Recipe");
const User = require("../models/User");
const Menu = require("../models/Menu");
const asyncHandler = require("express-async-handler");

// @desc Get all recipes
// @route GET /recipes
// @access Private
const getAllRecipes = asyncHandler(async (req, res) => {
  // Get all recipes from MongoDB
  const recipes = await Recipe.find().lean();

  // If no recipes
  if (!recipes?.length) {
    return res.status(400).json({ message: "No recipes found" });
  }

  // Add username to each recipe before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  const recipesWithUser = await Promise.all(
    recipes.map(async (recipe) => {
      const user = await User.findById(recipe.user).lean().exec();
      return { ...recipe, username: user.username };
    })
  );

  res.json(recipesWithUser);
});

// @desc Create new recipe
// @route POST /recipes
// @access Private
const createNewRecipe = asyncHandler(async (req, res) => {
  const { user, name, categories, ingredients, currency, totalCost, servings } =
    req.body;
  // ,iamount,iunit

  // Confirm data
  if (!user) {
    return res.status(400).json({ message: "User field are required" });
  } else if (!name) {
    return res.status(400).json({ message: "Name field are required" });
  } else if (!categories) {
    return res.status(400).json({ message: "Category field are required" });
  } else if (!ingredients) {
    return res.status(400).json({ message: "Ingredients field are required" });
  } else if (!totalCost) {
    return res.status(400).json({ message: "Total Cost field are required" });
  } else if (!currency) {
    return res.status(400).json({ message: "Currency field are required" });
  } else if (!servings) {
    return res.status(400).json({ message: "Servings field are required" });
  }

  //  console.log(ingredients)

  // // Check for duplicate name
  // const duplicate = await Recipe.findOne({ name }).lean().exec();

  // if (duplicate) {
  //     return res.status(409).json({ message: 'Duplicate recipe' });
  // }

  // // Create and store the new user
  // const recipe = await Recipe.create({ user, name, categories,  ingredients, totalCost });

  // if (recipe) { // Created
  //     return res.status(201).json({ message: 'New recipe created' });
  // } else {
  //     return res.status(400).json({ message: 'Invalid recipe data received' });
  // }

  try {
    // Create and store the new user
    const newRecipe = new Recipe({
      user,
      name,
      categories,
      currency,
      ingredients,
      totalCost,
      servings,
    });
    const savedRecipe = await newRecipe.save();
    res.status(201).json({ message: "New recipe created" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: "Duplicate recipe name detected" });
    } else {
      res.status(400).json({ message: "Invalid recipe data received" });
    }
  }
});

// @desc Update a recipe
// @route PATCH /recipes
// @access Private
const updateRecipe = asyncHandler(async (req, res) => {
  const {
    id,
    user,
    name,
    categories,
    ingredients,
    currency,
    servings,
    totalCost,
  } = req.body;

  // Confirm data
  if (!user) {
    return res.status(400).json({ message: "User field are required" });
  } else if (!name) {
    return res.status(400).json({ message: "Name field are required" });
  } else if (!categories) {
    return res.status(400).json({ message: "Category field are required" });
  } else if (!ingredients) {
    return res.status(400).json({ message: "Ingredients field are required" });
  } else if (!currency) {
    return res.status(400).json({ message: "Currency field are required" });
  } else if (!servings) {
    return res.status(400).json({ message: "Servings field are required" });
  } else if (!totalCost) {
    return res.status(400).json({ message: "Total Cost field are required" });
  }

  // Confirm recipe exists to update
  const recipe = await Recipe.findById(id).exec();
  if (!recipe) {
    return res.status(400).json({ message: "Recipe not found" });
  }

  // Check for duplicate name
  const duplicate = await Recipe.findOne({ name }).lean().exec();

  // Allow renaming of the original recipe
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate recipe title" });
  }

  recipe.user = user;
  recipe.name = name;
  recipe.categories = categories;
  recipe.ingredients = ingredients;
  recipe.servings = servings;
  recipe.currency = currency;
  recipe.totalCost = totalCost;

  const updatedRecipe = await recipe.save();

  res.json(`'${updatedRecipe.name}' updated`);
});

// @desc Delete a recipe
// @route DELETE /recipes
// @access Private
const deleteRecipe = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Recipe ID required" });
  }

  // Check If Recipe is assigned to a Menu
  const menu = await Menu.findOne({
    $or: [
      { "breakfast.recipe": id },
      { "lunch.recipe": id },
      { "dinner.recipe": id },
    ],
  })
    .lean()
    .exec();
  if (menu) {
    return res
      .status(400)
      .json({
        message: "Recipe has assigned menu, please delete the menu first",
      });
  }

  // Confirm recipe exists to delete
  const recipe = await Recipe.findById(id).exec();

  if (!recipe) {
    return res.recipe_status(400).json({ message: "Recipe not found" });
  }

  const result = await recipe.deleteOne();

  const reply = `Recipe '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllRecipes,
  createNewRecipe,
  updateRecipe,
  deleteRecipe,
};
