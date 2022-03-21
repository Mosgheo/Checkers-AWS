const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const Certificates = require('./models/certificationModel')
const fs = require('fs')
const path = require('path')
const https = require('https')
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
app.use(express.json());
// Routes
app.use("/", require("./routes/index"))

;(async () => {
    const PORT = process.env.PORT
    const certificate = await Certificates.findOne({name:"CA"},'value')
    const opts = {
        key: fs.readFileSync(path.join(__dirname, path.sep+"cert"+path.sep+"hb_key.pem")),
        cert: fs.readFileSync(path.join(__dirname, path.sep+"cert"+path.sep+"hb_cert.pem")),
        requestCert: true,
        rejectUnauthorized: true, // so we can do own error handling
        ca: fs.readFileSync(path.join(__dirname, path.sep+"cert"+path.sep+"ca_cert.pem")),
    };
    
    https.createServer(opts,app).listen(PORT, function () {
        console.log('HeartbeatService started on port ' + PORT)
    })
})()

