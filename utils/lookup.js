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

  // Add region to our data
  response["SA3 code"] = assignedArea ? assignedArea.sa3 : "";

  let sa3Filtered;

  if (response["SA3 code"] !== "") {
    sa3Filtered = sa3ToRegion.filter(sa3 => {
      return sa3["SA3 code"].toString() === response["SA3 code"].toString();
    });
  }

  response["SA3 name"] = sa3Filtered ? sa3Filtered[0]["SA3 name"] : "";
  response["SA3 group"] = sa3Filtered ? sa3Filtered[0]["SA3 group"] : "";

  newData.push(response);
}

fs.writeFileSync("./newData.json", JSON.stringify(newData));
