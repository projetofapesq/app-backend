const Teste = require('./database/model');
const fs = require('fs');
const cron = require('cron').CronJob;

const buscar_all_testes = async ()=>{
    const lista_teste = await Teste.find({})
    lista_teste.forEach(async (el) =>{
        // DELETAR ARQUIVOS EM RESULTADOS-UNET : RADIOGRAFIA
        if(fs.existsSync('./resultados-Unet/radiografia-'+el.id+'.jpeg')){
            fs.unlink('./resultados-Unet/radiografia-'+el.id+'.jpeg', (err)=>{
                if(err){
                    console.log("Error while delete file "+err);
                }
                console.log("arquivo de radiografia-"+el.id+"excluido com sucesso.")
            })
        }else{
            console.log('arquivo radiografia nao existe.')
        }
        // DELETAR ARQUIVOS EM RESULTADOS-UNET : SEGMENTATION
        if(fs.existsSync('./resultados-Unet/segmentation-'+el.id+'.jpeg')){
            fs.unlink('./resultados-Unet/segmentation-'+el.id+'.jpeg', (err)=>{
                if(err){
                    console.log("Error while delete file "+err);
                }
            })
            console.log("arquivo de segmentation-"+el.id+"excluido com sucesso.")
        }else{
            console.log('arquivo de segmentation nao existe.')
        }
        // DELETAR ARQUIVOS EM RESULTADOS-UNET : HEATMAP
        if(fs.existsSync('./resultados-Unet/heatmap-'+el.id+'.png')){
            fs.unlink('./resultados-Unet/heatmap-'+el.id+'.png', (err)=>{
                if(err){
                    console.log("Error while delete file "+err);
                }
            })
            console.log("arquivo de radiografia-"+el.id+"excluido com sucesso.")
        }else{
            console.log('arquivo de heatmap nao existe.')
        }
        
        // REMOVER DO MONGO
        await Teste.remove({id:el.id})
        await Teste.remove({_id:el._id})

        
    })
    console.log('Banco e Pasta de Resultados limpo.')
}

var Job = new cron('0 1/6 * * * *', function(){
    buscar_all_testes()
})

Job.start()