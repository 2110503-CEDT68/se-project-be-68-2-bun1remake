const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    commentDate:{
        type : Date,
        required : [true,'Date is missing']
    },
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    hotelId:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'Hotel',
        required: true
    },
    comment:{
        type: String,
        default: 'Comment Placeholder'
    },
    rating:{
        type: Number,
        required: [true,'Please add rating'],
        min: 0,
        max: 5
    }
});

module.exports = mongoose.model('Comment',CommentSchema);