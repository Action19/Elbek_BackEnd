const mongoose = require('mongoose');

module.exports =  function () {
    try {
        mongoose.set('strictQuery', false);
        mongoose.connect('mongodb+srv://abduqodirovelbek1991_db_user:FJduHaA1LkVdCfTB@cluster0.uv5kudr.mongodb.net/?appName=Cluster0');
        console.log('Mongo connected');
    }
    catch (error) {
        console.log(error)
        process.exit()
    }
}

