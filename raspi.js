var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var audio = require("play-sound")(opts = {});
var xhttp = new XMLHttpRequest();

xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(JSON.parse(this.responseText).properties);
        audio.play("reverb-fart.mp3");
    }
};
xhttp.open("GET", "https://api.weather.gov/gridpoints/TOP/86,72/forecast", true);
xhttp.send();
