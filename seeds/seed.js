const {
  topicData, userData, articleData, commentData,
} = require('../db/data/development-data');
const {
  userLookup, formatArticles, articleLookup, formatComments,
} = require('../db/data/utils');

exports.seed = function (knex, Promise) {
  return Promise.all([knex('topics').del(), knex('users').del(), knex('articles').del(), knex('comments').del()])
    .then(() => knex('topics').insert(topicData).returning('*'))
    .then(() => knex('users').insert(userData).returning('*'))
    .then((usersRows) => {
      const userLookObj = userLookup(usersRows);
      const formattedArticles = formatArticles(articleData, userLookObj);
      return Promise.all([userLookObj, knex('articles').insert(formattedArticles).returning('*')]);
    })
    .then(([userLookObj, articleRows]) => {
      const articleLookupObj = articleLookup(articleRows);
      const formattedComments = formatComments(commentData, articleLookupObj, userLookObj);
      return knex('comments').insert(formattedComments).returning('*');
    });
};
