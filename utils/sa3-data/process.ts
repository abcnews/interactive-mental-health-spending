const data = require("./original-data.json");
const fs = require("fs");

// console.log(data);

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

fs.writeFileSync("./ourData.json", JSON.stringify(ourData));
