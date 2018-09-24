process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('User', function() {
  var tempToken = ''

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
            done()
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
      done()
    });
  });

  describe('GET | show all users', function() {
    it('should return all the users', function(done) {
      chai.request(app)
        .get('/users')
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body.data).to.be.a('array').with.lengthOf(1)
          done()
        })
    })
  })
  describe('POST | create a user', function() {
    it('should return the created user', function(done) {
      chai.request(app)
        .post('/users')
        .type('form')
        .send({
          name: 'Renaldy',
          password: '54321',
          email: 'renaldy@mail.com'
        })
        .end(function(err, res) {
          expect(res).to.have.status(201)
          expect(res.body.data).to.be.a('object')
          expect(res.body.data).to.have.property('email').with.lengthOf(16)
          expect(res.body.data).to.have.property('password')
          expect(res.body.data.name).to.equal('Renaldy')
          done()
        })
    })
  })
  describe('POST | login feature', function() {
    it('should return an object with token, user name, and user email', function(done) {
      chai.request(app)
        .post('/users/login')
        .type('form')
        .send({
          email: 'admin@mail.com',
          password: '12345'
        })
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('email').with.lengthOf(14)
          expect(res.body).to.have.property('token')
          expect(res.body.user).to.equal('admin')
          done()
        })
    })
  })
  describe('DELETE | delete own user while logged in', function() {
    it('should return a success message', function(done) {
      chai.request(app)
        .delete('/users')
        .set('token', tempToken)
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message')
          expect(res.body.message).to.equal('user deleted successfully')
          done()
        })
    })
  })
  describe('PATCH | edit logged user data', function() {
    it('should return a success message and the user\'s new data', function(done) {
      chai.request(app)
        .patch('/users')
        .set('token', tempToken)
        .type('form')
        .send({
          name: 'nimda',
          password: '12345'
        })
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message')
          expect(res.body).to.have.property('data')
          expect(res.body.message).to.equal('user edited successfully!')
          expect(res.body.data).to.equal('nimda')
          done()
        })
    })
  })
});