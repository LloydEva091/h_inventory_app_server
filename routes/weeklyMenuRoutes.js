const express = require('express');
const router = express.Router();
const weeklyMenusController = require('../controllers/weeklyMenusController');
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/')
    .get(weeklyMenusController.getAllWeeklyMenus)
    .post(weeklyMenusController.createWeeklyMenu)
    .patch(weeklyMenusController.updateWeeklyMenu)
    .delete(weeklyMenusController.deleteWeeklyMenu)

module.exports = router;