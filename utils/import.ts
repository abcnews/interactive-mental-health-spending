// @deno-types="./import.d.ts"
import Papa from "https://jspm.dev/papaparse";
const data = Deno.readTextFileSync("./mental-health-spending.csv");

const onParseComplete = (results: any) => {
  for (const entry of results.data) {
    console.log(entry)
  }
}

Papa.parse(data, {
  complete: onParseComplete,
  header: true
});
