const tf = require("@tensorflow/tfjs"); //tfjs padrão
const tfn = require("@tensorflow/tfjs-node");//tfjs especifica ao node
const {PythonShell} = require('python-shell');//para ligar o python ao nodejs
const handler_Unet = tfn.io.fileSystem("./unet/model.json");//carregando o modelo Unet
const handler_V3 = tfn.io.fileSystem("./model_v3.json/model.json");//carregando o modelo Xception
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.send('Hello Baby!')
})

app.listen(process.env.PORT || 5000, () => {
    console.log("server stated at http://localhost:5000");
});