const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  nights: {
    type: Number,
    required: [true, 'Please add number of nights'],
    min: [1, 'Nights must be at least 1'],
    max: [3, 'Nights can not be more than 3'] 
  },
  roomNumber: {
    type: String,
    required: [true, 'Please add a room number'],
    default: 'default',
    trim: true
  },
  overallPrice: {
    type: Number,
    required: [true, 'Please add the overall price'],
    default: 67,
    min: [0, 'Overall price must be at least 0']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },

                                                                   
  guestsAdult: {                                                                                                                                            
    type: Number,                                                                                                                                           
    required: [true, 'Please add adult guest count'],                                                                                                       
    default: 1,                                                                                                                                             
    min: [1, 'At least one adult guest is required']                                                                                                        
  },  
                                                                                                                                                        
  guestsChild: {                                                                                                                                            
    type: Number,                                                                                                                                           
    required: [true, 'Please add child guest count'],                                                                                                       
    default: 0,                                                                                                                                             
    min: [0, 'Child guest count cannot be negative']                                                                                                        
  },
             
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
