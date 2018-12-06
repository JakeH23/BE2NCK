const articlesRouter = require('express').Router();
const { handle405 } = require('../errors');

const {
  getAllArticles,
  fetchSpecificArticle,
  updateArticleVotes,
  deleteArticle,
  fetchAllCommentsOnArticle,
  addCommentToArticle,
  updateCommentVotes,
  deleteComment,
} = require('../controllers/articlesController');

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405);
articlesRouter
  .route('/:article_id')
  .get(fetchSpecificArticle)
  .patch(updateArticleVotes)
  .delete(deleteArticle)
  .all(handle405);
articlesRouter
  .route('/:article_id/comments')
  .get(fetchAllCommentsOnArticle)
  .post(addCommentToArticle)
  .all(handle405);
articlesRouter
  .route('/:article_id/comments/:comment_id')
  .patch(updateCommentVotes)
  .delete(deleteComment)
  .all(handle405);

module.exports = articlesRouter;
