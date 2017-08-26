const app = require('./components/app');

const port = 8080;

app.listen(port, (err) => {
  if (err) return console.log(err);
  return console.log(`Server runnig on ${port}`);
});

