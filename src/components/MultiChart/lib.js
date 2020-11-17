import { useEffect, useRef } from "react";

export const sortData = (data, sortKey) => {
  return data.sort((a, b) => a[sortKey] - b[sortKey]);
};

export const calculateMargins = (width, height) => {
  return {
    top: height * 0.14,
    right: width * 0.05,
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
    // Disregard NP (Not Published)
    if (sa3[yField] === "NP") continue;

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

// Helper functions + testing
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const mobileAndTabletCheck = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
