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
const db = "mongodb+srv://admin:eCpqkm1rBQgO3E8U@cluster0.kj7xb.mongodb.net/checkersdb?retryWrites=true&w=majority"
mongoose.connect(db, {useNewUrlParser: true, 
                    useUnifiedTopology: true})

// Body Parser
app.use(express.json());

// Routes
app.use("/", require("./routes/index"))

const PORT = process.env.PORT
app.listen(PORT, function () {
    console.log('Server started on port ' + PORT)
})