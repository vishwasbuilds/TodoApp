// Starts the To-Do API, connects to MongoDB, and registers its HTTP routes.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json({limit: '1mb'}));
app.get('/api/health', (_req, res) => res.json({status: 'ok', message: 'To-Do API is running'}));
// Keep authentication and task endpoints grouped under their API prefixes.
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const port = process.env.PORT || 5000;
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Set MONGODB_URI and JWT_SECRET in backend/.env first.');
  process.exit(1);
}
// Accept requests only after the database is ready.
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(port, '0.0.0.0', () => console.log(`To-Do API listening on port ${port}`));
  })
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
