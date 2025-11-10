const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const createLogger = require('./logger');
const connectDB = require('./db');
const Item = require('./models/item');

const app = express();
const port = process.env.PORT || 3000;
const logger = createLogger('server');

app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Items API',
      version: '1.0.0',
    },
  },
  apis: [__filename],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: Get all items
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create an item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sample item
 *     responses:
 *       200:
 *         description: Success
 * /api/items/{id}:
 *   get:
 *     summary: Get a single item by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     summary: Update an item
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated item
 *     responses:
 *       200:
 *         description: Success
 *   delete:
 *     summary: Delete an item
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 */

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().lean();
    logger.info('Fetch all items');
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error(`Fetch all items failed: ${error.message}`);
    res.json({ success: true, data: [], error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const item = await Item.create(req.body);
    logger.info(`Create item ${item._id}`);
    res.json({ success: true, data: item });
  } catch (error) {
    logger.error(`Create item failed: ${error.message}`);
    res.json({ success: true, data: null, error: error.message });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).lean();
    logger.info(`Get item ${req.params.id}`);
    res.json({ success: true, data: item || null });
  } catch (error) {
    logger.error(`Get item failed: ${error.message}`);
    res.json({ success: true, data: null, error: error.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    logger.info(`Update item ${req.params.id}`);
    res.json({ success: true, data: item || null });
  } catch (error) {
    logger.error(`Update item failed: ${error.message}`);
    res.json({ success: true, data: null, error: error.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id).lean();
    logger.info(`Delete item ${req.params.id}`);
    res.json({ success: true, data: item || null });
  } catch (error) {
    logger.error(`Delete item failed: ${error.message}`);
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

