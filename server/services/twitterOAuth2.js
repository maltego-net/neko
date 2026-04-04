const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  clientId:     process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

const callbackURL = process.env.TWITTER_CALLBACK_URL;
const scopes      = [
  'tweet.read', 'tweet.write',
  'users.read', 'media.write',
  'like.read', 'like.write',
  'follows.read', 'follows.write',
  'offline.access'
];

async function getOAuth2Link(req) {
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
    callbackURL,
    { scope: scopes }
  );
  req.session.codeVerifier = codeVerifier;
  req.session.state        = state;
  return url;
}

async function handleOAuth2Callback(req) {
  const { state, code } = req.query;
  if (state !== req.session.state) throw new Error('Invalid OAuth state');

  const { client: loggedClient, accessToken, refreshToken, expiresIn } =
    await client.loginWithOAuth2({
      code,
      codeVerifier: req.session.codeVerifier,
      redirectUri:  callbackURL
    });

  const { data: profile } = await loggedClient.v2.me();

  return {
    profile,
    tokens: { accessToken, refreshToken, expiresIn }
  };
}

module.exports = { getOAuth2Link, handleOAuth2Callback };
