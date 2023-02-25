const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
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
        categories: [{
            type: String,
            default: "Lunch",
            required: true
        }],
        totalCost: {
            type:Number,
            default:0,
            require:true
        },
        currency: [{
            type: String,
            default: 'GBP',
            required: true
        }],
        servings: {
            type: Number,
            default: 75
        },
        ingredients: [{
            stock: {
                type: mongoose.Schema.Types.ObjectId,
                required:true,
                ref:'Stock'
            },
            iamount: Number,
            iunit: [{
                type: String,
                required: true
            }],
            icost: Number,
            icurrency:  [{
                type: String,
                required: true
            }],
        }]
    },
    {
        timestamps: true
    }

);


recipeSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Recipe', recipeSchema);