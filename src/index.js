const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const bcrypt = require('bcrypt');
const createLogger = require('./logger');
const connectDB = require('./db');
const User = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;
const logger = createLogger('server');

app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MERN Backend API',
      version: '1.0.0',
    },
  },
  apis: [__filename],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - mobile
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 example: password123
 *               mobile:
 *                 type: string
 *                 example: 1234567890
 *     responses:
 *       200:
 *         description: Success
 * /login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Success
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 * /users/{id}:
 *   get:
 *     summary: Get single user by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     summary: Update user details
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *   delete:
 *     summary: Delete user
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 */

// User Authentication Routes
app.post('/register', async (req, res) => {
  try {
    const { username, password, mobile } = req.body;
    if (!username || !password || !mobile) {
      logger.warn('Register failed: Missing required fields');
      return res.json({ success: true, data: null, error: 'Username, password, and mobile are required' });
    }
    const user = await User.create({ username, password, mobile });
    logger.info(`User registered: ${user._id}`);
    res.json({ success: true, data: { id: user._id, username: user.username, mobile: user.mobile } });
  } catch (error) {
    logger.error(`Register failed: ${error.message}`);
    res.json({ success: true, data: null, error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      logger.warn('Login failed: Missing username or password');
      return res.json({ success: true, data: null, error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Login failed: User not found - ${username}`);
      return res.json({ success: true, data: null, error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for ${username}`);
      return res.json({ success: true, data: null, error: 'Invalid credentials' });
    }
    logger.info(`User logged in: ${user._id}`);
    res.json({ success: true, data: { id: user._id, username: user.username, mobile: user.mobile } });
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    res.json({ success: true, data: null, error: error.message });
  }
});

// User Management Routes
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    logger.info('Fetch all users');
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error(`Fetch all users failed: ${error.message}`);
    res.json({ success: true, data: [], error: error.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    logger.info(`Get user ${req.params.id}`);
    res.json({ success: true, data: user || null });
  } catch (error) {
    logger.error(`Get user failed: ${error.message}`);
    res.json({ success: true, data: null, error: error.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password').lean();
    logger.info(`Update user ${req.params.id}`);
    res.json({ success: true, data: user || null });
  } catch (error) {
    logger.error(`Update user failed: ${error.message}`);
    res.json({ success: true, data: null, error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select('-password').lean();
    logger.info(`Delete user ${req.params.id}`);
    res.json({ success: true, data: user || null });
  } catch (error) {
    logger.error(`Delete user failed: ${error.message}`);
    res.json({ success: true, data: null, error: error.message });
  }
});

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
}

startServer();
