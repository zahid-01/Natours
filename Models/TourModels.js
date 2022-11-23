const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A name must be specified'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name length should be less than 40 characters'],
      minlength: [5, 'Min length is 5 characters'],
      // validate: [validator.isAlpha, 'Name must contain only alphabets'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A group size is must'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is: "easy", "medium", "difficult"',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Min ratings is 1'],
      max: [5, 'Max ratings is 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    retaingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: function (val) {
        return val < this.price;
      },
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Image is necessary'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        day: Number,
        description: String,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return (this.duration / 7).toFixed(3);
});

tourSchema.virtual('reviews', {
  ref: 'reviews',
  foreignField: 'tour',
  localField: '_id',
});

//Document Middelware: .save() pre hook
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guides = this.guides.map((id) => User.findById(id));
//   this.guides = await Promise.all(guides);
//   console.log(this.guides);
//   next();
// });

//Query Middelware: .find() pre hook
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.now = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  const time = Date.now() - this.now;
  console.log(time);
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

const Tour = mongoose.model('TOURS', tourSchema);

module.exports = Tour;
