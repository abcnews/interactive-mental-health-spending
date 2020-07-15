import PapaParse from "https://jspm.dev/papaparse@5.2";

// Because we're using a pre es6 module it doesn't have typing
// And I can't figure out how to import types properly... yet
const Papa: any = PapaParse;

// Import data file
const data = await Deno.readTextFile("./mental-health-spending.csv");

// Runs after Papaparse parses the csv
const onParseComplete = (results: any) => {
  for (const entry of results.data) {
    console.log(entry);
  }
};

// Parse the file
Papa.parse(data, {
  complete: onParseComplete,
  header: true
});
