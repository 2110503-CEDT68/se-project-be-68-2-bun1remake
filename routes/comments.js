// Standalone comments router — mounts at /api/v1/comments
// Hosts endpoints that don't require a hotelId (currently: DELETE /:id).
const express = require('express');
const { deleteComment } = require('../controllers/Comments');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/:id').delete(protect, deleteComment);

module.exports = router;
