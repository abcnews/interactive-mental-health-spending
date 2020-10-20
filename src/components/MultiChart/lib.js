import { useEffect, useRef } from "react";

export const sortData = (data, sortKey) => {
  return data.sort((a, b) => a[sortKey] - b[sortKey]);
};

export const calculateMargins = (width, height) => {
  return {
    top: height * 0.2,
    right: width * 0.04,
    bottom: height * 0.15,
    left: width * 0.12,
  };
};

// We have a special weird x-axis that has values
// mid-way through the "tick" lines
export const xTicks5 = [
  "start",
  1,
  "spacer2",
  2,
  "spacer3",
  3,
  "spacer4",
  4,
  "spacer5",
  5,
  "end",
];

export const xTicks6 = [
  "start",
  1,
  "spacer2",
  2,
  "spacer3",
  3,
  "spacer4",
  4,
  "spacer5",
  5,
  "spacer6",
  6,
  "end",
];

// Average out all the dots from each x-axis group
export const generateAverageData = (data, groupName, valueKey) => {
  const groupHolder = {};

  for (const point of data) {
    const groupId = point[groupName];
    if (typeof groupHolder[groupId] === "undefined") groupHolder[groupId] = [];
    else groupHolder[groupId].push(point);
  }

  const meanData = [];

  for (const groupId in groupHolder) {
    let runningTotal = 0;
    for (const point of groupHolder[groupId]) {
      runningTotal += point[valueKey];
    }

    const groupAverage = runningTotal / groupHolder[groupId].length;

    meanData.push({ [groupName]: groupId, [valueKey]: groupAverage });
  }
  return meanData;
};

// Hook
export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export const lowestHighest = (sa3s, yField) => {
  // Work out lowest
  // NOTE: Doesn't detect duplicates
  let top;
  let bottom;

  for (const sa3 of sa3s) {
    if (!top) {
      top = sa3;
      continue;
    }
    if (!bottom) {
      bottom = sa3;
      continue;
    }

    if (sa3[yField] < bottom[yField]) {
      bottom = sa3;
      continue;
    }

    if (sa3[yField] > top[yField]) {
      top = sa3;
      continue;
    }
  }

  return { lowest: bottom, highest: top };
};

export const processData = data => {
  const key = {
    "Remote (incl. very remote)": 1,
    "Outer regional": 2,
    "Inner regional": 3,
    "Major cities - lower SES": 4,
    "Major cities - medium SES": 5,
    "Major cities - higher SES": 6,
  };

  const processedData = data.map(d => {
    const groupNumber = key[d.group] || "ungrouped";

    return {
      "SA3 name": d.name,
      "SA3 group": groupNumber,
      "Medicare benefits per 100 people ($)":
        d.spending === "" ? "NP" : d.spending,
    };
  });

  return processedData;
};
