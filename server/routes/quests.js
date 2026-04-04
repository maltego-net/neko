// server/routes/quests.js
require('dotenv').config();

const router         = require('express').Router();
const User           = require('../models/User');
const { TwitterApi } = require('twitter-api-v2');

// Константы из .env
const KV3_ID      = process.env.KVEST3_TWEET_ID;
const KV3_URL     = process.env.KVEST3_TWEET_URL;
const KV4_HASHTAG = process.env.KVEST4_HASHTAG;
const KV4_TEXT    = process.env.KVEST4_TEXT;
const DISCORD_URL = process.env.DISCORD_INVITE_URL;

// Middleware: проверяем, что сессия жива
function ensureAuth(req, res, next) {
  if (req.session?.userId) return next();
  return res.status(401).json({ error: 'Not authorized' });
}

// GET /api/quests
router.get('/', (req, res) => {
  const payload = [
    { id: 1, title: 'Connect X',        type: 'oauth' },
    { id: 2, title: 'Turn on notifications',  type: 'notification', url: 'https://x.com/ordineko' },
    { id: 3, title: 'Retweet and like posts', type: 'retweetLike',   tweetId: KV3_ID, url: KV3_URL },
    {
      id: 4,
      title: 'Make a Tweet',
      type: 'tweet',
      hashtag: KV4_HASHTAG,
      text:    KV4_TEXT
    },
    { id: 5, title: 'Join our Discord',   type: 'discord',  url: DISCORD_URL }
  ];
  res.json({ quests: payload });
});

// POST /api/quests/:id/complete
router.post('/:id/complete', ensureAuth, async (req, res) => {
  const qid    = Number(req.params.id);
  const userId = req.session.userId;
  let dbUser   = await User.findById(userId);

  if (!dbUser) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Session expired, log in again.' });
  }
  if (!dbUser.oauthTokens?.accessToken) {
    return res.status(401).json({ error: 'Not logged in via Twitter OAuth2' });
  }

  // Инициализируем клиент с токенами пользователя
  let client = new TwitterApi({
    clientId:     process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    accessToken:  dbUser.oauthTokens.accessToken,
    refreshToken: dbUser.oauthTokens.refreshToken
  });

  // Авто-refresh токена при 401
  async function ensureFresh(orig) {
    try {
      await orig.v2.me();
      return orig;
    } catch (err) {
      const rt = dbUser.oauthTokens.refreshToken;
      if (err.code === 401 && rt) {
        const { client: refreshedClient, accessToken, refreshToken, expiresIn } =
          await orig.refreshOAuth2Token(rt);
        dbUser = await User.findByIdAndUpdate(
          userId,
          { oauthTokens: { accessToken, refreshToken, expiresIn } },
          { new: true }
        );
        return refreshedClient;
      }
      throw err;
    }
  }

  try {
    client = await ensureFresh(client);

    // Quest #3: проверяем ретвит
    if (qid === 3) {
      if (!KV3_ID) {
        return res.status(500).json({ error: 'KVEST3_TWEET_ID not set in .env' });
      }
      const { data: retweeters } = await client.v2.tweetRetweetedBy(KV3_ID, { max_results: 100 });
      const hasRetweeted = Array.isArray(retweeters) && retweeters.some(u => u.id === dbUser.twitterId);
      if (!hasRetweeted) {
        return res.status(400).json({ error: 'Please retweet the specified tweet first.' });
      }
    }

    // Quest #4: проверяем твит с хэштегом
    if (qid === 4) {
      if (!KV4_HASHTAG) {
        return res.status(500).json({ error: 'KVEST4_HASHTAG not set in .env' });
      }
      let tweetsArray = [];
      try {
        const timeline = await client.v2.userTimeline(dbUser.twitterId, { max_results: 50 });
        tweetsArray = Array.isArray(timeline.data)
          ? timeline.data
          : Array.isArray(timeline.data?.data)
            ? timeline.data.data
            : [];
      } catch {
        tweetsArray = [];
      }

      const found = tweetsArray.some(t => t.text.includes(KV4_HASHTAG));
      if (!found && tweetsArray.length > 0) {
        return res.status(400).json({ error: `You must post a tweet containing "${KV4_TEXT}".` });
      }
    }

    // Помечаем квест выполненным
    const updated = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { completedQuests: qid } },
      { new: true }
    );

    res.json({ completedQuests: updated.completedQuests });

  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quests/wallet — сохранение кошелька
router.post('/wallet', ensureAuth, async (req, res) => {
  const { wallet } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(
      req.session.userId,
      { wallet },
      { new: true }
    );
    return res.json({ wallet: updated.wallet });
  } catch {
    return res.status(500).json({ error: 'Failed to save wallet.' });
  }
});

module.exports = router;
