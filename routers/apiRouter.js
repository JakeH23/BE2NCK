const apiRouter = require('express').Router();
const topicsRouter = require('../routers/topicsRouter');
const articlesRouter = require('../routers/articlesRouter');
const usersRouter = require('../routers/usersRouters');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
