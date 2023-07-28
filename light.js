const { exec } = require('child_process');
var player = require('play-sound');

exec("echo '3' > /dev/ttyACM0");

player.play('pacman.mp3', function(err){
  if (err) throw err
});
