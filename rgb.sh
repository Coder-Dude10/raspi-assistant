#!/bin/bash

:x
echo '1' > /dev/ttyACM0
sleep 1
echo '2' > /dev/ttyACM0
sleep 1
echo '3' > /dev/ttyACM0
sleep 1
goto x
