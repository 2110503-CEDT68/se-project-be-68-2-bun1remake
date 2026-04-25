/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - startDate
 *         - nights
 *         - roomNumber
 *         - overallPrice
 *         - user
 *         - hotel
 *         - guestAdult
 *         - guestChild
 *       properties:
 *         startDate:
 *           type: string
 *           format: date
 *           description: Booking Start Date
 *         nights:
 *           type: number
 *           description: Number of nights (1-3)
 *         roomNumber:
 *           type: string
 *         overallPrice:
 *           type: number
 *           description: Overall price
 *         user:
 *           type: string
 *           description: ID of the user who made the booking
 *         hotel:
 *           type: string
 *           description: ID of the hotel being booked
 *       example:
 *         startDate: "2026-05-15"
 *         nights: 1
 *         roomNumber: "A01"
 *         overallPrice: 67
 *         user: 69bf6e712a233d444785d245
 *         hotel: 69bf6e712a233d444785d245
 */

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: The bookings managing API
 */

const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookings');

const { protect, authorize } = require('../middleware/auth');

// IMPORTANT: need mergeParams to access req.params.hotelId when nested under /hotels/:hotelId/bookings
const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     description: >
 *       Returns bookings based on role.
 *       Regular users receive only their own bookings.
 *       Admins receive all bookings across all hotels.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Cannot find Bookings
 *
 * /hotels/{hotelId}/bookings:
 *   get:
 *     summary: Get all bookings for a specific hotel (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *         example: 64a1f2c3e4b5d6f7a8b9c0d2
 *     responses:
 *       200:
 *         description: List of bookings for the hotel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – admin access required
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a booking for a hotel
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *         example: 64a1f2c3e4b5d6f7a8b9c0d2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - nights
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-15"
 *               nights:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 example: 2
 *               guestsAdult:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 2
 *               guestsChild:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 example: 1
 *     responses:
 *       200:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: >
 *           Bad request. Possible causes: nights > 3, guestsAdult < 1,
 *           guestsChild < 0, hotel has no price set, or validation error.
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Internal server error
 */
router
  .route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *         example: 64a1f2c3e4b5d6f7a8b9c0d3
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     description: >
 *       Only the booking owner or an admin may update a booking.
 *       Maximum 3 nights. overallPrice is recalculated automatically.
 *       A "Booking Updated" email is sent to the owner on success.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *         example: 64a1f2c3e4b5d6f7a8b9c0d3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-20"
 *               nights:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 example: 3
 *               guestsAdult:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               guestsChild:
 *                 type: integer
 *                 minimum: 0
 *                 example: 0
 *               hotel:
 *                 type: string
 *                 description: Hotel ID (if changing hotel)
 *                 example: 64a1f2c3e4b5d6f7a8b9c0d2
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: >
 *           Bad request. Possible causes: nights > 3, guestsAdult < 1,
 *           guestsChild < 0, or hotel has no price set.
 *       401:
 *         description: Unauthorized – missing or invalid token, or not the booking owner
 *       404:
 *         description: Booking or hotel not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete (cancel) a booking
 *     tags: [Bookings]
 *     description: >
 *       Only the booking owner or an admin may delete a booking.
 *       A "Booking Cancellation" email is sent to the owner before deletion.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *         example: 64a1f2c3e4b5d6f7a8b9c0d3
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Unauthorized – missing or invalid token, or not the booking owner
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

module.exports = router;