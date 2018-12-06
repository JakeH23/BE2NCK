const ENV = process.env.NODE_ENV || 'test';
const knex = require('knex');
const options = require('../knexfile')[ENV];

const connection = knex(options);

module.exports = connection;
