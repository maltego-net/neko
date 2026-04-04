// server/index.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const session  = require('express-session');
const {
  getOAuth2Link,
  handleOAuth2Callback
} = require('./services/twitterOAuth2');
const User         = require('./models/User');
const questsRouter = require('./routes/quests');

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 3600_000,
  }
}));

mongoose.connect(
  process.env.MONGO_URI.replace('localhost', '127.0.0.1'),
  {}
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/api/auth/twitter2', async (req, res, next) => {
  try {
    const authUrl = await getOAuth2Link(req);
    res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
});

app.get('/api/oauth2/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/?oauth_error=1`);
  }
  if (state !== req.session.state) {
    return res.redirect(`${process.env.FRONTEND_URL}/?oauth_error=2`);
  }

  try {
    const { profile, tokens } = await handleOAuth2Callback(req);
    const user = await User.findOneAndUpdate(
      { twitterId: profile.id },
      {
        twitterId:   profile.id,
        username:    profile.username,
        displayName: profile.name,
        photo:       profile.profile_image_url,
        oauthTokens: tokens,
      },
      { upsert: true, new: true }
    );

    req.session.userId = user._id;

    res.redirect(`${process.env.FRONTEND_URL}/quests`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}/?oauth_error=3`);
  }
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ user: null });
  }
  const user = await User.findById(req.session.userId).lean();
  res.json({ user });
});

app.use('/api/quests', questsRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
