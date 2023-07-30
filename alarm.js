const { exec } = require('child_process');
const soundplayer = require('sound-player');
const TextToSpeech = require('text-to-speech-js');
var player = new soundplayer( { filename: "223_AM.wav" } );
var date = new Date();

setInterval(getTime, 60000);

function getTime() {
  if (date.getHours() == 5 && date.getMinutes() == 0) {
    exec("echo '3' > /dev/ttyACM0");
    player.play();
    TextToSpeech.talk("Bananas are great!");
  }

  date = new Date();
}
