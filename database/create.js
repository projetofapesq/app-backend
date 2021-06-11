const Teste = require('./model')

const inserir = async () =>{
    await Teste.create({id:"123345"})
    console.log('inseriu....')
}

inserir()