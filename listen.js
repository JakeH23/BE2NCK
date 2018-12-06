const app = require('./app.js');

app.listen(3000, (err) => {
  if (err) console.log(err);
  else console.log('listening on 3000');
});
