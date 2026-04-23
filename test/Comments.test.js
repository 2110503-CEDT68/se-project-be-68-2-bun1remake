jest.mock('../models/Comment');

const { getComments } = require('../controllers/Comments'); 
const Comment = require('../models/Comment');

describe('getComments Controller', () => {
  let req, res, next;

  //EACH RUN SETUP
  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

it('return comment with status 200 and comments data when search with hotelID', async () => {
  // Create a fake req and a fake res
  const req = { params: { hotelId: '123' } };
  const res = { 
    status: jest.fn().mockReturnThis(), 
    json: jest.fn().mockReturnThis() 
  };

  //sample comment
  const mockComments = [
  {
    _id: '507f1f77bcf86cd799439011',
    text: 'Amazing stay!',
    rating: 5,
    hotel: { name: 'Grand Bangkok', imgsrc: 'hotel.jpg' }, 
    user: { name: 'John Doe', email: 'john@example.com' }
  }
];

//query function
const mockQuery = {
  populate: jest.fn().mockResolvedValue(mockComments)
};

Comment.find.mockReturnValue(mockQuery);
const next = jest.fn();
 await getComments(req, res ,next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
  success: true,
  count: 1,
  data: mockComments
});
});

it('should return comment with status 200 and comments data without hotelID', async () => {
  // Create a fake req and a fake res
  const req = {params:{}};
  const res = { 
    status: jest.fn().mockReturnThis(), 
    json: jest.fn().mockReturnThis() 
  };

  //sample comment
  const mockComments = [{
    _id: '507f1f77bcf86cd799439011',
    text: 'Amazing stay!',
    rating: 5,
    hotel: { name: 'Grand Bangkok', imgsrc: 'hotel.jpg' }, 
    user: { name: 'John Doe', email: 'john123@example.com' }
  },{
    _id: '507f1f77bcf86cd799439012',
    text: 'Good',
    rating: 4,
    hotel: { name: 'Grand Sahara', imgsrc: 'hotel2.jpg' }, 
    user: { name: 'Jane Doe', email: 'jane123@example.com' }
  }]

  //query function
  const mockQuery = {
    populate: jest.fn().mockResolvedValue(mockComments)
  };

Comment.find.mockReturnValue(mockQuery);
const next = jest.fn();
 await getComments(req, res ,next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
  success: true,
  count: 2, 
  data: mockComments
});
});
});

//TODO: ADD more test la