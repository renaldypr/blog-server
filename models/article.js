const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var articleSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please input a title!']
  },
  userId: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please input your content!'],
  },
  comments: [{
    type: Schema.Types.ObjectId, ref: 'Comment',
  }]
}, {
  timestamps: true
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;