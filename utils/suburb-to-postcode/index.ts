#!/usr/bin/env node
// A Node script. Run with ts-node or something.

console.log("Welcome to the data filter....er");

const suburbs = require("./suburb-to-postcode.json");

const newData = [];

for (const suburb of suburbs) {
  const found = newData.findIndex(newSuburb => {
    return newSuburb.suburb === suburb.suburb;
  });

  // If not found, add to array
  if (found === -1) {
    newData.push(suburb);
  } else {
    console.log(newData[found]);
  }
}

// console.log(newData);
