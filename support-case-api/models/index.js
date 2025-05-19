const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const Case = sequelize.define('Case', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

User.hasMany(Case);
Case.belongsTo(User);

// JWT Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    if (!req.user) return res.status(401).json({ error: 'Invalid token' });
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/cases', authMiddleware, async (req, res) => {
  try {
    const cases = await Case.findAll({ where: { userId: req.user.id } });
    res.json(cases);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/cases', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const newCase = await Case.create({ title, description, userId: req.user.id });
    res.status(201).json(newCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/cases/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const caseItem = await Case.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!caseItem) return res.status(404).json({ error: 'Case not found' });

    await caseItem.update({ title, description });
    res.json(caseItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/cases/:id', authMiddleware, async (req, res) => {
  try {
    const caseItem = await Case.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!caseItem) return res.status(404).json({ error: 'Case not found' });

    await caseItem.destroy();
    res.json({ message: 'Case deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

sequelize.sync().then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});