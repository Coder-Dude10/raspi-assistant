const { exec } = require('child_process');
const soundplayer = require('sound-player');
const fetch = require('node-fetch');
var player = new soundplayer( { filename: "223_AM.wav" } );
var date = new Date();

setInterval(getTime, 60000);

function getTime() {
  if (date.getHours() == 5 && date.getMinutes() == 0) {
    exec("echo '3' > /dev/ttyACM0");
    player.play();

    fetch('https://httpbin.org/post', { method: 'POST',
    url: 'https://large-text-to-speech.p.rapidapi.com/tts',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '2d2bd54781msh26b8bc9bc4fc8a0p12cff1jsn0b6b1018fcab',
      'X-RapidAPI-Host': 'large-text-to-speech.p.rapidapi.com'
    },
    data: {
      text: 'I like bananas.'
    } }).then(res => res.text())
    .then(text => console.log(text));
  }

  date = new Date();
}
