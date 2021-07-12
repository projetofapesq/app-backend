const axios = require('axios');
const fs = require('fs').promises

async function enviar (){
  axios.get('http://app-28868.nuvem-us-02.absamcloud.com:22891/bandeira').then(function (response) {
    let bandeira = response.data
    if(bandeira==="START"){
      console.log("####### OUTRO PROCESSO ROLANDO #######")
    }else{

      Promise.all([fs.readFile('./images/torax.jpg ')]).then( async (results)=>{
        let imagem = results[0]
        const data = new FormData();
        data.append("file", imagem)
        axios.post('http://app-28868.nuvem-us-02.absamcloud.com:22891/bandeira', data).then(function (response) {
          console.log(response)
        }).catch(function (err) {
          if(err) console.log("####### NÃO CONSEGUIU ENVIAR A IMAGEM #######");
        })
      }).catch( function (err) {
        if(err) console.log("####### PROBLEMA A CAPTURAR A IMAGEM #######");
      })
    }
  }).catch(function (err) {
    if (err) console.log("####### NÃO PEGOU BANDEIRA #######");
  })
} 
enviar()