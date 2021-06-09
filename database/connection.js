const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/diagnosis', {useNewUrlParser:true, useUnifiedTopology:true})
mongoose.Promise = global.Promise;

module.exports = mongoose;
