// server/services/twitterAuth.js
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

// Здесь нужно твои ключи
passport.use(new TwitterStrategy({
    consumerKey:    process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL:    process.env.TWITTER_CALLBACK_URL
  },
  function(token, tokenSecret, profile, done) {
    // Здесь сохраняешь или ищешь пользователя в БД
    // Для MVP просто передадим профиль дальше:
    return done(null, profile);
  }
));

// Сериализация в сессию
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
