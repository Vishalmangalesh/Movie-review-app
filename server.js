const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Mongoose Schema for ratings
const ratingSchema = new mongoose.Schema({
  movieTitle: String,
  rating: Number,
});

const Rating = mongoose.model('Rating', ratingSchema);

// Define Mongoose Schema for reviews
const reviewSchema = new mongoose.Schema({
  movieTitle: String,
  userReview: String,
});

const Review = mongoose.model('Review', reviewSchema);

app.use(bodyParser.json());

app.use(cors());

// API to store ratings
app.post('/storeRating', async (req, res) => {
  const { movieTitle, rating } = req.body;
  try {
    const newRating = new Rating({ movieTitle, rating });
    await newRating.save();
    res.json({ success: true, message: 'Rating stored successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error storing rating' });
  }
});

// API to store reviews
app.post('/storeReview', async (req, res) => {
  const { movieTitle, userReview } = req.body;
  try {
    const newReview = new Review({ movieTitle, userReview });
    await newReview.save();
    res.json({ success: true, message: 'Review stored successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error storing review' });
  }
});

// Define Mongoose Schema for user (you can do the same for user database)
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username, password: hashedPassword });

  try {
    await user.save();
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
  // ... (your signup route code)
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Login failed' });
  }
  // ... (your login route code)
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
