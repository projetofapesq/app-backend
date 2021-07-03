const {PythonShell} = require('python-shell');//para ligar o python ao nodejs


let pyshell = new PythonShell('script_clean.py');

pyshell.send('hello');

pyshell.on('message', (message)=>{
	console.log(message);
});

pyshell.end((err)=>{
	if(err)throw err;
	console.log('finished');
})
