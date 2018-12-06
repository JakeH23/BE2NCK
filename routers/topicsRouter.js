const topicsRouter = require('express').Router();
const { handle405 } = require('../errors');

const {
  getAllTopics,
  addTopic,
  fetchAllArticlesOnTopic,
  addArticle,
} = require('../controllers/topicsController');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(addTopic)
  .all(handle405);
topicsRouter
  .route('/:topic/articles')
  .get(fetchAllArticlesOnTopic)
  .post(addArticle)
  .all(handle405);

module.exports = topicsRouter;
