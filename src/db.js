const mongoose = require('mongoose');
const createLogger = require('./logger');

const logger = createLogger('database');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_mern_items';
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  logger.info('Connected to MongoDB');
}

module.exports = connectDB;
