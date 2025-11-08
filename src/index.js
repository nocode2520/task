const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const createLogger = require('./logger');

const app = express();
const port = process.env.PORT || 3000;
const logger = createLogger('server');

app.use(express.json());

const items = [];
let nextId = 1;

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

app.get('/api/items', (req, res) => {
  logger.info('Fetch all items');
  res.json({ success: true, data: items });
});

app.post('/api/items', (req, res) => {
  const item = { id: nextId, ...req.body };
  nextId += 1;
  items.push(item);
  logger.info(`Create item ${item.id}`);
  res.json({ success: true, data: item });
});

app.get('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = items.find((i) => i.id === id);
  logger.info(`Get item ${id}`);
  res.json({ success: true, data: item || null });
});

app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((i) => i.id === id);
  if (index >= 0) {
    items[index] = { ...items[index], ...req.body };
  }
  logger.info(`Update item ${id}`);
  res.json({ success: true, data: items[index] || null });
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((i) => i.id === id);
  let deleted = null;
  if (index >= 0) {
    deleted = items.splice(index, 1)[0];
  }
  logger.info(`Delete item ${id}`);
  res.json({ success: true, data: deleted });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

