const { exec } = require('child_process');
const audio = require('play-sound');

exec("echo '3' > /dev/ttyACM0");

audio.play("pacman.mp3");
