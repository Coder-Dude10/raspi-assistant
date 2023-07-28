const { exec } = require('child_process');
var soundplayer = require('sound-player');
var player = new soundplayer( { filename: "pacman.mp3", player: "mpg123" } );

exec("echo '3' > /dev/ttyACM0");
player.play();
