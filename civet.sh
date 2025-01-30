#!/bin/bash

# civet Compile
civet --js -c $1/$2/$3.$4 

# Move File
mv $1/$2/$3.civet.jsx ./$2/$3.js
