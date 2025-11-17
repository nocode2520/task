Task

MERN Backend (API Only)

This project is a simple Node.js + Express backend that exposes user authentication and management APIs with MongoDB storage, Swagger docs, and basic file logging. There is no frontend.

Prerequisites
 Node.js 18+
 npm
 MongoDB (local instance or Atlas connection string)

Project Structure

src/
  index.js        # Express app and routes
  db.js           # MongoDB connection helper
  logger.js       # Basic logger
  models/
    user.js       # User mongoose model

To run this project, use the following commands:

1. Install dependencies:


npm install


2. Start the server:


npm start


3. View and test the APIs:
Open your browser and navigate to:
 http://localhost:3000/api-docs

This will display the API documentation and allow you to test the endpoints.


The following are the Endpoints:

Authentication:
  POST /register – Register new user (username, password, mobile)
  POST /login – Login user (username, password)

User Management:
  GET /users – Get all users
  GET /users/:id – Get single user by id
  PUT /users/:id – Update user details (one or more fields)
  DELETE /users/:id – Delete user

All responses follow:
json structure
{
  "success": true,
  "data": {},
  "error": "optional error message"
}

Logging
- Logs written to `logs/application.log`
- Format: `datetime|logLevel|module|file|function|line|logMsg`
