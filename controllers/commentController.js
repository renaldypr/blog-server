const Comment = require('../models/comment');
const Article = require('../models/article');

module.exports = {
  showAll: function(req,res) {
    Comment.find()
      .populate('userId')
      .exec((err, comments) => {
      if(!err) {
        res.status(200).json({
          message: 'find all comments success!',
          data: comments
        })
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  create: function(req,res) {
    Comment.create({
      userId: req.decoded.id,
      message: req.body.message
    })
      .then(comment => {
        Article.findByIdAndUpdate(
          req.body.articleId,
          {$push: {"comments": comment}},
          {safe: true, upsert: true, new : true},
          function(err, model) {
            if(!err) {
              res.status(201).json({
                message: 'comment created successfully!',
                data: comment
              })
            } else {
              res.status(500).json({
                message: err
              })
            }
          }
        )
      })
      .catch(err => {
        res.status(500).json({
          message: err
        })
      })
  },
  erase: function(req,res) {
    Comment.find({ _id: req.body.id }, function(err,comment) {
      if(!err) {
        if (comment.length !== 0) {
          if (comment[0].userId == req.decoded.id) {
            Comment.deleteOne({ _id: req.body.id }, function (err) {
              if(!err) {
                res.status(200).json({
                  message: 'comment deleted successfully',
                })
              } else {
                res.status(500).json({
                  message: err
                })
              }
            })
          } else {
            res.status(500).json({
              message: 'you are not the owner of this comment!'
            })
          }
        } else {
          res.status(404).json({
            message: 'the requested comment is not available'
          })
        }    
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  }
}