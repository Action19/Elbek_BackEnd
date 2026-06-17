const mongoose =  require('mongoose');

const usersSchema = new mongoose.Schema({
    fullname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String},
    role: {type: String},
    token: {type: String},
    lastlessons: {type: Array, default: [0] },
    finishBall:{type: Number},
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate", default: null } 
}, {timestamps: true, });


const Users = mongoose.model("Users", usersSchema);

module.exports =  Users

