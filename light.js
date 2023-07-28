const { exec } = require('child_process');
var audio = require('play-sound');

exec("echo '3' > /dev/ttyACM0");

audio.play('pacman.mp3', function(err){
  if (err) throw err
});
