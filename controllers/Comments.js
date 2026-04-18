const Comment = require('../models/Comment');
const Hotel = require('../models/Hotel');

// @desc    Get all comments for a hotel (with average rating)
// @route   GET /api/v1/hotels/:hotelId/comments
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel not found with id ${req.params.hotelId}`
      });
    }

    const comments = await Comment.find({ hotelId: req.params.hotelId })
      .populate({ path: 'userId', select: 'name' });

    const averageRating =
      comments.length > 0
        ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
        : null;

    res.status(200).json({
      success: true,
      count: comments.length,
      averageRating: averageRating !== null ? parseFloat(averageRating.toFixed(2)) : null,
      data: comments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Cannot fetch comments' });
  }
};

// @desc    Create comment/rating for a hotel
// @route   POST /api/v1/hotels/:hotelId/comments
// @access  Private (user, admin)
exports.createComment = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel not found with id ${req.params.hotelId}`
      });
    }

    const comment = await Comment.create({
      commentDate: new Date(),
      userId: req.user.id,
      hotelId: req.params.hotelId,
      comment: req.body.comment,
      rating: req.body.rating
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(v => v.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Cannot create comment' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Private — admin can delete any; user can only delete their own
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: `Comment not found with id ${req.params.id}`
      });
    }

    if (req.user.role === 'admin') {
      await comment.deleteOne();
      return res.status(200).json({ success: true, data: {} });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Cannot delete comment' });
  }
};
