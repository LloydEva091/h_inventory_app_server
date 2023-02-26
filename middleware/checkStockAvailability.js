// In this example implementation, the checkStockAvailability function takes a weeklyMenuId as an argument, which is the ID of the WeeklyMenu document that you want to check. It then uses Mongoose's findById method to retrieve the document and populate the menu field of each day with the corresponding Menu documents.

// It calculates the total stock required for the week by iterating over each day's menus and adding up the stock field. It then checks if there is enough stock available by comparing the total stock required with the available stock (in this example implementation,

const WeeklyMenu = require('./weeklyMenu.model');
// const moment = require('moment');

// Find way to calculate all stock require during the week and see if there is enough stock to go around
async function checkStockAvailability(weeklyMenuId) {
  const weeklyMenu = await WeeklyMenu.findById(weeklyMenuId)
    .populate('monday.menu tuesday.menu wednesday.menu thursday.menu friday.menu saturday.menu sunday.menu')
    .exec();

  // calculate total stock required for the week
  const totalStockRequired = weeklyMenu.monday.reduce((total, day) => total + day.menu.stock, 0)
    + weeklyMenu.tuesday.reduce((total, day) => total + day.menu.stock, 0)
    + weeklyMenu.wednesday.reduce((total, day) => total + day.menu.stock, 0)
    + weeklyMenu.thursday.reduce((total, day) => total + day.menu.stock, 0)
    + weeklyMenu.friday.reduce((total, day) => total + day.menu.stock, 0)
    + weeklyMenu.saturday.reduce((total, day) => total + day.menu.stock, 0)
    + weeklyMenu.sunday.reduce((total, day) => total + day.menu.stock, 0);

  // check if there is enough stock available
  const stockAvailable = 100; // example stock available
  if (totalStockRequired <= stockAvailable) {
    // there is enough stock available, no action needed
    return;
  }

  // find the last day with sufficient stock
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let lastDayWithSufficientStock = days[0];
  let stockLeft = stockAvailable;
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const stockRequired = weeklyMenu[day].reduce((total, menu) => total + menu.stock, 0);
    if (stockRequired <= stockLeft) {
      stockLeft -= stockRequired;
    } else {
      lastDayWithSufficientStock = days[i - 1];
      break;
    }
  }

  // set stockWkStatus for the following day
  const followingDay = days[days.indexOf(lastDayWithSufficientStock) + 1];
  weeklyMenu[followingDay][0].stockWkStatus = 'will be short stock';
  await weeklyMenu.save();
}
