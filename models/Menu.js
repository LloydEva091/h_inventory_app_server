const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        menuCost: {
            type: Number,
            required: true,
            default:0,
        },
        currency: [{
            type: String,
            default: 'GBP',
            required: true
        }],
        breakfasts: [{
            recipe: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Recipe'
            }
        }],
        lunches: [{
            recipe: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Recipe'
            }
        }],
        dinners: [{
            recipe: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Recipe'
            }
        }],
    },
    {
        timestamps: true
    }

);

menuSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);