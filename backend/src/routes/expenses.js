const express = require('express');
const router = express.Router();

// Mock in-memory store since MongoDB might not be running locally
const expenses = [];

// Create an expense
router.post('/', (req, res) => {
    const { title, amount, payerId, splitAmong } = req.body;
    
    if (!title || !amount || !payerId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = {
        id: Date.now().toString(),
        title,
        amount,
        payerId,
        splitAmong: splitAmong || [],
        createdAt: new Date().toISOString()
    };
    
    expenses.push(expense);
    res.status(201).json(expense);
});

// Get all expenses
router.get('/', (req, res) => {
    res.status(200).json(expenses);
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
