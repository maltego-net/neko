// server/routes/auth.js
const router   = require('express').Router();
const passport = require('passport');
const User     = require('../models/User');

// 1) Redirect to Twitter OAuth
router.get('/twitter', passport.authenticate('twitter'));
  
// 2) OAuth callback
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      const profile = req.user;
      // upsert: создаём новую запись или обновляем существующую
      await User.findOneAndUpdate(
        { twitterId: profile.id },
        {
          username:    profile.username,
          displayName: profile.displayName,
          photo:       profile.photos?.[0]?.value,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      console.error('Mongo saveUser error:', err);
    }
    // После успешного входа редиректим на фронт
    res.redirect('http://localhost:3000/quests');
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// 3) Проверка статуса авторизации
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    // Отдаём сохранённый в сессии профиль
    return res.json({ user: req.user });
  }
  res.status(401).json({ user: null });
});

module.exports = router;
