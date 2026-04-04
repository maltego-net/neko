// server/models/User.js
const mongoose = require('mongoose');

const OAuthTokensSchema = new mongoose.Schema({
  accessToken:  { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresIn:    { type: Number, required: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  twitterId:       { type: String, required: true, unique: true },
  username:        { type: String },
  displayName:     { type: String },
  photo:           { type: String },
  oauthTokens:     { type: OAuthTokensSchema },      // ← теперь здесь лежат токены
  completedQuests: { type: [Number], default: [] },
  wallet:          { type: String, default: '' },
  createdAt:       { type: Date,   default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
