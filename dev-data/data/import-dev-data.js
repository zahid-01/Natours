const fs = require('fs');

const dotenv = require('dotenv');

const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const Tour = require('../../Models/TourModels');
const User = require('../../Models/userModels');
const Review = require('../../Models/reviewsModel');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => console.log('😡👿', err));

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//Import tours
const importTours = async function () {
  try {
    // await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);
    console.log('Data imported successfully');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

//Delete all tours from db
const deleteTours = async function () {
  try {
    // await Tour.deleteMany();
    await User.deleteMany();
    // await Review.deleteMany();
    console.log('All of the data deleted');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

if (process.argv[2] === '--import') importTours();
if (process.argv[2] === '--delete') deleteTours();
