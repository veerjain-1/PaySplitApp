const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Create an expense
router.post('/', async (req, res) => {
    try {
        const { title, amount, payerId, groupId, splitType, splits } = req.body;
        
        const expense = new Expense({
            title,
            amount,
            payerId,
            groupId,
            splitType: splitType || 'EQUAL',
            splits: splits || []
        });
        
        const savedExpense = await expense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error creating expense' });
    }
});

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching expenses' });
    }
});

// Process receipt via AI pipeline (Mocking the connection to Python microservice)
router.post('/parse-receipt', async (req, res) => {
    const { receiptText } = req.body;
    
    if (!receiptText) {
        return res.status(400).json({ error: 'No receipt text provided' });
    }

    try {
        // Forward to python microservice
        const aiResponse = await fetch('http://localhost:8000/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: receiptText })
        });
        
        const data = await aiResponse.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('AI Pipeline error:', err);
        // Fallback for demo
        res.status(200).json({
            items: [
                { name: 'Dinner', cost: 45.00 },
                { name: 'Tax', cost: 3.50 }
            ],
            total: 48.50,
            note: 'Fallback AI response - Python service unreachable'
        });
    }
});

module.exports = router;
