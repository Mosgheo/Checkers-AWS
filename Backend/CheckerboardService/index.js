const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

// Load .env
dotenv.config()

// Initialize express const
const app = express()

// Connect to DB
const db = "mongodb+srv://admin:o8FQwQuqTRFqeA6w@cluster0.kj7xb.mongodb.net/checkersdb?retryWrites=true&w=majority"
mongoose.connect(db, {useNewUrlParser: true, 
                    useUnifiedTopology: true})

// Body Parser
app.use(express.json());

// Routes
app.use("/", require("./routes/checkerboardRoutes.js"))

const PORT = process.env.PORT
app.listen(PORT, function () {
    console.log('PlayerService started on port ' + PORT)
})