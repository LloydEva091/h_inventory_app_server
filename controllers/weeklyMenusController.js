const WeeklyMenu = require("../models/WeeklyMenu");
const User = require("../models/User");
const Menu = require("../models/Menu");
const asyncHandler = require("express-async-handler");

// This function takes in an array of weekly menus, and calculates the total cost of all the menus combined
const calculateWeeklyMenuCost = async (weeklyMenu) => {
  let totalCost = 0;
  // For each day of the week, get the menu ID and look up the corresponding menu object in the database
  for (const dayMenu of weeklyMenu) {
    const menuId = dayMenu[0].menu;
    const menu = await Menu.findById(menuId).lean().exec();
    // If the menu exists in the database, add its cost to the total cost
    if (menu) {
      totalCost += menu.menuCost;
    }
  }
  // Return the total cost of all the menus
  return totalCost.toFixed(2);
};

// Check the currency field of the given recipe and return it back
const getCurrency = async (menuId) => {
  const menu = await Menu.findById(menuId).exec();
  if (!menu) {
    throw new Error(`Menu with id ${menuId} not found`);
  }
  return menu.currency;
};

// @desc Get all weekly menus
// @route GET /weeklyMenus
// @access Private
const getAllWeeklyMenus = asyncHandler(async (req, res) => {
  // Get all weekly menus from MongoDB
  const weeklyMenus = await WeeklyMenu.find().lean();

  // If no weekly menus
  if (!weeklyMenus?.length) {
    return res.status(400).json({ message: "No weekly menus found" });
  }

  // Add username to each weekly menu before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  const weeklyMenusWithUser = await Promise.all(
    weeklyMenus.map(async (weeklyMenu) => {
      const user = await User.findById(weeklyMenu.user).lean().exec();
      return { ...weeklyMenu, username: user.username };
    })
  );

  res.json(weeklyMenusWithUser);
});

// @desc Create a new weekly menu
// @route POST /weeklyMenus
// @access Private
const createWeeklyMenu = asyncHandler(async (req, res) => {
  const {
    weekNumber,
    year,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    user,
  } = req.body;

  // Confirm data
  if (!user) {
    return res.status(400).json({ message: "User field are required" });
  } else if (!year) {
    return res.status(400).json({ message: "Year field are required" });
  } else if (!monday) {
    return res.status(400).json({ message: "Monday field are required" });
  } else if (!tuesday) {
    return res.status(400).json({ message: "Tuesday field are required" });
  } else if (!wednesday) {
    return res
      .status(400)
      .json({ message: "Wednesday Cost field are required" });
  } else if (!thursday) {
    return res.status(400).json({ message: "Thursday field are required" });
  } else if (!friday) {
    return res.status(400).json({ message: "Friday field are required" });
  } else if (!saturday) {
    return res.status(400).json({ message: "Saturday field are required" });
  } else if (!sunday) {
    return res.status(400).json({ message: "Sunday field are required" });
  }

  // Calculate the weekly menu cost
  const menuIds = [
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
  ];
  const weeklyMenuCost = await calculateWeeklyMenuCost(menuIds);

  // Check for currency and set it | This assumes that all recipe currency is the same as initial recipe in breakfast
  const currency = await getCurrency(monday[0].menu); // Assuming at least one recipe is included in breakfasts

  // Check if the user has already created a weekly menu for the given week number and year
  const existingWeeklyMenu = await WeeklyMenu.findOne({
    user,
    weekNumber,
    year,
  });
  if (existingWeeklyMenu) {
    return res.status(400).json({
      message: "You have already created a weekly menu for this week",
    });
  }

  //   console.log(existingWeeklyMenu)

  try {
    // Create a new weekly menu
    const weeklyMenu = new WeeklyMenu({
      user,
      weekNumber,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      year,
      weeklyMenuCost,
      currency,
    });
    // Save the weekly menu
    const savedWeeklyMenu = await weeklyMenu.save();

    res.status(201).json(savedWeeklyMenu);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// @desc Update a weekly menu
// @route PUT /weeklyMenus/:id
// @access Private
const updateWeeklyMenu = asyncHandler(async (req, res) => {
  const weeklyMenu = await WeeklyMenu.findById(req.body.id);

  // Confirm Weekly Menu Exist
  if (!weeklyMenu) {
    return res.status(404).json({ message: "Weekly menu not found" });
  }

  if (weeklyMenu.user.toString() !== req.body.user.toString()) {
    return res
      .status(401)
      .json({ message: "You are not authorized to update this weekly menu" });
  }

  // Update each day of the week with the new menu ID
  weeklyMenu.monday = req.body.monday || weeklyMenu.monday;
  weeklyMenu.tuesday = req.body.tuesday || weeklyMenu.tuesday;
  weeklyMenu.wednesday = req.body.wednesday || weeklyMenu.wednesday;
  weeklyMenu.thursday = req.body.thursday || weeklyMenu.thursday;
  weeklyMenu.friday = req.body.friday || weeklyMenu.friday;
  weeklyMenu.saturday = req.body.saturday || weeklyMenu.saturday;
  weeklyMenu.sunday = req.body.sunday || weeklyMenu.sunday;

  // Update other fields if provided
  weeklyMenu.weekNumber = req.body.weekNumber || weeklyMenu.weekNumber;
  weeklyMenu.year = req.body.year || weeklyMenu.year;
  weeklyMenu.weeklyMenuCost = req.body.weeklyMenuCost || weeklyMenu.weeklyMenuCost;
  weeklyMenu.currency = req.body.currency || weeklyMenu.currency;
  weeklyMenu.startDate = req.body.startDate || weeklyMenu.startDate;
  weeklyMenu.endDate = req.body.endDate || weeklyMenu.endDate;

  const updatedWeeklyMenu = await weeklyMenu.save();

  res.json(updatedWeeklyMenu);
});

// @desc Delete a weekly menu
// @route DELETE /weeklyMenus/:id
// @access Private
const deleteWeeklyMenu = asyncHandler(async (req, res) => {
  const weeklyMenu = await WeeklyMenu.findById(req.params.id);

  if (!weeklyMenu) {
    return res.status(404).json({ message: "Weekly menu not found" });
  }

  if (weeklyMenu.user.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ message: "You are not authorized to delete this weekly menu" });
  }

  await weeklyMenu.remove();

  res.json({ message: "Weekly menu removed" });
});

module.exports = {
  getAllWeeklyMenus,
  createWeeklyMenu,
  updateWeeklyMenu,
  deleteWeeklyMenu,
};
