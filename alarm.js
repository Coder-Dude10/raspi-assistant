const { exec } = require('child_process');
const soundplayer = require('sound-player');
var player = new soundplayer( { filename: "223_AM.wav" } );
var date = new Date();

setInterval(getTime, 60000);

function getTime() {
  console.log(date.getHours() + ":" + date.getMinutes());
  
  if (date.getHours() == 23 && date.getMinutes() == 54) {
    exec("echo '3' > /dev/ttyACM0");
    player.play();
  }

  date = new Date();
}
