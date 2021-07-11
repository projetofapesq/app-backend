//Imports das bibliotecas
const tf = require("@tensorflow/tfjs"); //tfjs padrão
const tfn = require("@tensorflow/tfjs-node");//tfjs especifica ao node
const {PythonShell} = require('python-shell');//para ligar o python ao nodejs
const handler_Unet = tfn.io.fileSystem("./unet/model.json");//carregando o modelo Unet
const handler_V3 = tfn.io.fileSystem("./model_v3.json/model.json");//carregando o modelo Xception
const Teste = require('./database/model')//Carregando o model do BD
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const shell = require('shelljs');
const fss = require('fs');
const fs = require('fs').promises //Responsavel de pegar a imagem na pasta local

//Servidor: Instância e habilitações cors e bodyParser para comunicação externa
const express = require('express');
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
app.use("/images",express.static(path.resolve(__dirname,"images") ));

//Instanciando o multer pois é o cara que posso utilizar para salvar a imagem localmente
const multer = require('multer');
const multerConfig = require("./config/multer");

//Instanciamento de Array e PythonShell
let pyshell = new PythonShell('script_processo.py'), flag = "EMPTY", pyclean;


//Promessa para rodar o model.json com tensorflow
async function Processo (imagem, idteste, image_mongo1,image_mongo2) {
    //Capturar os testes já feito para limpar
    const array_testes = await Teste.find();
    const tempo_inicio = Date.now()
    //Processo de limpar
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    if(flag=="START"){
        console.log('#######  OUTRO PROCESSO EM ANDAMENTO #######');
    }else{
        Promise.all([fs.readFile(imagem)]).then( async (results)=>{
            console.log('#######  PROCESSAMENTO DA IMAGEM INICIADO #######');
            
            //Carregando modelos 
            const model_Unet = await tf.loadLayersModel(handler_Unet);
            const model_V3 = await tf.loadLayersModel(handler_V3);
            
            //Passar a imagem para um tensor 3D
            const imgTensor_Unet =tfn.node.decodeImage(new Uint8Array(results[0]),1);
            const imgTensor_V3 =tfn.node.decodeImage(new Uint8Array(results[0]),3);
        
            //Reajuste na imagem para tamanho 512x512 e expansão para 4D
            const imgResize_Unet = tf.image.resizeNearestNeighbor(imgTensor_Unet, [512,512],preserve_aspect_ratio=true).mean(2).toFloat().expandDims(0).expandDims(-1);
            
            const imgResize_V3 = tf.image.resizeNearestNeighbor(imgTensor_V3, [150,150],preserve_aspect_ratio=true).toFloat().expandDims();
            const offset = tf.scalar(255.);
            const imgNormalizada = imgResize_V3.sub(offset).div(offset);
    
            //Colocando a imagem para o modelo e guardando as prediction 
            let prediction_Unet = await model_Unet.predict(imgResize_Unet).dataSync();
            prediction_Unet = Array.from(prediction_Unet)
    
            let prediction_V3 = await model_V3.predict(imgNormalizada).dataSync();
            prediction_v3 = Array.from(prediction_V3)
    
            const object_result = new Array()
            object_result.push(prediction_Unet)
            object_result.push(imagem)
            object_result.push(JSON.stringify(prediction_V3))
            object_result.push(idteste)
            object_result.push(image_mongo1)
            object_result.push(image_mongo2)
            
            return object_result;
    
        }).then((predictions)=>{
            //Then significa que todas as funções deram certo 
            console.log('#######  PROCESSAMENTO DA IMAGEM TERMINADO #######')
        
            //Enviando as predictions para o script.py
            const path_imagem = predictions[1]
            try{
                console.log('#######  DADOS ENVIADO PARA SCRIPT_PROCESSO.PY  #######')
                pyshell.send(JSON.stringify(predictions))
            }catch(err){
                console.log("#######  ERROR! AO ENVIO DOS DADOS PARA O SCRIPT_PROCESSO.PY #######", err)
            }
            //Verificações se chegou e se sim print na tela 'finished'
            pyshell.on('message', function (message) {
                console.log(message);
            });
    
            pyshell.end(function (err) {
                if (err){
                    throw err;
                };
                if(fss.existsSync(path_imagem)){
                    fss.unlink(path_imagem, (err)=>{
                        if(err){
                            console.log("Error while delete file "+err);
                        }
                        
                    })
                }
    
                if(array_testes.length > 5 ){
                    console.log('#######  LIMPEZA DO BD! INICIADO!" #######')
                    array_testes.pop();
                    Clean(array_testes);
                    shell.exec('free -h')
                    shell.exec('sync; echo 1 > /proc/sys/vm/drop_caches')
                    shell.exec('sync; sysctl -w vm.drop_caches=1')
                    shell.exec('sync; swapoff -a && swapon /swapfile')
                    shell.exec('free -h')
                    console.log('#######  LIMPEZA DO BD! FINALIZADO!" #######')
                    console.log('#######  FINISHED! PROCESSAMENTO DA IMAGEM REALIZADO COM SUCESSO! #######');
                    flag = "STOP"; //Bandeira para sinalizar que finalizou...
                    const tempo_final = Date.now() - tempo_inicio
                    pyshell = new PythonShell('script_processo.py');
                    console.log('#######  TEMPO DO PROCESSO: ', tempo_final, '  ####### ')
                }else{
                    console.log('#######  FINISHED! PROCESSAMENTO DA IMAGEM REALIZADO COM SUCESSO! #######');
                    flag = "STOP"; //Bandeira para sinalizar que finalizou...
                    const tempo_final = Date.now() - tempo_inicio
                    pyshell = new PythonShell('script_processo.py');
                    console.log('#######  TEMPO DO PROCESSO: ', tempo_final, '  ####### ')
                    
                }
            });
            
            
        }).catch((err)=>{
            //Catch significa que alguma função não corresponderam de maneira correta
            console.log(err)
        })
    }
   
}

