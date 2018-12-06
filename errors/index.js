exports.handle400 = (err, req, res, next) => {
  const errCodes = {
    42703: 'invalid input',
    '22P02': 'invalid input syntax for integer',
  };
  if (errCodes[err.code]) {
    res.status(400)
      .send({ status: errCodes[err.code] });
  } else next(err);
};

exports.handle422 = (err, req, res, next) => {
  const codes = {
    23503: 'the value inserted in foreign key is invalid',
    23505: 'violates foreign key constraint',
  };
  if (codes[err.code]) res.status(422).send({ message: codes[err.code] });
  else next(err);
};

exports.handle405 = (req, res, next) => {
  res.status(405).json({ status: 405, message: 'this method is not allowed' });
};

exports.handle404 = (err, req, res, next) => {
  if (err.status === 404) res.status(404).send({ message: err.message });
  else next(err);
};
