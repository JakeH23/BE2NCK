const usersRouter = require('express').Router();
const { handle405 } = require('../errors');

const { getAllUsers, fetchSpecificUser } = require('../controllers/usersContoller');

usersRouter.route('/').get(getAllUsers).all(handle405);
usersRouter.route('/:username').get(fetchSpecificUser).all(handle405);

module.exports = usersRouter;
