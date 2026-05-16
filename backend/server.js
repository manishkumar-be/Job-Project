const express=require('express');
const app= express();
const mongoose=require('mongoose');

const cors = require('cors');

app.use(cors());

// Middleware to parse JSON
app.use(express.json());
app.use(express.static(require('path').join(__dirname, '../frontend')));

mongoose.connect("mongodb://localhost:27017/Job").then((result)=>{
    console.log("db is connected");
}).catch((err)=>{
    console.log("Error", err)
})
  n 
// Define User Schema and Model
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.post('/login',(req, res)=>{
    console.log("hiii");
    res.end("success")
})

app.listen(8080, ()=>{
    console.log("Server is running fine on port 8080");
})