const mongoose = require('mongoose');

module.exports =  function () {
    try {
        mongoose.set('strictQuery', false);
        mongoose.connect('mongodb://localhost:27017/Elbek');
        console.log('Mongo connected');
    }
    catch (error) {
        console.log(error)
        process.exit()
    }
}
