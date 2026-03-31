const Booking = require('../models/booking');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const {
  EMAIL_THEME,
  buildEmailShell,
  buildEmailButton,
  buildEmailCard,
  buildEmailFooter,
  buildTableRow
} = require('../utils/emailTheme');

const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL ||
  'https://fe-project-68-bun1-return.vercel.app';
const hotelPopulateFields = 'name address tel description price imgSrc';

function sendNotificationEmail(...args) {
  void sendEmail(...args).catch((error) => {
    console.error('Booking notification email failed:', error.message);
  });
}

function getStartedAt() {
  return process.hrtime.bigint();
}

function timedJson(res, statusCode, payload, action, startedAt) {
  const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
  console.log(`[timing] ${action} ${statusCode} ${elapsedMs.toFixed(1)}ms`);
  return res.status(statusCode).json(payload);
}

function buildBookingConfirmationEmail(user, hotel, bookingPayload) {
  return buildEmailShell(
    'Booking Confirmed',
    `
      <p style="font-size: 16px; color: ${EMAIL_THEME.ink};">Dear <strong>${user.name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: ${EMAIL_THEME.inkSoft};">
        Your reservation has been successfully confirmed. We are delighted to welcome you.
      </p>
      ${buildEmailCard(`
        <h3 style="margin: 0 0 12px; color: ${EMAIL_THEME.primary};">Reservation Details</h3>
        <table style="width: 100%; font-size: 14px; color: ${EMAIL_THEME.ink}; border-collapse: collapse;">
          ${buildTableRow('Hotel:', hotel.name)}
          ${buildTableRow('Address:', hotel.address)}
          ${buildTableRow(
            'Check-in Date:',
            new Date(bookingPayload.startDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          )}
          ${buildTableRow(
            'Number of Nights:',
            `${bookingPayload.nights} night${bookingPayload.nights > 1 ? 's' : ''}`
          )}
          ${buildTableRow(
            'Guests:',
            `${bookingPayload.guestsAdult} adult(s), ${bookingPayload.guestsChild} child(ren)`,
            true
          )}
        </table>
      `)}
      <p style="font-size: 14px; line-height: 1.6; color: ${EMAIL_THEME.inkSoft};">
        A confirmation email with check-in instructions will be sent 24 hours before your arrival.
      </p>
      <p style="text-align: center; margin: 25px 0;">
        ${buildEmailButton('View Booking', `${FRONTEND_BASE_URL}/mybooking`)}
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: ${EMAIL_THEME.textMuted};">
        Thank you for choosing Hotel Booking. We look forward to providing you with an exceptional stay.
      </p>
      ${buildEmailFooter()}
    `
  );
}

function buildBookingUpdatedEmail(bookingOwner, updatedBooking) {
  const hotelName = updatedBooking.hotel ? ` at <strong>${updatedBooking.hotel.name}</strong>` : '';
  return buildEmailShell(
    'Booking Updated',
    `
      <p style="font-size: 16px; color: ${EMAIL_THEME.ink};">Hi <strong>${bookingOwner.name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: ${EMAIL_THEME.inkSoft};">
        Your reservation${hotelName} has been successfully updated.
      </p>
      ${buildEmailCard(`
        <h3 style="margin: 0 0 12px; color: ${EMAIL_THEME.primary};">Updated Details</h3>
        <table style="width: 100%; font-size: 14px; color: ${EMAIL_THEME.ink}; border-collapse: collapse;">
          ${buildTableRow(
            'Check-in Date:',
            new Date(updatedBooking.startDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          )}
          ${buildTableRow(
            'Number of Nights:',
            `${updatedBooking.nights} night${updatedBooking.nights > 1 ? 's' : ''}`
          )}
          ${buildTableRow(
            'Guests:',
            `${updatedBooking.guestsAdult} adult(s), ${updatedBooking.guestsChild} child(ren)`,
            true
          )}
        </table>
      `)}
      <p style="font-size: 13px; line-height: 1.6; color: ${EMAIL_THEME.textMuted};">
        If you did not make this change or have any questions, please contact our support team immediately.
      </p>
      <p style="text-align: center; margin: 25px 0;">
        ${buildEmailButton('View Booking', `${FRONTEND_BASE_URL}/mybooking`)}
      </p>
      ${buildEmailFooter('Questions?', 'Contact Support')}
    `
  );
}

function buildBookingCancelledEmail(user, populatedBooking) {
  const hotelName = populatedBooking.hotel
    ? ` at <strong>${populatedBooking.hotel.name}</strong>`
    : '';

  return buildEmailShell(
    'Booking Cancelled',
    `
      <p style="font-size: 16px; color: ${EMAIL_THEME.ink};">Hi <strong>${user.name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: ${EMAIL_THEME.inkSoft};">
        Your reservation${hotelName} has been cancelled.
      </p>
      ${buildEmailCard(`
        <p style="margin: 0; font-size: 13px; color: ${EMAIL_THEME.inkSoft};">
          <strong>Important:</strong> If you did not request this cancellation, please contact our support team immediately to secure your account.
        </p>
      `)}
      <p style="text-align: center; margin: 25px 0;">
        ${buildEmailButton('View My Bookings', `${FRONTEND_BASE_URL}/mybooking`)}
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: ${EMAIL_THEME.inkSoft};">
        We are sorry to see you go. If you would like to rebook, we offer flexible reservation options.
      </p>
      ${buildEmailFooter('Urgent?', 'Contact Support')}
    `
  );
}

exports.getBookings = async (req, res, next) => {
  let query;

  if (req.user.role !== 'admin') {
    query = Booking.find({ user: req.user.id }).populate({
      path: 'hotel',
      select: hotelPopulateFields
    });
  } else {
    if (req.params.hotelId) {
      query = Booking.find({ hotel: req.params.hotelId }).populate({
        path: 'hotel',
        select: hotelPopulateFields
      });
    } else {
      query = Booking.find().populate({
        path: 'hotel',
        select: hotelPopulateFields
      });
    }
  }

  try {
    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot find Bookings"
    });
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'hotel',
      select: hotelPopulateFields
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot find Booking"
    });
  }
};

