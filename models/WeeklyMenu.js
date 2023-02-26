// Find way to calculate all stock require during the week and see if there is enough stock to go around
// if not highlight the last day that there will be sufficient stock to go round
// Then the following day should be given a new stockWkStatus { 'will be short stock' }

const moment = require("moment")
const mongoose = require("mongoose");

// Define a new schema for weeklyMenu
const weeklyMenuSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    weeklyMenuCost:{
        type:Number,
        required: true
    },
    currency: [{
        type: String,
        default: 'GBP',
        required: true
    }],
    year: {
      type: Number,
      required: true,
    },
    monday: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Menu",
        },
      },
    ],
    tuesday: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Menu",
        },
      },
    ],
    wednesday: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Menu",
        },
      },
    ],
    thursday: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Menu",
        },
      },
    ],
    friday: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Menu",
        },
      },
    ],
    saturday: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Menu",
        },
      },
    ],
    sunday: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Menu",
        },
      },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

weeklyMenuSchema.index({ user: 1, weekNumber: 1, year: 1 }, { unique: true });

// Virtual for week start and end date based on week number and year
weeklyMenuSchema.virtual("week").get(function () {
  const startDate = moment()
    .year(this.year)
    .week(this.weekNumber)
    .startOf("week");
  const endDate = moment().year(this.year).week(this.weekNumber).endOf("week");
  return {
    startDate,
    endDate,
  };
});

// Pre-save hook to set start and end date based on week number and year
weeklyMenuSchema.pre("save", function (next) {
  const { startDate, endDate } = this.week;
  this.startDate = startDate.toDate();
  this.endDate = endDate.toDate();
  next();
});

module.exports = mongoose.model("WeeklyMenu", weeklyMenuSchema);
