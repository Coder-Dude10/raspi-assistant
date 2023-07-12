#!/bin/bash

cd raspi-assistant-main
rm pacman.mp3
rm raspi.js
cd ~
rmdir raspi-assistant-main
wget https://github.com/Coder-Dude10/raspi-assistant/archive/refs/heads/main.zip
unzip main.zip
rm main.zip
echo "Update complete!"
