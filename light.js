const { exec } = require('child_process');

exec("echo '3' > /dev/ttyACM0", (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
  });
