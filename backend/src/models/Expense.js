const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive']
    },
    payerId: {
        type: String,
        required: [true, 'Payer ID is required']
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    splitType: {
        type: String,
        enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
        default: 'EQUAL'
    },
    splits: [{
        userId: {
            type: String,
            required: true
        },
        amount: {
            type: Number
        },
        percentage: {
            type: Number
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
