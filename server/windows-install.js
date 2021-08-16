/*
  Install as a service on Windows sever
  npm install -g node-windows
  npm link node-windows
*/
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Cocoa Diary',
  description: 'Cocoa Diary',
  script: 'C:\\diary-server\\index.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
  //, workingDirectory: '...'
  //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();