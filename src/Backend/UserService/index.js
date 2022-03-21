const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const https = require('https')
const fs = require('fs')
const path = require('path')
const Certificates = require('./models/certificationModel')
// Load .env
dotenv.config()

// Initialize express const
const app = express()
app.use(cors())

// Connect to DB
const db = "mongodb+srv://admin:OrgjZ61qqQ0JuKZh@cluster0.kj7xb.mongodb.net/checkersdb?retryWrites=true&w=majority"
mongoose.connect(db, {useNewUrlParser: true, 
                    useUnifiedTopology: true})

const connection = mongoose.connection
connection.on("error", console.error.bind(console, "connection error: ")); 
connection.once("open", function () {console.log("Connected successfully to MongoDB");});

// Body Parser
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: true}));

// Routes
app.use("/", require("./routes/index.js"))

;(async () => {
    const PORT = process.env.PORT
    const certificate = await Certificates.findOne({name:"CA"},'value')
    const opts = {
        key: fs.readFileSync(path.join(__dirname, path.sep+"cert"+path.sep+"user_key.pem")),
        cert: fs.readFileSync(path.join(__dirname, path.sep+"cert"+path.sep+"user_cert.pem")),
        requestCert: true,
        rejectUnauthorized: false, // so we can do own error handling
        ca: certificate.value
    };
    
    https.createServer(opts,app).listen(PORT, function () {
        console.log('UserService started on port ' + PORT)
    })
})()
