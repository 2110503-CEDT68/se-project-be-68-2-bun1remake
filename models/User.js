const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },
                                                                                           
  telephone: {                                                                           
    type: String,                                                                        
    required: true                                                                       
  },                                                                                     

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  isVerified: {
    type: Boolean,
    default: true
  },

  defaultGuestsAdult: {                                                                                                                                     
    type: Number,                                                                                                                                           
    default: 1,                                                                                                                                             
    min: [1, 'At least one adult guest is required']                                                                                                        
  }, 
                                                                                                                                                         
  defaultGuestsChild: {                                                                                                                                     
    type: Number,                                                                                                                                           
    default: 0,                                                                                                                                             
    min: [0, 'Child guest count cannot be negative']                                                                                                        
  },                                                                                                                                                        
          

  // 🔥 เก็บ token ล่าสุด (ซ่อนจาก response)
  currentToken: {
    type: String,
    select: false,
    default: null
  },

  otpCodeHash: {
    type: String,
    select: false,
    default: null
  },

  otpExpiresAt: {
    type: Date,
    select: false,
    default: null
  },

  otpResendAvailableAt: {
    type: Date,
    select: false,
    default: null
  },

  otpAttemptCount: {
    type: Number,
    select: false,
    default: 0
  },

  otpVerifiedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});


/* ===============================
   HASH PASSWORD (NO next())
=============================== */
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


/* ===============================
   SIGN JWT
=============================== */
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};


/* ===============================
   MATCH PASSWORD
=============================== */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);
