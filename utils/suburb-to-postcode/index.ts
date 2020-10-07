#!/usr/bin/env node
// A Node script. Run with ts-node or something.

console.log("Welcome to the data filter....er");

const originalSuburbs = require("./suburb-to-postcode.json");

const newData = [];

for (const s of originalSuburbs) {
  // Rules for a no-op for PO Boxes and LVR (Large Volume Receivers)
  if (s.postcode >= 1000 && s.postcode <= 1999) continue; // NSW
  if (s.postcode >= 200 && s.postcode <= 299) continue; // ACT
  if (s.postcode >= 8000 && s.postcode <= 8999) continue; // VIC
  if (s.postcode >= 9000 && s.postcode <= 9999) continue; // QLD
  if (s.postcode >= 5800 && s.postcode <= 5999) continue; // SA
  if (s.postcode >= 6800 && s.postcode <= 6999) continue; // WA
  if (s.postcode >= 7800 && s.postcode <= 7999) continue; // TAS
  if (s.postcode >= 900 && s.postcode <= 999) continue; // NT

  // Filter GPO Boxes
  const GPO_BOXES = [2001, 2601, 3001, 4001, 5001, 6001, 7001, 801];
  if (GPO_BOXES.includes(s.postcode)) continue;

  // Filter boats UNIs etc
  if (s.postcode === 2091) continue; // Hmas Penguin, New South Wales
  if (s.postcode === 4072) continue; // UNIVERSITY OF QUEENSLAND (QLD)
  if (s.postcode === 4475) continue; // Cheepie, Queensland (inside Adavale)

  // Sydney 	NSW 	2000 	2001
  // Canberra 	ACT 	2600 	2601
  // Melbourne 	VIC 	3000 	3001
  // Brisbane 	QLD 	4000 	4001
  // Adelaide 	SA 	5000 	5001
  // Perth 	WA 	6000 	6001
  // Hobart 	TAS 	7000 	7001
  // Darwin 	NT 	0800 	0801

  const found = newData.findIndex(newSuburb => {
    return newSuburb.suburb === s.suburb;
  });

  // If not found, add to array
  if (found === -1) {
    newData.push(s);
  } else {
    // console.log(newData[found]);
    // console.log(s);

    if (s.ratio === 1 && newData[found].ratio === 1) {
      console.log(newData[found]);
      console.log(s);
    }
  }
}

// console.log(newData);
