module.exports = function(mongoose){
    var Schema = mongoose.Schema;
    var userSchema = new Schema({
        userId: {
            type:String,
            required: true,
            unique:true
        },
        username: {
            type: String,
            required: true
        },
        nationality: String,
        name:String,
        surname:String,
        wins:Number,
        loss:Number,
        stars:Number,
    })
    return mongoose.model('user', userSchema);
}