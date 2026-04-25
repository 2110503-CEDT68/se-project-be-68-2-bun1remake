/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - telephone
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Name of user
 *         email:
 *           type: string
 *           description: Email of user
 *         telephone:
 *           type: string
 *           description: Telephone number of user
 *         password:
 *           type: string
 *           description: Password of user 
 *         role:
 *           type: string
 *           description: Role of user (admin or user), default is user
 *         isVerified:
 *           type: boolean
 *         defaultGuestsAdult:
 *           type: number
 *           description: Default adult guest count
 *         defaultGuestsChild:
 *           type: number
 *           description: Default child guest count 
 *       example:
 *         name: A
 *         email: A@gmail.com
 *         telephone: '0123456789'
 *         password: 
 *         role: user
 *      
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The authentication API
 */

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

 /**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Create a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Not provide all required fields'
 *       409:
 *         description: An account with this email already exists.
 *       502:
 *         description: Could not send OTP email right now.
 *       202:
 *         description: OTP sent to email
 *       500:
 *         description: Registration initiation failed.
 */
router.post('/register', register);
router.post('/register/initiate', registerInitiate);

/**
* @swagger
* /auth/login:
*   post:
*     summary: Log-in to the system
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties: 
*               email: 
*                   type: string
*               password: 
*                   type: string
*     responses:
*       201:
*         description: Log-in Successfully
*       401:
*         description: Invalid credentials
*       403:
*         description: Email not verfied
*       500:
*         description: Some server error
*/
router.post('/login', login);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP to complete registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified – account is now active, proceed to login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 verified:
 *                   type: boolean
 *                   example: true
 *                 signInReady:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Incorrect OTP or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: INVALID_OTP
 *                 message:
 *                   type: string
 *                   example: Incorrect OTP.
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     attemptsRemaining:
 *                       type: integer
 *                       example: 2
 *       404:
 *         description: No pending registration found for this email
 *       410:
 *         description: OTP expired – request a new code via /auth/resend-otp
 *       429:
 *         description: Too many incorrect attempts – request a new code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: OTP_ATTEMPTS_EXCEEDED
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     attemptsRemaining:
 *                       type: integer
 *                       example: 0
 *                     resendAvailableAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', verifyOtp);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP resent.
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     otpExpiresAt:
 *                       type: string
 *                       format: date-time
 *                     resendAvailableAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Email is required
 *       404:
 *         description: No pending registration found for this email
 *       409:
 *         description: Account is already verified
 *       429:
 *         description: Resend cooldown active – check resendAvailableAt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: OTP_RESEND_COOLDOWN
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     resendAvailableAt:
 *                       type: string
 *                       format: date-time
 *       502:
 *         description: Could not send OTP email right now
 *       500:
 *         description: Internal server error
 */
router.post('/resend-otp', resendOtp);

/**
 * @swagger
 * /auth/me:
 *   patch:
 *     summary: Update profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             schema:
 *             type: object
 *             properties: 
 *               name: 
 *                 type: string
 *               defaultGuestsAdult: 
 *                 type: number
 *               defaultGuestsChild: 
 *                 type: number
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: Profile update failed.
 */
router.patch('/me', protect, updateMe);   

/**
* @swagger
* /auth/me:
*   get:
*     security:
*       - bearerAuth: []
*     summary: Return information about me
*     tags: [Auth]
*     responses:
*       201:
*         description: My user profile
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*       500:
*         description: Some server error
*/
router.get('/me', protect, getMe);

router.get('/logout', protect, logout);

router.put(
  '/users/:id/role',
  protect,
  authorize('admin'),
  updateUserRole
);

module.exports = router;
