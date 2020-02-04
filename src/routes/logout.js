const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {
  if (req.isAuthenticated()) {
    // this destroys the current session (not really necessary because you get a new one
    delete req.session.user; // remove credentials
    req.session.authenticated = false; // set flag
    req.session.destroy(err => {
      if (err) return res.status(500).send('Could not log out.');
      else res.send({});
    });
  } else {
    res.send('cant remove public session', 500); // public sessions don't containt sensible information so we leave them
  }
});

module.exports = router;
