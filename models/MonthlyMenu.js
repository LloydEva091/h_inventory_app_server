const mongoose = require('mongoose');

// Define a new schema for monthlyMenu
const monthlyMenuSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        menu: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Menu'
        },
        month: {
            type: Number,
            required: true
        },
        year: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

monthlyMenuSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyMenu', monthlyMenuSchema)