async function Clean (lista_teste){  
    lista_teste.forEach(async (el) =>{
        // DELETAR ARQUIVOS EM RESULTADOS-UNET : RADIOGRAFIA
        if(fss.existsSync('./resultados-Unet/radiografia-'+el.id+'.jpeg')){
            fss.unlink('./resultados-Unet/radiografia-'+el.id+'.jpeg', (err)=>{
                if(err){
                    console.log("Error while delete file "+err);
                }
                
            })
        }
        // DELETAR ARQUIVOS EM RESULTADOS-UNET : SEGMENTATION
        if(fss.existsSync('./resultados-Unet/segmentation-'+el.id+'.jpeg')){
            fss.unlink('./resultados-Unet/segmentation-'+el.id+'.jpeg', (err)=>{
                if(err){
                    console.log("Error while delete file "+err);
                }
            })
         
        }
        // DELETAR ARQUIVOS EM RESULTADOS-UNET : HEATMAP
        if(fss.existsSync('./resultados-Unet/heatmap-'+el.id+'.png')){
            fss.unlink('./resultados-Unet/heatmap-'+el.id+'.png', (err)=>{
                if(err){
                    console.log("Error while delete file "+err);
                }
            })
         
        }
        // REMOVER DO MONGO
        await Teste.remove({id:el.id})
        await Teste.remove({_id:el._id})
    })
    console.log('#######  LIMPEZA DO BD E PASTAS SUCESSO! #######')
}

//Rotas
app.get('/bandeira', (req, res) =>{
    res.send(flag)
})
app.get('/full', async (req, res)=>{
    const full = await Teste.find();
    res.send(full)
})
app.get('/predictions/:id', async (req, res)=>{
    const array = await Teste.find({ id: req.params.id});
    if(array[0].predictions){
        res.send(JSON.parse(array[0].predictions))
    }else{
        res.send('ERROR');
    }
    
})
app.get('/imgradiografia/:id', (req, res)=>{
    const idImage = req.params.id
    res.sendFile(__dirname + '/resultados-Unet/radiografia-'+ idImage +'.jpeg')//res => resposta
})
app.get('/imgsegmentacao/:id', (req, res)=>{
    const idImage = req.params.id;
    res.sendFile(__dirname + '/resultados-Unet/segmentation-'+ idImage +'.jpeg')//res => resposta
})
app.get('/imgheatmap/:id', (req, res)=>{
    const idImage = req.params.id;
    res.sendFile(__dirname + '/resultados-Unet/heatmap-'+ idImage +'.png')//res => resposta
})


app.post('/image', multer(multerConfig).single('file'), async (req, res)=>{
    flag = "START"; //Bandeira iniciar
    const image = req.file.path;//repassando o valor para uma variavel. Local: Path; Aws: Location
    const array = image.split("/")
    const array2 = array[5].split("-")//5
    const image_mongo1 = array2[0]
    const image_mongo2 = array2[1]
    try{
        const teste = await Teste.create({ "imagem":image_mongo1 })      
        Processo(image,teste.id,image_mongo1,image_mongo2)//Chamando a função de processo
        return res.send(teste)
    }catch(err){0
        
        return res.status(400).send({error:"Failha no registro"});
    }    
})

//Habilitando o servidor na porta 5000
app.listen(process.env.PORT || 5000, () => {
    console.log("server stated at http://localhost:5000");
});
