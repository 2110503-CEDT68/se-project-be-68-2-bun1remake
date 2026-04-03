const Comment = require('../models/Commet')
const Hotel = require('../models/Hotel');
const User = require('../models/User');

exports.getComments = async(req,res,next) => {
    const reqQuery = { ...req.query };
}