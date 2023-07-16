//const axios = require('axios');
const audio = require('play-sound');
const { SerialPort } = require('serialport');

const port = new SerialPort({ path: "/dev/serial0", baudRate: 9600 });

var options = {
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
};

async function getAudioFile() {
    try {
        const response = await axios.request(options);
        console.log(response.data);

        https.get("https://s3.eu-central-1.amazonaws.com/tts-download/4067ba808a993d194e70ab9dff6b9f80.wav", (res) => {
            const path = `${__dirname}/4067ba808a993d194e70ab9dff6b9f80.wav`; 
            const filePath = fs.createWriteStream(path);
            res.pipe(filePath);
            filePath.on('finish',() => {
                filePath.close();
                audio.play("4067ba808a993d194e70ab9dff6b9f80.wav");
            })
        });
    } catch (error) {
        console.error(error);
    }
}

function sendData() {
  SerialPort.list().then(ports => {
    ports.forEach(function(port) {
      console.log(port.path);
    })
  });

  port.write("blue", function(err) {
    if (err) {
      console.log("Error on write: " + err.message);
    }
    
    console.log("Data Sent!");
  });
}

sendData();
