/* eslint-disable no-undef */
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const http = require('http');
const normalizePort = require('normalize-port');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { passport } = require('./src/util/authentication');
const config = require('./config');

// Create the server
const port = normalizePort(process.env.PORT || '3000');
const app = express();

const whitelist = [`${config.frontend.host}:${config.frontend.port}`];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Origin was: ', origin);

      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

// TODO: Change to a better secret
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  bodyParser.json({
    verify: rawBodyBuffer,
  }),
);

app.use(passport.initialize({}));
app.use(passport.session({}));

// Import routes
app.use(require('./src/routes'));

app.use('/public', express.static(path.join(__dirname, './static')));

// Page not found
app.get('*', (request, response) => {
  fs.readFile('static/404.html', (error, content) => {
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end(content, 'utf-8');
  });
});

// Start the server
const server = http.createServer(app);

server.listen(port, () => {
  console.log('Server started!');
  console.log(`Server listening on port ${port}`);
  app.emit('APP_STARTED');


  // This is for the automatic building system
  if (process.env.IS_CIRCLECI) process.exit(0);
});

module.exports = app;
