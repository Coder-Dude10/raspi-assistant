const { exec } = require('child_process');
const soundplayer = require('sound-player');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var player = new soundplayer( { filename: "223_AM.wav" } );
var xhttp = new XMLHttpRequest();
var date = new Date();

setInterval(getTime, 60000);

function getTime() {
  if (date.getHours() == 5 && date.getMinutes() == 0 || true) {
    exec("echo '3' > /dev/ttyACM0");
    player.play();
    
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
      }
    };
    
    xhttp.open({
      method: 'POST',
      url: 'https://large-text-to-speech.p.rapidapi.com/tts',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '2d2bd54781msh26b8bc9bc4fc8a0p12cff1jsn0b6b1018fcab',
        'X-RapidAPI-Host': 'large-text-to-speech.p.rapidapi.com'
      },
      data: {
        text: 'A banana is a botanical fruit.'
      }
    });
    xhttp.send();
  }

  date = new Date();
}
