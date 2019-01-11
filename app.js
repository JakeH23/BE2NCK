const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routers/apiRouter');
const { handle400, handle404, handle422 } = require('./errors/index');
const listEndpoints = require('express-list-endpoints');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  if (req.url === '/api') {
    res.status(200).send({ paths: listEndpoints(app) });
  } else next();
});

app.use('/api', apiRouter);

app.use('/*', (req, res, next) => {
  next({ status: 404, message: 'page not found' });
});

app.use(handle400);
app.use(handle422);
app.use(handle404);

module.exports = app;
