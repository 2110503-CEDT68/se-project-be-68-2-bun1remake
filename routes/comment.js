const express = require('express');
const {
  getComments,
  createComment,
  deleteComment
} = require('../controllers/Comments');

const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getComments)
  .post(protect, createComment);

router
  .route('/:id')
  .delete(protect, deleteComment);

module.exports = router;