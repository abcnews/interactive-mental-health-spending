const fs = require("fs");

// Allied mental health data
const data = require("./other-allied.json");
const ourData = {};

for (const d of data) {
  if (!ourData[d.code]) ourData[d.code] = {};
  ourData[d.code].name = d.name;

  if (d.measure === "Per cent of people who had the service (%)") {
    ourData[d.code]["percentOfPeople"] = d.value;
  }

  if (d.measure === "Services per 100 people") {
    ourData[d.code]["servicesPer100"] = d.value;
  }

  if (d.measure === "Medicare benefits per 100 people ($)") {
    ourData[d.code]["dollarsPer100"] = d.value;
  }
}

console.log(ourData);

fs.writeFileSync("./otherOurData.json", JSON.stringify(ourData));

// Other allied mental health data
// const otherData = require("./other-allied.json");
// const otherOurData = {};

// for (const d of data) {
//   if (!otherOurData[d.code]) otherOurData[d.code] = {};
//   otherOurData[d.code].name = d.name;

//   if (d.measure === "Per cent of people who had the service (%)") {
//     otherOurData[d.code]["percentOfPeople"] = d.value;
//   }

//   if (d.measure === "Services per 100 people") {
//     otherOurData[d.code]["servicesPer100"] = d.value;
//   }

//   if (d.measure === "Medicare benefits per 100 people ($)") {
//     otherOurData[d.code]["dollarsPer100"] = d.value;
//   }
// }

// console.log(otherOurData);

// fs.writeFileSync("./otherOurData.json", JSON.stringify(otherOurData));