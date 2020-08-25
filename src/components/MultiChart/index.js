import React, { useRef, useLayoutEffect, useEffect } from "react";
import useWindowSize from "./useWindowSize";
import styles from "./styles.scss";

// D3 imports
import * as d3Select from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Fetch from "d3-fetch";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import * as d3Transition from "d3-transition";
import * as d3Format from "d3-format";
import * as d3Shape from "d3-shape";

const d3 = {
  ...d3Select,
  ...d3Scale,
  ...d3Fetch,
  ...d3Array,
  ...d3Axis,
  ...d3ScaleChromatic,
  ...d3Transition,
  ...d3Format,
  ...d3Shape
};

const TRANSITION_DURATION = 0;
const dotRadius = 5;
const LINE_ANIMATION_DURATION = 2000;

const calculateMargins = (width, height) => {
  return {
    top: height * 0.2,
    right: width * 0.15,
    bottom: height * 0.1,
    left: width * 0.12
  };
};

// Load our data and assign to object
const dataObject = {
  allied: require("./data/allied-data.json"),
  distressed: require("./data/distressed-data.json"),
  gpFocus: require("./data/gp-focus.json")
};

// We have a special weird x-axis that has values
// mid-way through the "tick" lines
const xTicks5 = [
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
  "end"
];

const xTicks6 = [
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
  "end"
];

// Some scoped vars
let svg;
let margin;
let scaleX;
let scaleY;
let xAxis;
let yAxis;
let xAxisGroup;
let yAxisGroup;
let dots;
let width;
let height;
let xTicks;
let line;
let path;

// The React function component
const MultiChart = props => {
  const { xField, yField, ...theRestOfTheProps } = props;
  const root = useRef();
  const windowSize = useWindowSize();
  xTicks = props.xNumberOfTicks === 5 ? xTicks5 : xTicks6;

  const formatYTicks = x => {
    if (props.yValueType === "percent") return `${x}%`;
    else if (props.yValueType === "dollars") {
      if (x === 0) return `$${x}`;
      const commaFormatter = d3.format(",");
      return `${commaFormatter(x)}`;
    } else return x;
  };

  const makeYAxis = svg =>
    svg
      .attr("transform", `translate(${margin.left},0)`)
      .attr("id", "y-axis")
      .call(
        d3
          .axisLeft(scaleY)
          .tickPadding([6])
          .tickSize(-(width - margin.left - margin.right))
          .ticks(5)
          .tickFormat(formatYTicks)
      )
      .call(g => g.select(".domain").remove())
      .call(g =>
        g
          .selectAll(".tick line")
          .style("stroke", "#a4a4a4")
          .style("stroke-opacity", 0.5)
          .style("stroke-width", 1)
          .style("shape-rendering", "crispEdges")
      )
      .call(g => g.selectAll(".tick text"));

  const createChart = () => {
    svg = d3.select(root.current);

    width = svg.node().getBoundingClientRect().width;
    height = window.innerHeight;

    margin = calculateMargins(width, height);

    scaleX = d3
      .scalePoint()
      .domain(xTicks)
      .range([margin.left, width - margin.right]);

    scaleY = d3
      .scaleLinear()
      .domain([0, props.yMax])
      .range([height - margin.bottom, margin.top]);

    xAxis = g =>
      g.attr("transform", `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(scaleX)
          .tickFormat("")
          .tickValues(xTicks.filter(tick => typeof tick === "string"))
      );

    yAxis = makeYAxis;

    // Draw the axis
    xAxisGroup = svg.append("g").call(xAxis);
    yAxisGroup = svg.append("g").call(yAxis);

    svg.attr("width", width);
    svg.attr("height", height);

    // Create the line from data
    line = d3
      .line()
      .defined(d => !isNaN(d[yField]))
      .x(d => scaleX(d[xField]))
      .y(d => scaleY(d[yField]));

    // Create the path
    path = svg
      .append("path")
      .data([dataObject[props.dataKey]])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

    // Get the length of the line
    const totalLength = path.node().getTotalLength();

    // Animate the path
    path
      .attr("stroke-dasharray", `${totalLength},${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(LINE_ANIMATION_DURATION)
      .attr("stroke-dashoffset", 0);

    dots = svg
      .selectAll("circle")
      .data(dataObject[props.dataKey])
      .join("circle")
      .style("stroke", "rgba(255, 255, 255, 0.6)")
      .style("stroke-width", "1.5")
      .style("fill", props.dotColor)
      .attr("cx", d => {
        if (d[xField] === "National") {
          return 200;
        }

        return scaleX(d[xField]);
      })
      .attr("cy", d => scaleY(d[yField]))
      .attr("r", dotRadius);

    return svg;
  };

  const resizeChart = () => {
    width = svg.node().getBoundingClientRect().width;
    height = window.innerHeight;

    // Recalculate margins
    margin = calculateMargins(width, height);

    scaleX.range([margin.left, width - margin.right]);
    scaleY.range([height - margin.bottom, margin.top]);

    svg.attr("width", width);
    svg.attr("height", height);

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // Resize the path
    path.attr("d", line);

    dots.attr("cx", d => scaleX(d[xField])).attr("cy", d => scaleY(d[yField]));
  };

  useLayoutEffect(() => {
    // Init layout effect after delay
    setTimeout(() => {
      createChart();
    }, 500);
  }, []);

  // Detect and handle window resize events
  useLayoutEffect(() => {
    if (!svg) return;

    resizeChart();
  }, [windowSize.width, windowSize.height]);

  // Chart data change
  useLayoutEffect(() => {
    if (!svg) return;
    console.log(`New props detected:`);
    console.log(props);

    scaleX.domain(props.xNumberOfTicks === 5 ? xTicks5 : xTicks6);
    scaleY.domain([0, props.yMax]);

    yAxis = makeYAxis;

    xAxisGroup
      .transition()
      .duration(TRANSITION_DURATION)
      .call(xAxis);

    yAxisGroup
      .transition()
      .duration(TRANSITION_DURATION)
      .call(yAxis);

    // TODO: we need to handle extra data in the join I think
    // see here: https://observablehq.com/@d3/selection-join
    // NOTE: Fixed now. We needed to explicitly set attributes
    // and styles etc.
    dots = svg
      .selectAll("circle")
      .data(dataObject[props.dataKey])
      .join("circle")
      .style("stroke", "rgba(255, 255, 255, 0.6)")
      .style("stroke-width", "1.5")
      .style("fill", props.dotColor)
      .attr("cx", d => {
        if (d[xField] === "National") {
          return -200000;
        }

        return scaleX(d[xField]);
      })
      .attr("cy", d => scaleY(d[yField]))
      .attr("r", dotRadius);
  }, [props.yMax, props.xNumberOfTicks, props.dataKey]);

  return (
    <div className={styles.root}>
      <svg className={"scatter-plot"} ref={root}></svg>
    </div>
  );
};

// Set default props
MultiChart.defaultProps = {
  dotColor: "red",
  xField: "SA3 group",
  yField: "Medicare benefits per 100 people ($)"
};

export default MultiChart;
