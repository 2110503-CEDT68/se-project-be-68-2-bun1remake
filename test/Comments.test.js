jest.mock('../models/Comment');

const { getComments,createComment } = require('../controllers/Comments'); 
const Hotel = require('../models/Hotel')
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

it('Query comment WITH HotelID (return 200:success)', async () => {
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

it('Query comment without HotelID (return 200: Success)', async () => {
  // Create a fake req and a fake res
  const req = {params: {}};
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

it('Return comment with status 500 (500: Server Error) ', async () => {
  // Create a fake req and a fake res
  const req = {params: {}};
  const res = { 
    status: jest.fn().mockReturnThis(), 
    json: jest.fn().mockReturnThis() 
  };
  
  //sample error
  const mockError = new Error('Database Connect Failed')

  //query function
  const mockQuery = {
    populate: jest.fn().mockRejectedValue(mockError)
  };

  Comment.find.mockReturnValue(mockQuery);

  const next = jest.fn();
  await getComments(req, res ,next);
  
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
  message : "Server Error",
  success: false
  });
});
});

describe('createComment Controller', () => {
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

it('Create new comment (201: Created)' ,async ( )=> {

    //sample hotel
    const mockHotelId = '507f1f77bcf86cd799439011';

    //sample comments
    const mockComment = 
    {
      text : "เป็นความผิดของ Gemini,Claude,ChatGPT,Deepseek,Grok,Larma,Kimi,Qwen,Mimo,Ling,MiniMax,GLM,Composer,Cursor, และ Copilot ",
      rating : 2,
      hotel: mockHotelId, 
    };

   Hotel.findOne = jest.fn().mockResolvedValue({ _id: mockHotelId });

   req.body = mockComment;
     req.params = { hotelId: '507f1f77bcf86cd799439011' };
     req.user = { id: '507f1f77bcf86cd799432341' };
    

    Comment.create = jest.fn().mockResolvedValue({
    _id: '507f1f77bcf86cd799439233',
    ...mockComment,
    user: '507f1f77bcf86cd799432341'
  });

    const next = jest.fn();
    await createComment(req, res ,next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
    success : true,
    data: expect.objectContaining(mockComment)
  });
});


  it('Create new comment but hotelId is invalid (404: Hotel not found)' ,async ( )=> {

    //sample hotel
    const mockHotelId = null;

    //sample comments
    const mockComment = 
  {
    text : "เป็นความผิดของ Gemini,Claude,ChatGPT,Deepseek,Grok,Larma,Kimi,Qwen,Mimo,Ling,MiniMax,GLM,Composer,Cursor, และ Copilot ",
    rating : 2,
    hotel: mockHotelId, 
  };

  Hotel.findOne = jest.fn().mockResolvedValue(mockHotelId);

  req.body = mockComment;
    req.params = { hotelId: '507f1f77bcf86cd799439011' };
    req.user = { id: '507f1f77bcf86cd799432341' };

    const next = jest.fn();
    await createComment(req, res ,next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Hotel not found'
    });
  });
});
//TODO: ADD more test la