exports.createBooking = async (req, res, next) => {
  const startedAt = getStartedAt();

  try {
    req.body.hotel = req.params.hotelId;

    const hotel = await Hotel.findById(req.params.hotelId);

    if (!hotel) {
      return timedJson(res, 404, {
        success: false,
        message: `No hotel with id ${req.params.hotelId}`
      }, 'api.bookings.create', startedAt);
    }

    req.body.user = req.user.id;

                                                                                        
    const guestsAdult = Number(req.body.guestsAdult ?? 1);                             
    const guestsChild = Number(req.body.guestsChild ?? 0);                             
                                                                                        
    if (!Number.isFinite(guestsAdult) || guestsAdult < 1) {                            
      return timedJson(res, 400, {                                                    
        success: false,                                                                
        message: 'At least one adult guest is required'                                
      }, 'api.bookings.create', startedAt);                                                                              
    }                                                                                  
                                                                                        
    if (!Number.isFinite(guestsChild) || guestsChild < 0) {                            
      return timedJson(res, 400, {                                                    
        success: false,                                                                
        message: 'Child guest count cannot be negative'                                
      }, 'api.bookings.create', startedAt);                                                                              
    }                                                                                  
                                                                                        
    req.body.guestsAdult = guestsAdult;                                                
    req.body.guestsChild = guestsChild;                                                
          

    if (req.body.nights > 3) {
      return timedJson(res, 400, {
        success: false,
        message: 'Booking up to 3 nights only'
      }, 'api.bookings.create', startedAt);
    }

    if (hotel.price == null) {
      return timedJson(res, 400, {
        success: false,
        message: 'This hotel does not have a price set'
      }, 'api.bookings.create', startedAt);
    }

    req.body.overallPrice = hotel.price * req.body.nights;

    const booking = await Booking.create(req.body);

    
    const user = await User.findById(req.user.id);
    if (user) {
        user.defaultGuestsAdult = req.body.guestsAdult;                                  
        user.defaultGuestsChild = req.body.guestsChild;                                  
        await user.save({ validateBeforeSave: false });                                  
        
        sendNotificationEmail(                                                                 
          user.email,                                                                    
          'Booking Confirmed - Your Reservation is Secure',                              
          buildBookingConfirmationEmail(user, hotel, req.body)
        );                                                                               
      }       

    return timedJson(res, 200, {
      success: true,
      data: booking
    }, 'api.bookings.create', startedAt);

  } catch (error) {
    console.log(error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return timedJson(res, 400, {
        success: false,
        message: messages.join(', ')
      }, 'api.bookings.create', startedAt);
    }

    return timedJson(res, 500, {
      success: false,
      message: "Cannot create Booking"
    }, 'api.bookings.create', startedAt);
  }
};

