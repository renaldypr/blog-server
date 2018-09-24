const router = require('express').Router();
const { showAll, create, erase } = require('../controllers/commentController');
const { auth } = require('../middlewares/auth');

router.get('/', showAll);
router.post('/', auth, create);
router.delete('/', auth, erase)

module.exports = router;