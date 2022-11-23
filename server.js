const dotenv = require('dotenv');

const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('UNCAUGHT EXCEPTION! 💥 SHUTTING DOWN...');
});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    autoIndex: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });
// .catch((err) => console.log('😡👿', err));

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`This app is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('UNHANDLED REJECTION! 💥 SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
