const Tour = require('../Models/TourModels');
const User = require('../Models/userModels');
const { catchAsync } = require('../Utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../Utils/apperror');
const Booking = require('../Models/bookingModel');
const handlerFactory = require('./handlerFactory');

exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: `${req.protocol}://${req.get('host')}/me`,

    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,

    line_items: [
      {
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'Success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //This is a temporary fix, this is insecure, we fix it in production
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  // customer_email, client_reference_id
  const user = (await User.findOne({ email: session.customer_email })).id;
  const tour = session.client_reference_id;
  const price = session.line_items[0].price_data.unit_amount;

  await Booking.create({ user, tour, price });
};

exports.webhookCheckout = (req, res, next) => {
  console.log('hollla');
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook error: ${err.message}`);
  }

  console.log(event);
  if (event.type === 'checkout.session.complete') createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.myBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const toursIds = bookings.map((el) => el.tour);
  const bookedTours = await Tour.find({ _id: { $in: toursIds } });
  res.status(200).render('overview', {
    title: 'My Bookings',
    tours: bookedTours,
  });
});

// exports.createBooking = handlerFactory.createOne(Booking);
exports.getAllBookings = handlerFactory.readAll(Booking);
exports.getOneBooking = handlerFactory.readOne(Booking, false);
exports.updateBooking = handlerFactory.updateOne(Booking);
exports.deleteBooking = handlerFactory.deleteOne(Booking);
