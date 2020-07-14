import PapaParse from "https://jspm.dev/papaparse";
// Because we're using a pre es6 module it doesn't have typing
const Papa: any = PapaParse;

// Import data file
const data = Deno.readTextFileSync("./mental-health-spending.csv");

const onParseComplete = (results: any) => {
  for (const entry of results.data) {
    console.log(entry);
  }
};

Papa.parse(data, {
  complete: onParseComplete,
  header: true
});
