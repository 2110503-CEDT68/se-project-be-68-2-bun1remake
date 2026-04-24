jest.mock('../models/Comment');

const { getComments,createComment,deleteComment } = require('../controllers/Comments'); 
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

  //sample comment
  const mockComments = [
  {
    id: '507f1f77bcf86cd799439011',
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
 await getComments(req, res ,next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
  success: true,
  count: 1,
  data: mockComments
});
});

it('Query comment without HotelID (return 200: Success)', async () => {
  //create a fake req and a fake res

  //sample comment
  const mockComments = [{
    id: '507f1f77bcf86cd799439011',
    text: 'Amazing stay!',
    rating: 5,
    hotel: { name: 'Grand Bangkok', imgsrc: 'hotel.jpg' }, 
    user: { name: 'John Doe', email: 'john123@example.com' }
  },{
    id: '507f1f77bcf86cd799439012',
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
 await getComments(req, res ,next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
  success: true,
  count: 2, 
  data: mockComments
  });
});

it('Return comment FAILED (500: Server Error) ', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  //sample error
  const mockError = new Error('Database Connect Failed')

  //query function
  const mockQuery = {
    populate: jest.fn().mockRejectedValue(mockError)
  };

  Comment.find.mockReturnValue(mockQuery);

  await getComments(req, res ,next);
  
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
  message : "Server Error",
  success: false
  });

  consoleSpy.mockRestore();
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

it('Create new comment successfully (201: Created)' ,async ( )=> {

    //sample hotel
    const mockHotelId = '507f1f77bcf86cd799439011';

    //sample comments
    const mockComment = 
    {
      text : "เป็นความผิดของ Gemini,Claude,ChatGPT,Deepseek,Grok,Larma,Kimi,Qwen,Mimo,Ling,MiniMax,GLM,Composer,Cursor, และ Copilot",
      rating : 2,
      hotel: mockHotelId, 
    };

   Hotel.findOne = jest.fn().mockResolvedValue({ id: mockHotelId });

   req.body = mockComment;
     req.params = { hotelId: '507f1f77bcf86cd799439011' };
     req.user = { id: '507f1f77bcf86cd799432341' };
    

    Comment.create = jest.fn().mockResolvedValue({
    id: '507f1f77bcf86cd799439233',
    ...mockComment,
    user: '507f1f77bcf86cd799432341'
  });

    await createComment(req, res ,next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
    success : true,
    data: expect.objectContaining(mockComment)
  });
});


  it('Create new comment but hotelId is NOT found (404: Not found)' ,async ( )=> {

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

    await createComment(req, res ,next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Hotel not found'
    });
  });

  it('Create new comment is INVALID (500: Could not create comment)' ,async ( )=> {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    //sample hotel
    const mockHotelId = '507f1f77bcf86cd799439011';

    //sample user
    const mockUserId = '507f1f77bcf86cd799432341';

    req.params = { hotelId: mockHotelId };
    req.user = { id: mockUserId }; 
    req.body = { text: "Test comment", rating: 5 };

    Hotel.findOne = jest.fn().mockResolvedValue(mockHotelId);

    Comment.create = jest.fn().mockRejectedValue(new Error('Database Connect Failed'));

    await createComment(req, res ,next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Could not create comment'
    });

    consoleSpy.mockRestore();
  });
});

describe('deleteComment Controller', () => {
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

it('Delete comment successfully in normal conditions (200: Success)' ,async ( )=> {

   //create a fake req
  const req = { params: { comment: '507f1f77bcf86cd799439011' } };

  const mockCommentId = '507f1f77bcf86cd799439011';
  const mockUserId = '507f1f77bcf86cd799432341';
  
  req.params = {id: mockCommentId }; 
  req.user = {id: mockUserId, role: 'user' };

  const mockCommentInstance = {
    id: mockCommentId,
    user: mockUserId,
    deleteOne: jest.fn().mockResolvedValue({})
  };

  Comment.findById = jest.fn().mockResolvedValue(mockCommentInstance);
   
  await deleteComment(req, res ,next);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    success : true,
    data: {}
    });
  });

  it('Delete comment FAILED when no comment found (404: Not found)' ,async ( )=> {

   //create a fake req
  const req = { params: { comment: '507f1f77bcf86cd799439011' } };

  //sample comment & user ID
  const mockCommentId = '507f1f77bcf86cd799439011';
  const mockUserId = '507f1f77bcf86cd799432341';
  
  req.params = {id: mockCommentId }; 
  req.user = {id: mockUserId, role: 'user' };

  const mockCommentInstance = null;

  Comment.findById = jest.fn().mockResolvedValue(mockCommentInstance);
   
  await deleteComment(req, res ,next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: `Comment not found with id ${req.params.id}`
    });
  });

  it('Delete comment successfully as admin (200: Success)' ,async ( )=> {

   // Create a fake req and a fake res
  const req = { params: { comment: '507f1f77bcf86cd799439011' } };
  const res = { 
    status: jest.fn().mockReturnThis( ), 
    json: jest.fn().mockReturnThis() 
  };

  //sample comment & user ID
  const mockCommentId = '507f1f77bcf86cd799439011';
  const mockUserId = '507f1f77bcf86cd799432341'; //mock user's ID
  
  req.params = {id: mockCommentId }; 
  req.user = {id: '9b1db3d9e833056f45a49528', role: 'admin' }; //admin's ID


  //mcok user's comment
  const mockCommentInstance = {
    id: mockCommentId,
    user: mockUserId,
    deleteOne: jest.fn().mockResolvedValue({})
  };

  Comment.findById = jest.fn().mockResolvedValue(mockCommentInstance);
   
  await deleteComment(req, res ,next);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    data : {}
    });
  });

  it('Delete comment FAILED when user tried to erase another user\'s comment (401: Unauthorized)' ,async ( )=> {

   // Create a fake req
  const req = { params: { comment: '507f1f77bcf86cd799439011' } };

  //sample comment & user ID
  const mockCommentId = '507f1f77bcf86cd799439011';
  const mockUserId = '507f1f77bcf86cd799432341'; //mock user's ID
  
  req.params = {id: mockCommentId }; 
  req.user = {id: '921cbc0f70cbe8168b6a3692', role: 'user' }; //another user's ID


  //mcok user's comment
  const mockCommentInstance = {
    id: mockCommentId,
    user: mockUserId,
    deleteOne: jest.fn().mockResolvedValue({})
  };

  Comment.findById = jest.fn().mockResolvedValue(mockCommentInstance);
   
  await deleteComment(req, res ,next);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: `NOt authorized to delete this comment`
    });
  });

  it('Delete comment is INVALID (400: Bad Request)' ,async ( )=> {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    //create sample req
    const req = { params: { comment: '507f1f77bcf86cd799439011' } };

    //sample comment & user ID
    const mockCommentId = '507f1f77bcf86cd799439011';
    const mockUserId = '507f1f77bcf86cd799432341'; //mock user's ID
  
    req.params = {id: mockCommentId }; 
    req.user = {id: mockUserId , role: 'user' };

    Comment.findById = jest.fn().mockRejectedValue(new Error('Database Connect Failed'));;
   
    await deleteComment(req, res ,next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    success: false,
    });

    consoleSpy.mockRestore();
  });
});
//TODO: ADD more test la