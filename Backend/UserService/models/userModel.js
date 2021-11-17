const mongoose = require("mongoose")
const defaultAvatar = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../assets', 'avatar.png')).toString('base64');

const userSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    username:String,
    stars: String,
    nationality:String,
    wins:Number,
    losses:Number,
    avatar: {
        type: String,
        default: defaultAvatar
      },
    mail:String,
    password:String,
    salt:String
});

module.exports = mongoose.model("user", userSchema)