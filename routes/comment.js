/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - user
 *         - hotel
 *         - rating
 *       properties:
 *         user:
 *           type: string
 *           description: ID of the user who made the comment
 *         hotel:
 *           type: string
 *           description: ID of the hotel being commented 
 *         text:
 *           type: string
 *         rating:
 *           type: number
 *       example:
 *         user: 69bf6e712a233d444785d245
 *         hotel: 69bf6e712a233d444785d245
 *         text: Comment
 *         rating: 5
 */

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The comments managing API
 */

const express = require('express');
const {
  getComments,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/Comments');

const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /hotels/{hotelId}/comments:
 *   get:
 *     summary: Returns the list of all the comments in hotelID
 *     tags: [Comments]
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
 *         description: The list of the comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server Error 
 *   post:
 *     summary: Create a comment for a hotel
 *     tags: [Comments]
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
 *               - rating
 *             properties:
 *               text:
 *                 type: string
 *                 example: Great hotel!
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Internal server error
 */
router
  .route('/')
  .get(getComments)
  .post(protect, createComment);

/**
 * @swagger
 * /hotels/{hotelId}/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *         example: 64a1f2c3e4b5d6f7a8b9c0d5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Updated comment text
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 3
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *         example: 64a1f2c3e4b5d6f7a8b9c0d5
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router
  .route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;