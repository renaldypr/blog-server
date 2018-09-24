process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');
const Article = require('../models/article');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('Comment', function() {
  var tempToken = ''
  var userId = ''
  var articleId = ''
  var commentId = ''

  beforeEach(function(done) {
    User.create({
      name: 'admin',
      password: '12345',
      email: 'admin@mail.com'
    })
      .then(function(user) {
        userId = user._id
        jwt.sign({id: user._id, name: user.name, email:user.email}, process.env.JWT_KEY, function(err, token) {
          if (!err) {
            tempToken = token
            Article.create({
              title: 'Article A',
              userId: user._id,
              content: 'My very first article!',
              comments: []
            })
              .then(function(article) {
                articleId = article._id
                Comment.create({
                  userId: userId,
                  message: 'a great article!'
                })
                  .then(comment => {
                    commentId = comment._id
                    Article.findByIdAndUpdate(
                      articleId,
                      {$push: {"comments": comment}},
                      {safe: true, upsert: true, new : true},
                      function(err, model) {
                        if(!err) {
                          done()
                        } else {
                          console.log(err)
                        }
                      }
                    )
                  })
                  .catch(err => {
                    console.log(err)
                  })
              })
              .catch(err => {
                console.log(err)
              })
          } else {
            console.log(err)
          }
        })
      })
      .catch(err => {
        console.log(err)
      })
  });
  
  afterEach(function(done) {
    User.remove({}, function (err) {
      Article.remove({}, function (err) {
        Comment.remove({}, function (err) {
          done()
        });
      });
    });
  });

  describe('GET | show all comments', function() {
    it('should return all the comments', function(done) {
      chai.request(app)
        .get('/comments')
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message')
          expect(res.body).to.have.property('data')
          expect(res.body.message).to.equal('find all comments success!')
          expect(res.body.data).to.be.a('array').with.lengthOf(1)
          done()
        })
    })
  })
  describe('POST | create a new comment for an article', function() {
    it('should return a success message and the newly created comment', function(done) {
      chai.request(app)
        .post('/comments')
        .set('token', tempToken)
        .send({
          message: 'superb!',
          articleId: articleId
        })
        .end(function(err, res) {
          expect(res).to.have.status(201)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message')
          expect(res.body).to.have.property('data')
          expect(res.body.data).to.have.property('message')
          expect(res.body.data).to.have.property('userId')
          expect(res.body.message).to.equal('comment created successfully!')
          expect(res.body.data.message).to.equal('superb!')
          done()
        })
    })
  })
  describe('DELETE | delete a user\'s comment on an article', function() {
    it('should return a success message', function(done) {
      chai.request(app)
        .delete('/comments')
        .set('token', tempToken)
        .send({
          id: commentId
        })
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message')
          expect(res.body.message).to.equal('comment deleted successfully')
          done()
        })
    })
  })
});