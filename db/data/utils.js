const moment = require('moment');

exports.articleDateFormat = (articleData) => {
  articleData.map((article) => {
    article.created_at = moment(article.created_at).format('YYYY-MM_DD');
    return article;
  });
};

exports.usernameToUserIDLookup = () => {

};
