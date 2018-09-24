process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');
const Article = require('../models/article');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('Article', function() {
  var tempToken = ''
  var articleId = ''

  beforeEach(function(done) {
    User.create({
      name: 'admin',
      password: '12345',
      email: 'admin@mail.com'
    })
      .then(function(user) {
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
                done()
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
        done()
      });
    });
  });

  describe('GET | show all articles', function() {
    it('should return all the articles', function(done) {
      chai.request(app)
        .get('/articles')
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body.data).to.be.a('array').with.lengthOf(1)
          done()
        })
    })
  })
  describe('POST | create a new article while logged in', function() {
    it('should return a success message and the newly created article', function(done) {
      chai.request(app)
        .post('/articles')
        .set('token', tempToken)
        .send({
          title: 'Article B',
          content: 'My second article!',
        })
        .end(function(err, res) {
          expect(res).to.have.status(201)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message')
          expect(res.body).to.have.property('data')
          expect(res.body.data).to.have.property('title')
          expect(res.body.message).to.equal('article created successfully!')
          expect(res.body.data.title).to.equal('Article B')
          done()
        })
    })
  })
  describe('DELETE | delete a user\'s own article', function() {
    it('should return a success message', function(done) {
      chai.request(app)
        .delete('/articles')
        .set('token', tempToken)
        .send({
          id: articleId
        })
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message')
          expect(res.body.message).to.equal('article deleted successfully')
          done()
        })
    })
  })
  describe('PATCH | edit a user\'s own article', function() {
    it('should return a success message and the article\'s new data', function(done) {
      chai.request(app)
        .patch('/articles')
        .set('token', tempToken)
        .send({
          title: 'Article A edited!',
          content: 'Someone edited my article!',
          id: articleId
        })
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message')
          expect(res.body).to.have.property('data')
          expect(res.body.data).to.have.property('title')
          expect(res.body.data).to.have.property('content')
          expect(res.body.message).to.equal('article edited successfully!')
          expect(res.body.data.title).to.equal('Article A edited!')
          expect(res.body.data.content).to.equal('Someone edited my article!')
          done()
        })
    })
  })
});