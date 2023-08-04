const { exec } = require('child_process');
const soundplayer = require('sound-player');
var player = new soundplayer( { filename: "223_AM.wav" } );
var date = new Date();

setInterval(getTime, 60000);

function getTime() {
  if (date.getHours() == 6 && date.getMinutes() == 30) {
    exec("echo '3' > /dev/ttyACM0");
    player.play();
  }

  date = new Date();
}
