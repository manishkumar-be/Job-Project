const mongoose = require('mongoose');
const { mongoUri } = require('./index');

async function connectDB() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);
}

module.exports = connectDB;
