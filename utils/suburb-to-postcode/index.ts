#!/usr/bin/env node
// A Node script. Run with ts-node or something.

const fs = require("fs");

console.log("Welcome to the data filter....er");

const originalSuburbs = require("./suburb-to-postcode.json");

const newData = [];

const filterSuburb = sub => {
  // Rules for a no-op for PO Boxes and LVR (Large Volume Receivers)
  if (sub.postcode >= 1000 && sub.postcode <= 1999) return true; // NSW
  if (sub.postcode >= 200 && sub.postcode <= 299) return true; // ACT
  if (sub.postcode >= 8000 && sub.postcode <= 8999) return true; // VIC
  if (sub.postcode >= 9000 && sub.postcode <= 9999) return true; // QLD
  if (sub.postcode >= 5800 && sub.postcode <= 5999) return true; // SA
  if (sub.postcode >= 6800 && sub.postcode <= 6999) return true; // WA
  if (sub.postcode >= 7800 && sub.postcode <= 7999) return true; // TAS
  if (sub.postcode >= 900 && sub.postcode <= 999) return true; // NT

  // Filter GPO Boxes
  const GPO_BOXES = [2001, 2601, 3001, 4001, 5001, 6001, 7001, 801];
  if (GPO_BOXES.includes(sub.postcode)) return true;

  // Filter boats UNIs etc
  if (sub.postcode === 2091) return true; // Hmas Penguin, New South Wales
  if (sub.postcode === 4072) return true; // UNIVERSITY OF QUEENSLAND (QLD)
  if (sub.postcode === 4475) return true; // Cheepie, Queensland (inside Adavale)
  if (sub.postcode === 5005) return true; // Adelaide University

  return false;
};

for (const sub of originalSuburbs) {
  if (filterSuburb(sub)) continue;

  const found = newData.findIndex(newSuburb => {
    return newSuburb.suburb === sub.suburb;
  });

  // If not found, add to array
  if (found === -1) {
    newData.push(sub);
  } else {
    // Otherwise do something

    // Compare the two sizes
    // let ratioOfSmaller: number;

    // if (sub.ratio < newData[found].ratio) {
    //   ratioOfSmaller = sub.ratio / newData[found].ratio;
    // } else if (newData[found].ratio < sub.ratio) {
    //   ratioOfSmaller = newData[found].ratio / sub.ratio;
    // }

    // if (s.ratio === 1 && newData[found].ratio === 1) {
    //   console.log(newData[found]);
    //   console.log(s);
    // }

    // if (ratioOfSmaller > 0.8) {
    //   console.log(sub);
    //   console.log(newData[found]);
    //   console.log(ratioOfSmaller);
    // }

    // First remove the entry found as we are going to compare and put in the correct one
    newData.splice(found, 1);

    const filteredSuburbs = originalSuburbs.filter((s: any) => {
      if (s.suburb === sub.suburb && !filterSuburb(s)) return true;
      else return false;
    });

    const largest = filteredSuburbs.reduce((prev, current) =>
      prev.ratio > current.ratio ? prev : current
    );

    const allTheRest = filteredSuburbs.filter(
      (s: any) => s.ratio !== largest.ratio
    );
    const secondLargest = allTheRest.reduce((prev, current) =>
      prev.ratio > current.ratio ? prev : current
    );

    // if (filteredSuburbs.length >= 3) {
    const ratioBetween: number = secondLargest.ratio / largest.ratio;

    // if (ratioBetween > 0.01) {
    // console.log(secondLargest, "\n", largest);
    // console.log(ratioBetween)
    // if (largest.ratio === 1) {
    //   console.log(largest);
    //   console.log(secondLargest);
    // }
    // }

    console.log("Duplicate suburb found. Processing...");
    console.log(largest);
    console.log(secondLargest);
    console.log(ratioBetween);
    console.log("Adding largest area...");
    newData.push(largest);

    // }
  }
}

console.log(newData);

fs.writeFileSync("./uniqueSuburbs.json", JSON.stringify(newData));