exports.updateBooking = async (req, res, next) => {
  const startedAt = getStartedAt();

  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return timedJson(res, 404, {
        success: false,
        message: `No booking with id ${req.params.id}`
      }, 'api.bookings.update', startedAt);
    }

    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return timedJson(res, 401, {
        success: false,
        message: `User ${req.user.id} not authorized`
      }, 'api.bookings.update', startedAt);
    }

    const nextGuestsAdult =                                                                
    req.body.guestsAdult != null ? Number(req.body.guestsAdult) : (booking.guestsAdult ??
  1);                                                                                    
  const nextGuestsChild =                                                                
    req.body.guestsChild != null ? Number(req.body.guestsChild) : (booking.guestsChild ??
  0);                                                                      
                                                                                        
    if (!Number.isFinite(nextGuestsAdult) || nextGuestsAdult < 1) {                    
      return timedJson(res, 400, {                                                    
        success: false,                                                                
        message: 'At least one adult guest is required'                                
      }, 'api.bookings.update', startedAt);                                                                              
    }                                                                                  
                                                                                        
    if (!Number.isFinite(nextGuestsChild) || nextGuestsChild < 0) {                    
      return timedJson(res, 400, {                                                    
        success: false,                                                                
        message: 'Child guest count cannot be negative'                                
      }, 'api.bookings.update', startedAt);                                                                              
    }                                                                                  
                                                                                        
    req.body.guestsAdult = nextGuestsAdult;                                            
    req.body.guestsChild = nextGuestsChild;                                            
            

    const hotelId = req.body.hotel ?? booking.hotel;
    const nights = req.body.nights ?? booking.nights;
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return timedJson(res, 404, {
        success: false,
        message: `No hotel with id ${hotelId}`
      }, 'api.bookings.update', startedAt);
    }

    if (nights > 3) {
      return timedJson(res, 400, {
        success: false,
        message: 'Booking up to 3 nights only'
      }, 'api.bookings.update', startedAt);
    }

    if (hotel.price == null) {
      return timedJson(res, 400, {
        success: false,
        message: 'This hotel does not have a price set'
      }, 'api.bookings.update', startedAt);
    }

    req.body.overallPrice = hotel.price * nights;

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const updatedBooking = await Booking.findById(req.params.id).populate('hotel');    
    const bookingOwner = await User.findById(booking.user);                            
                                                                                        
    if (bookingOwner && updatedBooking) {                                              
      bookingOwner.defaultGuestsAdult = updatedBooking.guestsAdult;                    
      bookingOwner.defaultGuestsChild = updatedBooking.guestsChild;                    
      await bookingOwner.save({ validateBeforeSave: false });                          
                    
      sendNotificationEmail(                                                                 
          bookingOwner.email,                                                            
          'Booking Updated Successfully',                                                
          buildBookingUpdatedEmail(bookingOwner, updatedBooking)
        );                                                                               
      }        

    return timedJson(res, 200, {
      success: true,
      data: booking
    }, 'api.bookings.update', startedAt);

  } catch (error) {
    console.log(error);
    return timedJson(res, 500, {
      success: false,
      message: "Cannot update Booking"
    }, 'api.bookings.update', startedAt);
  }
};
exports.deleteBooking = async (req, res, next) => {
  const startedAt = getStartedAt();

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return timedJson(res, 404, {
        success: false,
        message: `No booking with id ${req.params.id}`
      }, 'api.bookings.delete', startedAt);
    }

    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return timedJson(res, 401, {
        success: false,
        message: `User ${req.user.id} not authorized`
      }, 'api.bookings.delete', startedAt);
    }

    // Send booking cancellation email before deleting
    const populatedBooking = await Booking.findById(req.params.id).populate('hotel');
    const user = await User.findById(booking.user);      
    if (user && populatedBooking) {
      sendNotificationEmail(                                                                 
          user.email,                                                                    
          'Booking Cancellation Confirmation',                                           
          buildBookingCancelledEmail(user, populatedBooking)
        );                                                                               
      }     

    await booking.deleteOne();

    return timedJson(res, 200, {
      success: true,
      data: {}
    }, 'api.bookings.delete', startedAt);

  } catch (error) {
    console.log(error);
    return timedJson(res, 500, {
      success: false,
      message: "Cannot delete Booking"
    }, 'api.bookings.delete', startedAt);
  }
};
