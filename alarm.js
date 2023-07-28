const { exec } = require('child_process');
var soundplayer = require('sound-player');
var player = new soundplayer( { filename: "223_AM.wav" } );

exec("echo '3' > /dev/ttyACM0");
player.play();
