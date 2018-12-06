const moment = require('moment');

exports.formatArticles = (data, userLookup) => {
  const formattedArticles = data.map((article) => {
    const newArticle = JSON.parse(JSON.stringify(article));
    newArticle.created_at = moment(article.created_at).format('YYYY-MM-DD');
    newArticle.created_by = userLookup[article.created_by];
    return newArticle;
  });
  return formattedArticles;
};

exports.formatComments = (data, articleLookup, userLookup) => {
  const formattedComments = data.map((comment) => {
    const newComment = JSON.parse(JSON.stringify(comment));
    newComment.created_at = moment(comment.created_at).format('YYYY-MM-DD');
    newComment.article_id = articleLookup[comment.belongs_to];
    newComment.user_id = userLookup[comment.created_by];
    const {
      body, votes, user_id, created_at, article_id,
    } = newComment;
    return {
      body, votes, user_id, created_at, article_id,
    };
  });
  return formattedComments;
};

exports.userLookup = (users) => {
  const userLookup = {};
  users.forEach((user) => {
    userLookup[user.username] = user.user_id;
  });
  return userLookup;
};

exports.articleLookup = (articles) => {
  const articleLookup = {};
  articles.forEach((article) => {
    articleLookup[article.title] = article.article_id;
  });
  return articleLookup;
};
