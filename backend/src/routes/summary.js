const express = require('express');
const router = express.Router();

// Placeholder summary endpoint returning basic analytics
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PaySplitApp summary endpoint',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
