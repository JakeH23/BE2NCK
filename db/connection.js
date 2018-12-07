const knex = require('knex');

const ENV = process.env.NODE_ENV || 'development';
const config = ENV === 'production' ? { client: 'pg', connection: process.env.DATABASE_URL } : require('../knexfile')[ENV];

const connection = knex(config);

module.exports = connection;
