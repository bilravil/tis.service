const Service = require('node-windows').Service;

const path = 'C:\\projects\\tis.service\\app.js';

// Create a new service object
var svc = new Service({
  name:'TisService',
  description: 'The nodejs.org example web server.',
  script: path
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.on('alreadyinstalled',function(){
  console.log(2);
});

svc.on('invalidinstallation',function(){
  console.log(1);
});

svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
//svc.uninstall();
svc.install();