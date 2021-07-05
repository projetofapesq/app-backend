import {PythonShell} from 'python-shell';

PythonShell.run('script_clean.py', null, function (err) {
  if (err) throw err;
  console.log('finished');
});