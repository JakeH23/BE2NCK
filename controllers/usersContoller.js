const connection = require('../db/connection');

exports.getAllUsers = (req, res, next) => {
  connection('users')
    .select('*')
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.fetchSpecificUser = (req, res, next) => {
  const { user_id } = req.params;
  connection('users')
    .select('*')
    .where({ 'users.user_id': user_id })
    .then(([user]) => {
      if (user.length === 0) return Promise.reject({ status: 404, message: 'page not found' });
      return res.status(200).send({ user });
    })
    .catch(next);
};
