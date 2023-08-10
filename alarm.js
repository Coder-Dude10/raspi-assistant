const { exec } = require('child_process');
const soundplayer = require('sound-player');
var player = new soundplayer( { filename: "223_AM.wav" } );
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhttp = new XMLHttpRequest();
var date = new Date();
var accessToken = Buffer.from("Z2hwX0RUWlB3WmloZDV1bXYzY0U1a204YlZHS0NPVWx4SzBrMXFnZg==", "base64").toString("ascii");
var currentlyPlaying = false;

setInterval(getTime, 60000);

function getTime() {
  if (date.getHours() == 5 && date.getMinutes() == 0 || !(currentlyPlaying)) {
    currentlyPlaying = true;
    sendCommand("Start Toaster");
    exec("echo '3' > /dev/ttyACM0");
    player.play();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var forecasts = (JSON.stringify(JSON.parse(JSON.stringify(JSON.parse(xhttp.responseText).properties)).periods)).split("{");
        var properties = (forecasts[4]).split(":");
        var detailedProperties = (properties[9].split('"'));

        setTimeout(() => {
          exec("espeak 'Good Morning! The forecast for today is " + detailedProperties[1] + "'");
        }, 88000);
      }
    };
    xhttp.open("GET", "https://api.weather.gov/gridpoints/TOP/86,72/forecast", true);
    xhttp.send();
  }

  date = new Date();
}

function sendCommand(command) {
  log("Attempting to " + command + "...", false);

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      log(this.responseText);
    }
  };
  xhttp.open("PUT", "https://api.github.com/repos/Coder-Dude10/cloud-connection/contents/data.txt", true);
  xhttp.setRequestHeader("Accept", "application/vnd.github.v3+json");
  xhttp.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhttp.send(JSON.stringify({
    message: "upload data",
    content: Buffer.from(command).toString("base64")
  }));
}

function log(log, isError) {
  date = new Date();

  if (isError) {
    console.log(date + " - ERR! " + log);
  } else {
    console.log(date + " - " + log);
  }
}
