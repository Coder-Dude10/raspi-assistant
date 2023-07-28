const { exec } = require('child_process');

exec("echo '3' > /dev/ttyACM0");
