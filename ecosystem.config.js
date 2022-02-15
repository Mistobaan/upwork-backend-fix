module.exports = {
  apps : [{
    name:'BE-IoT',
    script: 'app.js',
    watch: '.',
    log_file:process.cwd()+'/IoT-Server/logs/combined.log',
    out_file:process.cwd()+'/IoT-Server/logs/out.log',
    error_file:process.cwd()+'/IoT-Server/logs/error.log'
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
