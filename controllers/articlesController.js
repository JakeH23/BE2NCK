const connection = require('../db/connection');

exports.getAllArticles = (req, res, next) => {
  const { limit: maxResult = 10 } = req.query;
  let { sort_by } = req.query;
  const { sort_ascending } = req.query;
  const { p = 1 } = req.query;
  if (isNaN(maxResult)) return next({ status: 400, message: 'invalid syntax for limit query' });
  let order_by = 'desc';
  if (sort_ascending === 'true') {
    order_by = 'asc';
  }
  const validSortQueries = ['author', 'title', 'article_id', 'votes', 'comment_count', 'body', 'created_at'];
  if (!validSortQueries.includes(sort_by)) sort_by = 'created_at';
  if (isNaN(p)) return next({ status: 400, message: 'invalid syntax for limit query' });

  return connection('articles')
    .select(
      'username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
    )
    .join('users', 'articles.created_by', 'users.user_id')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id', 'users.username')
    .limit(maxResult)
    .offset(maxResult * (p - 1))
    .orderBy(sort_by, order_by)
    .then((articles) => {
      res.status(200).send({ articles });
    });
};


exports.fetchSpecificArticle = (req, res, next) => {
  const { article_id } = req.params;
  connection('articles')
    .select(
      'username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
      'articles.body',
    )
    .join('users', 'articles.created_by', 'users.user_id')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .where({ 'articles.article_id': article_id })
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id', 'users.username')
    .then((articles) => {
      if (articles.length === 0) return Promise.reject({ status: 404, message: 'page not found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
};

exports.updateArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  connection('articles')
    .where('article_id', '=', article_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((voteUpdate) => {
      if (voteUpdate.length === 0) next({ status: 404, message: 'page not found' });
      return res.status(202).send({ voteUpdate });
    })
    .catch(next);
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  connection('articles')
    .where('article_id', article_id)
    .del()
    .returning('*')
    .then(() => {
      res.status(204).send({});
    })
    .catch(next);
};

exports.fetchAllCommentsOnArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { limit: maxResult = 10 } = req.query;
  let { sort_by } = req.query;
  const { sort_ascending } = req.query;
  const { p = 1 } = req.query;
  if (isNaN(maxResult)) return next({ status: 400, message: 'invalid syntax for limit query' });
  let order_by = 'desc';
  if (sort_ascending === 'true') {
    order_by = 'asc';
  }
  const validSortQueries = ['comment_id', 'votes', 'created_at', 'body', 'author'];
  if (!validSortQueries.includes(sort_by)) sort_by = 'created_at';
  if (isNaN(p)) return next({ status: 400, message: 'invalid syntax for limit query' });

  return connection('comments')
    .select(
      'comments.comment_id',
      'comments.votes',
      'comments.created_at',
      'users.username AS author',
      'comments.body',
    )
    .join('users', 'users.user_id', '=', 'comments.user_id')
    .where('article_id', article_id)
    .limit(maxResult)
    .offset(maxResult * (p - 1))
    .orderBy(sort_by, order_by)
    .then((comments) => {
      res.status(200).send({ comments });
    });
};

exports.addCommentToArticle = (req, res, next) => {
  const newInsert = { ...req.body, ...req.params };
  connection
    .insert(newInsert)
    .into('comments')
    .returning('*')
    .then(([newComment]) => {
      res.status(201).send({ newComment });
    })
    .catch(next);
};

exports.updateCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  connection('comments').where('comment_id', '=', comment_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((voteUpdate) => {
      if (voteUpdate.length === 0) return next({ status: 404, message: 'comment id not found' });
      return res.status(202).send({ voteUpdate });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { article_id } = req.params;
  const { comment_id } = req.params;
  return connection('comments')
    .where('article_id', article_id)
    .where('comment_id', comment_id)
    .del()
    .then((comment) => {
      if (comment.length === 0) return Promise.reject({ status: 404, message: 'page not found' });
      return res.status(204).send({});
    })
    .catch(next);
};
