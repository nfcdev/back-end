/* eslint-disable no-undef */
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const normalizePort = require('normalize-port');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { passport } = require('./src/util/authentication');
const {
  frontendURL, backendURL, backendport, frontendport,
} = require('./config').get(process.env.NODE_ENV);

// Create the server
const port = normalizePort(`${backendport}` || '9000');
const app = express();


let FRONTEND_URL = `${frontendURL}:${frontendport}`;
const BACKEND_URL = `${backendURL}:${backendport}`;

if (process.env.NODE_ENV === 'production') {
  FRONTEND_URL = FRONTEND_URL.replace(':', '');
}

const whitelist = [
  FRONTEND_URL,
  BACKEND_URL,
];


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

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  bodyParser.json({
    verify: rawBodyBuffer,
  }),
);

app.use(passport.initialize({}));

// Import routes
app.use(require('./src/routes'));


if (process.env.NODE_ENV === 'production') {
  app.get('*.*', express.static(path.join(__dirname, './public')));
  app.get('*', (req, res) => {
    res.status(200).sendFile('/', { root: './public' });
  });
} else {
  // Dev environment
  app.use('/static', express.static(path.join(__dirname, './static')));
  app.get('*', (request, response) => {
    fs.readFile('static/404.html', (error, content) => {
      response.writeHead(404, { 'Content-Type': 'text/html' });
      response.end(content, 'utf-8');
    });
  });
}

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
