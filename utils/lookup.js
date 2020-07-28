/**
 * Lookup postcodes and assign to SA3 and region
 */

const fs = require("fs");

// Load original data
const calloutResponses = require("./callout-response.json");

// Load initial lookup table for postcode to sa3
const postcodeLookup = require("./postcode-to-sa3-lookup.json");

// Load sa3 to region lookup
const sa3ToRegion = require("./sa3-to-region.json");

const newData = [];

for (const response of calloutResponses) {
  // console.log(response.Postcode.toString())

  const filteredLookup = postcodeLookup.filter(entry => {
    if (entry.postcode.toString() === response.Postcode.toString()) {
      return true;
    } else return false;
  });

  // Get the single largest ratio area
  let assignedArea;

  if (filteredLookup.length > 0) {
    assignedArea = filteredLookup.reduce((prev, current) =>
      prev.ratio > current.ratio ? prev : current
    );
  }

  // console.log(response.Postcode.toString(), assignedArea);

  response.sa3 = assignedArea ? assignedArea.sa3 : "";
  // console.log(response);

  newData.push(response);
}

console.log(newData);
fs.writeFileSync("./newData.json", JSON.stringify(newData));
