const cron = require('cron').CronJob;
const shell = require('shelljs');
const axios = require('axios');

function Restart(){
    console.log('--------------------RESTART---------------------')
    shell.exec('pm2 restart diagnosis');
}

const Job = new cron(' * * * * * ', async function(){
    const flag = await axios.get('http://app-28868.nuvem-us-02.absamcloud.com:22891/bandeira')
    if(flag.data === "RESTART"){
        Restart();
    }
})
Job.start();