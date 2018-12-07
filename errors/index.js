exports.handle400 = (err, req, res, next) => {
  console.log(err);
  const errCodes = {
    42703: 'invalid input',
    '22P02': 'invalid input syntax for integer',
  };
  if (err.status === 400) res.status(400).send({ message: err.message });
  else if (errCodes[err.code]) {
    res.status(400)
      .send({ message: errCodes[err.code] });
  } else next(err);
};

exports.handle422 = (err, req, res, next) => {
  const errCodes = {
    23505: 'violates foreign key constraint',
  };
  if (err.status === 422 || err.constraint === 'articles_user_id_foreign' || err.constraint === 'comments_user_id_foreign') res.status(422).send({ message: 'unprocessable entity' });
  else if (errCodes[err.code]) {
    res.status(422)
      .send({ message: errCodes[err.code] });
  } else next(err);
};

exports.handle404 = (err, req, res, next) => {
  if (err.status === 404 || err.constraint === 'articles_topic_foreign' || err.constraint === 'comments_article_id_foreign') res.status(404).send({ message: 'page not found' });
  else next(err);
};

exports.handle405 = (req, res, next) => {
  res.status(405).send({ status: 405, message: 'this method is not allowed' });
};
