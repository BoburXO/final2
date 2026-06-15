const router = require('express').Router();
const auth = require('../middleware/auth');
const { createOrder, getUserOrders, getOrder } = require('../controllers/orderController');

router.post('/', auth, createOrder);
router.get('/', auth, getUserOrders);
router.get('/:id', auth, getOrder);

module.exports = router;
