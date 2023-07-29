const { exec } = require('child_process');
var soundplayer = require('sound-player');
var player = new soundplayer( { filename: "223_AM.wav" } );

setInterval(getTime, 60000);

function getTime() {
  exec("echo 'Hello World!'", (stdout) => {
    console.log(stdout);
    var dateTimeString = Buffer.from(stdout);

    if (dateTimeString.includes(" 10:20") && dateTimeString.includes("PM")) {
      exec("echo '3' > /dev/ttyACM0");
      player.play();
    }
  });
}
