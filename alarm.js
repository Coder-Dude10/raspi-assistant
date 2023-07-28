const { exec } = require('child_process');
var soundplayer = require('sound-player');
var player = new soundplayer( { filename: "Aces.wav" } );

exec("echo '3' > /dev/ttyACM0");
player.play();
