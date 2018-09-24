const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
  showAll: function(req,res) {
    User.find((err, users) => {
      if(!err) {
        res.status(200).json({
          message: 'find all user success!',
          data: users
        })
      } else {
        res.status(500).json({
          message: err
        })
      }
    });
  },
  create: function(req,res) {
    User.create({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email
    })
      .then(user => {
        res.status(201).json({
          message: 'user created successfully!',
          data: user
        })
      })
      .catch(err => {
        res.status(500).json({
          message: err
        })
      })
  },
  erase: function(req,res) {
    User.deleteOne({ _id: req.decoded.id }, function (err, data) {
      if(!err) {
        res.status(200).json({
          message: 'user deleted successfully'
        })
      } else {
        res.status(500).json({
          message: err
        })
      }
    });
  },
  edit: function(req,res) {
    User.findOne({ _id: req.decoded.id }, function(err,user) {
      if(!err) {
        if(user) {
          user.name = req.body.name
          user.password = req.body.password
          user.save()
          res.status(200).json({
            message: 'user edited successfully!',
            data: user.name
          })
        } else {
          res.status(404).json({
            message:'user not found!'
          })
        }
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  login: function(req,res) {
    User.find({ email: req.body.email }, function (err, user) {
      if (!err) {
        if (user.length !== 0) {
          if (bcrypt.compareSync(req.body.password, user[0].password)) {
            jwt.sign({id: user[0]._id, name: user[0].name, email:user[0].email}, process.env.JWT_KEY, function(err, token) {
              if (!err) {
                res.status(200).json({
                  user: user[0].name,
                  email: user[0].email,
                  token: token
                })
              } else {
                res.status(500).json({
                  message: 'jwt.sign error'
                })
              }
            });
          } else {
            res.status(500).json({
              message: 'wrong password!'
            })
          }   
        } else {
          res.status(500).json({
            message: 'you have not registered!'
          })
        }
      } else {
        res.status(500).json({
          message: err
        })
      }
    });
  }
}