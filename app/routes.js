module.exports = function (app, passport, db) {
  app.get('/', function (req, res) {
    db.collection('games')
      .find()
      .toArray((err, bets) => {
        if (err) return console.log(err);
        let playerWinnings = 0;
        let betSquare = 'N/A';
        let resultSquare = 'N/A';


//this allows the bets to reset only the user winnings w/o affect casino winning records//
        if (bets.length) {
          const postResetBets = []
          for (let i = bets.length - 1; i > 0; i--) {
            postResetBets.push(bets[i])

            if (bets[i].reset) {
              break
            }
          }

          playerWinnings = postResetBets
            .map((postResetBets) => postResetBets.playerOutcome)
            .reduce((a, b) => a + b);

          betSquare = bets[bets.length - 1].betSquare;
          resultSquare = bets[bets.length - 1].resultSquare;
        }

        res.render('index.ejs', {
          playerWinnings,
          betSquare,
          resultSquare,
        });
      });
  });

  app.get('/profile', function (req, res) {
    db.collection('games')
      .find()
      .toArray((err, bets) => {
        if (err) return console.log(err);

        const casinoWinnings = bets
          .map((bet) => bet.casinoOutcome)
          .reduce((a, b) => a + b);

        const casinoWins = bets.filter(
          ({ casinoOutcome }) => casinoOutcome > 0,
        );
        const playerWins = bets.filter(
          ({ playerOutcome }) => playerOutcome > 0,
        );
        res.render('profile.ejs', {
          user: req.user,
          bets,
          casinoWinnings,
          casinoWins,
          playerWins,
        });
      });
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/bets', (req, res) => {
    const { betAmount, square: betSquare } = req.body;
    const resultSquare = Math.floor(Math.random() * 36) + 1;
    const winner = resultSquare === betSquare ? 'player' : 'casino';
    const casinoOutcome = winner === 'casino' ? betAmount : -betAmount;
    const playerOutcome = winner === 'casino' ? -betAmount : betAmount;

    db.collection('games').save(
      {
        casinoOutcome,
        playerOutcome,
        betSquare,
        resultSquare,
      },
      (err, result) => {
        if (err) return console.log(err);
        res.redirect('/');
      },
    );
  });

  app.post('/reset-bets', (req, res) => {
    db.collection('games').save(
      {
        casinoOutcome: 0,
        playerOutcome: 0,
        betSquare: 0,
        resultSquare: 0,
        reset: true
      },
      (err, result) => {
        if (err) return console.log(err);
        res.redirect('/');
      },
    );
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post(
    '/login',
    passport.authenticate('local-login', {
      successRedirect: '/profile', // redirect to the secure profile section
      failureRedirect: '/login', // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    }),
  );

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post(
    '/signup',
    passport.authenticate('local-signup', {
      successRedirect: '/profile', // redirect to the secure profile section
      failureRedirect: '/signup', // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    }),
  );

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}
