const {PythonShell} = require('python-shell');//para ligar o python ao nodejs

PythonShell.run('script_clean.py',null,(err)=>{
    if (err) throw err;
    console.log('#######  LIMPEZADO DO BD! TERMINADO!  #######')
})