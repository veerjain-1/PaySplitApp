const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const expenseRoutes = require('./routes/expenses');
app.use('/api/expenses', expenseRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'paysplit-backend' });
});

// Mock MongoDB Connection for simplicity
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/paysplit';
mongoose.connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.warn('MongoDB connection error (ignoring for dev):', err.message));

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
}

module.exports = app;
