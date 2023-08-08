const { exec } = require('child_process');
const soundplayer = require('sound-player');
var player = new soundplayer( { filename: "223_AM.wav" } );
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhttp = new XMLHttpRequest();
var date = new Date();

setInterval(getTime, 60000);

function getTime() {
  if (date.getHours() == 5 && date.getMinutes() == 0 || true) {
    exec("echo '3' > /dev/ttyACM0");
    player.play();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var forecasts = (JSON.stringify(JSON.parse(JSON.stringify(JSON.parse(xhttp.responseText).properties)).periods)).split("{");
        var properties = (forecasts[1]).split(":");

        for (var i = 0; i < forecasts.length; i++) {
          console.log(i + " " + forecasts[i]);
        }
      }
    };
    xhttp.open("GET", "https://api.weather.gov/gridpoints/TOP/86,72/forecast", true);
    xhttp.send();
  }

  date = new Date();
}
