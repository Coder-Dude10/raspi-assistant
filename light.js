const { exec } = require('child_process');
var soundplayer = require('sound-player');
var player = new soundplayer("pacman.mp3");

exec("echo '3' > /dev/ttyACM0");
player.play();
