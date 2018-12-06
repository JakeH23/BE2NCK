const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  connection
    .select('*')
    .from('topics')
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};
exports.addTopic = (req, res, next) => {
  connection
    .returning('*')
    .insert(req.body)
    .into('topics')
    .then(([topic]) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.fetchAllArticlesOnTopic = (req, res, next) => {
  const { topic } = req.params;
  const { limit: maxResult = 10 } = req.query;
  let { sort_by } = req.query;
  const { sort_ascending } = req.query;
  const { p = 1 } = req.query;
  let order_by = 'desc';
  if (sort_ascending === 'true') {
    order_by = 'asc';
  }
  if (isNaN(+maxResult)) return next({ status: 400, message: 'invalid syntax for limit query' });
  if (isNaN(+p)) return next({ status: 400, message: 'invalid syntax for limit query' });
  const validSortQueries = ['title', 'article_id', 'created_by', 'body', 'created_at'];
  if (!validSortQueries.includes(sort_by)) sort_by = 'created_at';
  return connection('articles')
    .select(
      'articles.title',
      'articles.topic',
      'articles.created_by AS author',
      'articles.article_id',
      'articles.body',
      'articles.created_at',
      'articles.votes',
    )
    .count('comments.comment_id AS comment_count')
    .groupBy('articles.article_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .leftJoin('users', 'users.user_id', '=', 'articles.created_by')
    .where({ topic })
    .limit(maxResult)
    .offset(maxResult * (p - 1))
    .orderBy(sort_by, order_by)
    .then((articles) => {
      if (articles.length === 0) return Promise.reject({ status: 404, message: 'Page not found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
};

exports.addArticle = (req, res, next) => {
  const newInsert = { ...req.body, ...req.params };
  connection
    .insert(newInsert)
    .into('articles')
    .returning('*')
    .then(([newArticle]) => {
      res.status(201).send({ newArticle });
    })
    .catch(next);
};
