export const sortData = (data, sortKey) => {
  return data.sort((a, b) => a[sortKey] - b[sortKey]);
};

export const calculateMargins = (width, height) => {
  return {
    top: height * 0.2,
    right: width * 0.15,
    bottom: height * 0.1,
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
