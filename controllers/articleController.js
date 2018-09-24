const Article = require('../models/article');
const googleTranslate = require('google-translate')(process.env.API_KEY);

module.exports = {
  showAll: function(req,res) {
    Article.find()
      .populate('userId')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: {
            path: 'userId',
            model: 'User'
        }
      })
      .exec((err, articles) => {
      if(!err) {
        res.status(200).json({
          message: 'find all articles success!',
          data: articles
        })
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  showOne: function(req,res) {
    Article.findOne({ _id: req.params.id })
      .populate('userId')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: {
            path: 'userId',
            model: 'User'
        }
      })
      .exec((err, article) => {
      if(!err) {
        if(article) {
          res.status(200).json({
            message: 'find one articles success!',
            data: article
          })
        } else {
          res.status(500).json({
            message: 'article not found!'
          })
        }
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  create: function(req,res) {
    Article.create({
      title: req.body.title,
      userId: req.decoded.id,
      content: req.body.content,
      comments: []
    })
      .then(article => {
        res.status(201).json({
          message: 'article created successfully!',
          data: article
        })
      })
      .catch(err => {
        res.status(500).json({
          message: err
        })
      })
  },
  erase: function(req,res) {
    Article.find({ _id: req.body.id }, function(err,article) {
      if(!err) {
        if (article.length !== 0) {
          if (article[0].userId == req.decoded.id) {
            Article.deleteOne({ _id: req.body.id }, function (err) {
              if(!err) {
                res.status(200).json({
                  message: 'article deleted successfully',
                })
              } else {
                res.status(500).json({
                  message: err
                })
              }
            })
          } else {
            res.status(500).json({
              message: 'you are not the owner of this article!'
            })
          }
        } else {
          res.status(404).json({
            message: 'the requested article is not available'
          })
        }    
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  edit: function(req,res) {
    Article.findOne({ _id: req.body.id }, function(err, article) {
      if(!err) {
        if (article) {
          if (article.userId == req.decoded.id) {
            article.title = req.body.title
            article.content = req.body.content
            article.save()
            res.status(200).json({
              message: 'article edited successfully!',
              data: article
            })
          } else {
            res.status(500).json({
              message: 'you are not the owner of this article!'
            })
          }
        } else {
          res.status(404).json({
            message: 'the requested article is not available'
          })
        }      
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  translate: function(req,res) {
    googleTranslate.translate(req.body.title, 'id', function(err, translationTitle) {
      if (!err) {
        googleTranslate.translate(req.body.content, 'id', function(err, translationContent) {
          if (!err) {
            res.status(200).json({
              message: 'translate success!',
              data: {
                newTitle: translationTitle.translatedText,
                newContent: translationContent.translatedText
              }
            })
          } else {
            res.status(500).json({
              message: err
            })
          }
        })
      } else {
        res.status(500).json({
          message: err
        })
      }

    })
  }
}