const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
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
            default: "Others",
            required: true
        }],
        cost: {
            type: Number,
            required: true,
            default:0,
        },
        per_cost: {
            type: Number,
            required: true,
            default:0,
        },
        currency: [{
            type: String,
            default: 'GBP',
            required: true
        }],
        current_stock: {
            type: Number,
            required: true,
            default: 0,
        },
        unit: [{
            type: String,
            required: true
        }],
        per_stock: {
            type: Number,
            required: true,
            default: 0
        },
        per_unit: [{
            type: String,
            required: true
        }],
        min_stock: {
            type: Number,
            required: true
        },
        max_stock: {
            type: Number,
            required: true
        },
        stock_status: [{
            type: String,
            default: "Good"
        }]
    },
    {
        timestamps: true
    }

);

stockSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);