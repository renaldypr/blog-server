const router = require('express').Router();

router.get('/', (req,res) => {
  res.send('Welcome to the blog website!')
})

module.exports = router;