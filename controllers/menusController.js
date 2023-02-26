const Menu = require("../models/Menu");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const WeeklyMenu = require("../models/WeeklyMenu");
const asyncHandler = require("express-async-handler");

// Calculate the Totalcost of a given object array of recipe ids
// By fetching the recipe information and totalling the recipe cost
const calculateTotalCost = async (recipes) => {
  let totalMenuCost = 0;
  for (const recipe of recipes) {
    const recipeId = recipe.recipe;
    const recipeDoc = await Recipe.findById(recipeId).exec();
    if (!recipeDoc) {
      throw new Error(`Recipe with id ${recipeId} not found`);
    }
    totalMenuCost += recipeDoc.totalCost;
  }
  return totalMenuCost;
};

// Check the currency field of the given recipe and return it back
const getCurrency = async (recipeId) => {
  const recipe = await Recipe.findById(recipeId).exec();
  if (!recipe) {
    throw new Error(`Recipe with id ${recipeId} not found`);
  }
  return recipe.currency;
};

// @desc Get all menus
// @route GET /menus
// @access Private
const getAllMenus = asyncHandler(async (req, res) => {
  // Get all menus from MongoDB
  const menus = await Menu.find().lean();

  // If no menus
  if (!menus?.length) {
    return res.status(400).json({ message: "No menus found" });
  }

  // Add username to each menu before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  const menusWithUser = await Promise.all(
    menus.map(async (menu) => {
      const user = await User.findById(menu.user).lean().exec();
      return { ...menu, username: user.username };
    })
  );

  res.json(menusWithUser);
});

// @desc Create new menu
// @route POST /menus
// @access Private
const createNewMenu = asyncHandler(async (req, res) => {
  const { user, name, breakfasts, lunches, dinners } = req.body;

  let currency, menuCost;

  // Confirm data
  if (!user) {
    return res.status(400).json({ message: "User field are required" });
  } else if (!name) {
    return res.status(400).json({ message: "Name field are required" });
  } else if (!breakfasts) {
    return res.status(400).json({ message: "Breakfast field are required" });
  } else if (!lunches) {
    return res.status(400).json({ message: "Lunch field are required" });
  } else if (!dinners) {
    return res.status(400).json({ message: "Dinner field are required" });
  }

  // console.log("breakfast ",breakfasts)
  // console.log("lunch ",lunches)
  // console.log("dinner ",dinners)

  // Check for currency and set it | This assumes that all recipe currency is the same as initial recipe in breakfast
  currency = await getCurrency(breakfasts[0].recipe); // Assuming at least one recipe is included in breakfasts

  try {
    // Calculate the totalMenuCost of Recipes
    menuCost = await calculateTotalCost(breakfasts);
    menuCost += await calculateTotalCost(lunches);
    menuCost += await calculateTotalCost(dinners);

    // Create and store the new user
    const newMenu = new Menu({
      user,
      name,
      breakfasts,
      lunches,
      dinners,
      menuCost,
      currency,
    });
    const savedMenu = await newMenu.save();
    res.status(201).json({ message: "New menu created" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: "Duplicate menu name detected" });
    } else {
      res.status(400).json({ message: "Invalid menu data received" });
    }
  }
});

// @desc Update a menu
// @route PATCH /menus
// @access Private
const updateMenu = asyncHandler(async (req, res) => {
  const { id, user, name, menuCost, currency, breakfasts, lunches, dinners } =
    req.body;

  // Confirm data
  if (!user) {
    return res.status(400).json({ message: "User field are required" });
  } else if (!id) {
    return res.status(400).json({ message: "Id field are required" });
  } else if (!name) {
    return res.status(400).json({ message: "Name field are required" });
  } else if (!currency) {
    return res.status(400).json({ message: "Currency field are required" });
  } else if (!menuCost) {
    return res.status(400).json({ message: "Menu Cost field are required" });
  } else if (!breakfasts) {
    return res.status(400).json({ message: "Breakfast field are required" });
  } else if (!lunches) {
    return res.status(400).json({ message: "Lunch field are required" });
  } else if (!dinners) {
    return res.status(400).json({ message: "Dinner field are required" });
  }

  // Confirm menu exists to update
  const menu = await Menu.findById(id).exec();
  if (!menu) {
    return res.status(400).json({ message: "Menu not found" });
  }

  // Check for duplicate name
  const duplicate = await Menu.findOne({ name }).lean().exec();

  // Allow renaming of the original menu
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate menu title" });
  }

  menu.user = user;
  menu.name = name;
  menu.menuCost = menuCost;
  menu.currency = currency;
  menu.breakfasts = breakfasts;
  menu.lunches = lunches;
  menu.dinners = dinners;

  const updatedMenu = await menu.save();

  res.json(`'${updatedMenu.name}' updated`);
});

// @desc Delete a menu
// @route DELETE /menus
// @access Private
const deleteMenu = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Menu ID required" });
  }

  // Check If Menu is assigned to a Weekly Menu
  const wklyMenu = await Menu.findOne({
    $or: [
      { "monday.menu": id },
      { "tuesday.menu": id },
      { "wednesday.menu": id },
      { "thursday.menu": id },
      { "friday.menu": id },
      { "saturday.menu": id },
      { "sunday.menu": id },
    ],
  })
    .lean()
    .exec();

  if (wklyMenu) {
    return res
      .status(400)
      .json({
        message:
          "Menu has assigned weekly menu, please delete the weekly menu first",
      });
  }

  // Confirm menu exists to delete
  const menu = await Menu.findById(id).exec();
  if (!menu) {
    return res.menu_status(400).json({ message: "Menu not found" });
  }

  const result = await menu.deleteOne();
  const reply = `Menu '${result.name}' with ID ${result._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllMenus,
  createNewMenu,
  updateMenu,
  deleteMenu,
};
