const express = require("express")
const mongoose = require("mongoose")

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useFindAndModify: false });
// Initialize express const
const app = express()

// Connect to DB
const db = process.env.DB_URL
mongoose.connect(db, {useNewUrlParser: true, 
                    useFindAndModify: false,
                    useCreateIndex: true,
                    useUnifiedTopology: true})

// Initialize cors               
app.use(cors())

// Body Parser
app.use(express.json());

// Routes
app.use("/", require("./routes/playerRoutes"))

const PORT = process.env.PORT
app.listen(PORT, function () {
    console.log('PlayerService started on port ' + PORT)
})