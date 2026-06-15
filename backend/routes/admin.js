const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getStats,
  getUsers,
  updateUserRole,
  getAllOrders,
  updateOrderStatus,
  broadcastMessage,
} = require('../controllers/adminController');

// Barcha admin yo'llar himoyalangan
router.use(auth, admin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/broadcast', broadcastMessage);

module.exports = router;
