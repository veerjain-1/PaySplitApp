const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('User Model', () => {
  it('hashes password on save and matches correctly', async () => {
    const user = new User({
      email: 'test@example.com',
      displayName: 'Test User',
      password: 'SuperSecretPassword123!',
    });

    await user.save();

    expect(user.password).not.toBe('SuperSecretPassword123!');
    expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format

    const isMatch = await user.matchPassword('SuperSecretPassword123!');
    expect(isMatch).toBe(true);

    const isWrong = await user.matchPassword('WrongPassword');
    expect(isWrong).toBe(false);
  });

  it('returns false when matching password if user has no password', async () => {
    const user = new User({
      email: 'oauth@example.com',
      displayName: 'OAuth User',
      firebaseUid: 'firebase-1234',
    });

    await user.save();
    const isMatch = await user.matchPassword('AnyPassword');
    expect(isMatch).toBe(false);
  });
});
