const express = require('express');
const {
  register,
  registerInitiate,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  updateMe,  
  logout,
  updateUserRole
} = require('../controllers/Auth');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.post('/register', register);
router.post('/register/initiate', registerInitiate);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.patch('/me', protect, updateMe);   
router.get('/me', protect, getMe);

router.get('/logout', protect, logout);

router.put(
  '/users/:id/role',
  protect,
  authorize('admin'),
  updateUserRole
);

module.exports = router;
