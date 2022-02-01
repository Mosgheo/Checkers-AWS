const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")

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

const PORT = process.env.PORT
module.exports = app.listen(PORT, function () {
    console.log('UserService started on port ' + PORT)
})