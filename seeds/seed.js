const {
  topicData,
  userData,
  articleData,
  commentData,
} = require('../db/data/test-data');
const { articleDateFormat } = require('../db/data/utils');


exports.seed = function (knex, Promise) {
  return Promise.all([knex('topics').del(), knex('users').del(), knex('articles').del(), knex('comments').del()])
    .then(() => {
      return knex('topics')
        .insert(topicData)
        .returning('*');
    })
    .then((topicsRows) => {
      return knex('users')
        .insert(userData)
        .returning('*');
    })
    .then((usersRows) => {
      const formattedArticleData = articleDateFormat(articleData);
      return knex('articles')
        .insert(formattedArticleData)
        .returning('*');
    })
    .then((articlesRows) => {
      return knex('comments')
        .insert(commentData)
        .returning('*');
    });
};
