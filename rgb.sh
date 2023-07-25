#!/bin/bash

function jumpto
{
    label=$1
    cmd=$(sed -n "/$label:/{:a;n;p;ba};" $0 | grep -v ':$')
    eval "$cmd"
    exit
}
start=${1:-"start"}

start
echo '1' > /dev/ttyACM0
sleep 1
echo '2' > /dev/ttyACM0
sleep 1
echo '3' > /dev/ttyACM0
sleep 1
jumpto $start
