#!/bin/bash

cd raspi-assistant-main
rm pacman.mp3
rm raspi.js
rm update-raspi.sh
cd ~
rmdir raspi-assistant-main
wget https://github.com/Coder-Dude10/raspi-assistant/archive/refs/heads/main.zip
sleep 5s
unzip main.zip
rm main.zip
echo "Update complete!"
