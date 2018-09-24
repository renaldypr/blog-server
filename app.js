require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors())
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const indexRoute = require('./routes/indexRoute');
const userRoute = require('./routes/userRoute');
const articleRoute = require('./routes/articleRoute');
const commentRoute = require('./routes/commentRoute');

app.use('/', indexRoute);
app.use('/users', userRoute);
app.use('/articles', articleRoute);
app.use('/comments', commentRoute);

const mlabUsername = process.env.MLAB_USERNAME;
const mlabPassword = process.env.MLAB_PASSWORD;

if (process.env.NODE_ENV === 'test') {
  var url = '@ds259912.mlab.com:59912/blog-test'
} else {
  var url = '@ds259912.mlab.com:59912/blog-main'
}

mongoose.connect(`mongodb://${mlabUsername}:${mlabPassword}${url}`, { useNewUrlParser: true })
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(`Connected blog db!`);
});

app.listen(3000, () => {
  console.log('listening on port 3000!')
})

module.exports = app;