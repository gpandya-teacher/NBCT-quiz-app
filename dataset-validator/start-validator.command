#!/bin/bash

cd "$(dirname "$0")/dataset-validator"

echo "Starting Dataset Validator..."
npm install
npm run dev

read -p "Press Enter to close..."