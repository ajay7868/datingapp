var passport = require('passport');
var db = require('../config/connection');
var token = require('../config/generateToken');
var isAuthorized = require('../config/authMiddleware').isAuthorized;

var User;
db.getInstance(function (p_db) {
  User = p_db.collection('users');
  Profile = p_db.collection('user_profile');
});

function generateUserToken(req, res) {
  var accessToken = token.generateAccessToken(req.user._id);
  if (!accessToken) {
    res.json({ message: "Authentication failed" });
  } else {
    res.json({ message: "Authentication completed", token: accessToken });
  }
}

module.exports = function (app) {

  // Instagram authentication
  app.get(
    '/auth/instagram',
    passport.authenticate('instagram', { session: false })
  );
  app.get('/api/auth/instagram/callback', function (req, res, next) {
    passport.authenticate('instagram', { session: false, failWithError: true },
      async function (err, user) {
        user = await user;
        if (err) return res.json({ message: err.message, token: null });
        if (!user) {
          return res.json({ message: "Authentication failed", token: null });
        } else {
          var accessToken = token.generateAccessToken(user._id);
          if (!accessToken) {
            res.json({ message: "Authentication failed", token: null });
          } else {
            res.json({ message: "Authentication completed", token: accessToken });
          }
        }
      })(req, res, next);
  });
  app.post('/api/user',
    passport.authenticate('instagram', { session: false }),
    generateUserToken
  );

  // Google and Facebook authorization can be made only if the user is authenticated
  // It simply connects Google and FB to the user's profile
  app.get('/auth/google', isAuthorized, function (req, res, next) {
    passport.authorize('google', {
      scope: ['profile', 'email'], session: false
    })(req, res, next);
  });
  app.get('/api/auth/google/callback', isAuthorized, function (req, res, next) {
    passport.authorize('google', {
      scope: ['profile', 'email'], session: false
    }, async function (err, user) {
      user = await user;
      if (err) return res.json({ error: err });
      if (!user) return res.json({ message: "Unauthorized" });
      res.json({ message: "Authorized" });
    })(req, res, next);
  });

  app.get('/auth/facebook', isAuthorized, function (req, res, next) {
    passport.authorize('facebook', { session: false })(req, res, next);
  });
  app.get('/api/auth/facebook/callback', isAuthorized, function (req, res, next) {
    passport.authorize('facebook', { session: false }, async function (err, user) {
      user = await user;
      if (err) return res.json({ error: err });
      if (!user) return res.json({ message: "Unauthorized" });
      res.json({ message: "Authorized" })
    })(req, res, next);
  });


  // Local client registration and authentication
  app.post('/api/auth/local/signup', function (req, res, next) {
    passport.authenticate('local-signup', { session: false, failWithError: true },
      async function (err, user) {
        user = await user;
        if (err) return res.json({ message: err.message, token: null });
        if (!user) {
          return res.json({ message: req.authMessage, token: null });
        } else {
          var accessToken = token.generateAccessToken(user._id);
          if (!accessToken) {
            res.json({ message: "Registration failed", token: null });
          } else {
            res.json({ message: "Registration completed", token: accessToken });
          }
        }
      })(req, res, next);
  });
  app.post('/api/auth/local/login', function (req, res, next) {
    passport.authenticate('local-login', { session: false, failWithError: true },
      async function (err, user) {
        user = await user;
        if (err) return res.json({ message: err.message, token: null });
        if (!user) {
          return res.json({ message: req.authMessage, token: null });
        } else {
          var accessToken = token.generateAccessToken(user._id);
          if (!accessToken) {
            res.json({ message: "Registration failed", token: null });
          } else {
            res.json({ message: "Registration completed", token: accessToken });
          }
        }
      })(req, res, next);
  });

  // API FOR CREATE PROFILE
  app.post('/api/auth/user/signup', function (req, res, next) {
    passport.authenticate("create-profile", { session: false, failWithError: true },
      async function (err, user) {
        user = await user;
        // console.log('created user is', user)
        if (err) return res.json({ message: err.message, token: null });
        if (!user) {
          return res.json({ message: req.authMessage, token: null });
        } else {
          var accessToken = token.generateAccessToken(user._id);
          if (!accessToken) {
            res.json({ message: "Registration failed", token: null });
          } else {
            res.json({ message: "Registration completed", token: accessToken });
          }
        }

      })(req, res, next);
  })

  // user login
  app.post('/api/auth/user/login', function (req, res, next) {
    passport.authenticate('user-login', { session: false, failWithError: true },
      async function (err, user) {
        user = await user;
        if (err) return res.json({ message: err.message, token: null });
        if (!user) {
          return res.json({ message: req.authMessage, token: null });
        } else {
          var accessToken = token.generateAccessToken(user._id);
          if (!accessToken) {
            res.json({ message: "Authorization failed", token: null });
          } else {
            res.json({ message: "Authorization completed", token: accessToken });
          }
        }
      })(req, res, next);
  });
};
