const mongoose = require('mongoose');
const { mongoUri } = require('./index');

async function connectDB() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
    // Do not print the password inside the connection string
    console.log(`Connected to MongoDB at ${mongoUri.replace(/\/\/([^@/]+)@/, '//***@')}`);
}

module.exports = connectDB;
