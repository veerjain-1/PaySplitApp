const admin = require('firebase-admin');

// In a real production environment, you would load a service account key
// const serviceAccount = require('./serviceAccountKey.json');

/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
*/

// Mock middleware for authentication
const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        // For development/demo purposes, bypass auth if no token is provided
        console.warn('⚠️ No auth token provided, bypassing authentication for development.');
        req.user = { uid: 'demo-user-123', email: 'demo@paysplit.app' };
        return next();
        // return res.status(401).send('Unauthorized');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying auth token', error);
        res.status(403).send('Unauthorized');
    }
};

module.exports = { verifyToken };
