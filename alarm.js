const { exec } = require('child_process');
const soundplayer = require('sound-player');
const { getStorage, ref, uploadString } = require('@firebase/storage');
const storage = getStorage();
const storageRef = ref(storage, 'some-child');
var firebaseConfig = {
  apiKey: "AIzaSyBA4-vUDqlhPxP35RSyL3RhlrLkWP3aU1g",
  authDomain: "cloud-connection-622a5.firebaseapp.com",
  databaseURL: "https://cloud-connection.firebaseio.com",
  projectId: "cloud-connection-622a5",
  storageBucket: "cloud-connection-622a5.appspot.com",
  measurementId: "G-MEASUREMENT_ID"
};
var player = new soundplayer( { filename: "223_AM.wav" } );
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhttp = new XMLHttpRequest();
var date = new Date();
var currentlyPlaying = false;

firebase.initializeApp(firebaseConfig);
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

  uploadString(storageRef, command).then((snapshot) => {
    console.log("Uploaded a raw string!");
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
