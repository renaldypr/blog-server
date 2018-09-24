const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please input your message!'],
  }
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;