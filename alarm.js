const { exec } = require('child_process');
var soundplayer = require('sound-player');
var player = new soundplayer( { filename: "223_AM.wav" } );
var date = new Date();

setInterval(getTime, 60000);

function getTime() {
  if (date.getHours() == 12 && date.getMinutes() == 30) {
    exec("echo '3' > /dev/ttyACM0");
    player.play();
  }
}
