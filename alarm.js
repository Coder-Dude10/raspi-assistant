const { exec } = require('child_process');
const soundplayer = require('sound-player');
const { Octokit, App } = require("octokit");
const octokit = new Octokit({
  auth: Buffer.from("Z2hwX0RUWlB3WmloZDV1bXYzY0U1a204YlZHS0NPVWx4SzBrMXFnZg==", "base64").toString("ascii")
});
var player = new soundplayer( { filename: "223_AM.wav" } );
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhttp = new XMLHttpRequest();
var date = new Date();
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

async function sendCommand(command) {
  log("Attempting to " + command + "...", false);

  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: "Coder-Dude10",
    repo: "cloud-connection",
    path: "data.txt",
    message: "edit data",
    content: Buffer.from(command).toString("base64"),
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
}

function log(log, isError) {
  date = new Date();

  if (isError) {
    console.log(date + " - ERR! " + log);
  } else {
    console.log(date + " - " + log);
  }
}
