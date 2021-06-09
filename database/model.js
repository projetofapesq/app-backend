const mongoose = require('./connection.js');

const TesteSchema = new mongoose.Schema({
    predictions:{
      type: String,
      require: true,
    },
    imgradiografia:{
      type: String,
      require: true,
    },
    imgsegmentation:{
        type: String,
        require: true,
    },
    imgheatmap:{
        type: String,
        require: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
});

const Teste = mongoose.model('Teste', TesteSchema);

module.exports = Teste;