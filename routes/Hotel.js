/**
 * @swagger
 * components:
 *   schemas:
 *     Hotel:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - imgSrc
 *         - address
 *         - district
 *         - province
 *         - postalcode
 *         - region
 *         - accommodationType
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the hotel
 *         name:
 *           type: string
 *           description: Hotel name
 *         description:
 *           type: string
 *           description: Description
 *         price:
 *           type: number
 *           description: Price per night
 *         review:
 *           type: number
 *           description: A review score ranging from 0 to 5.
 *         imgSrc:
 *           type: string
 *           description: The source path for the hotel's display photo.
 *         address:
 *           type: string
 *           description: House No., Street, Road
 *         district:
 *           type: string
 *           description: District
 *         province:
 *           type: string
 *           description: Province
 *         postalcode:
 *           type: string
 *           description: 5-digit postal code
 *         tel:
 *           type: string
 *           description: telephone number
 *         region:
 *           type: string
 *           description: Region
 *         accommodationType:
 *           type: string
 *           description: The category of the lodging (e.g., Hotel or Resort). Defaults to "Hotel" if not specified.
 *         specializations:
 *           type: object
 *           description:
 *           properties:
 *             location:
 *               type: array
 *               items:
 *                 type: string
 *               default: []
 *               description: A list of geographic areas, nearby landmarks, or neighborhood tags.
 *             facility:
 *               type: array
 *               items:
 *                 type: string
 *               default: []
 *               description: A collection of available on-site amenities such as "Pool", "Gym", or "Spa".
 *             accessibility:
 *               type: array
 *               items:
 *                 type: string
 *               default: []
 *               description: Specific features provided for guest accessibility, such as "Blind" ,"Deaf ,"Mobility".
 *       example:
 *         name: Amanpuri Phuket
 *         description: An exclusive beach resort offering unparalleled privacy and luxury.
 *         price: 32000
 *         review: 4.7
 *         imgSrc:
 *         address: 118 Moo 3
 *         district: Thalang
 *         province: Phuket
 *         postalcode: 83110
 *         tel: 02-2187000
 *         region: South
 *         accommodationType: Hotel
 *         specializations:
 *         
 */

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: The hotels managing API
 */

const express = require('express');
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/Hotels');

const { protect, authorize } = require('../middleware/auth');

const bookingRouter = require('./bookings');
const commentRouter = require('./comment');

const router = express.Router();

router.use('/:hotelId/bookings', bookingRouter);
router.use('/:hotelId/comments', commentRouter);

/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Returns the list of all the hotels
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: The list of the hotels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 *       500:
 *         description: Server Error 
  *   post:
 *     summary: Create a new hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hotel'
 *     responses:
 *       201:
 *         description: The hotel was successfully created
 *         content:
 *           application/json:
 *             schema:
 *             $ref: '#/components/schemas/Hotel'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /hotels/{id}:
 *   get:
 *     summary: Get a single hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       404:
 *         description: Hotel not found
 *   put:
 *     summary: Update a hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hotel'
 *     responses:
 *       200:
 *         description: Hotel updated
 *       404:
 *         description: Hotel not found
 *   delete:
 *     summary: Delete a hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hotel deleted
 *       404:
 *         description: Hotel not found
 */

router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('admin'), createHotel);

router
  .route('/:id')
  .get(getHotel)
  .put(protect, authorize('admin'), updateHotel)
  .delete(protect, authorize('admin'), deleteHotel);

module.exports = router;