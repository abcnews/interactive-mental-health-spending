import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
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

// Combine them all into a single object
const d3 = {
  ...d3Select,
  ...d3Scale,
  ...d3Fetch,
  ...d3Array,
  ...d3Axis,
  ...d3ScaleChromatic,
  ...d3Transition,
  ...d3Format,
  ...d3Shape,
};

// Local library imports
import {
  sortData,
  calculateMargins,
  xTicks5,
  xTicks6,
  generateAverageData,
} from "./lib";

// File scoped constants
const TRANSITION_DURATION = 0;
const dotRadius = 5;
const LINE_ANIMATION_DURATION = 2000;

// Load our data and assign to object
const dataObject = {
  allied: sortData(
    require("./data/allied-data.json"),
    "Medicare benefits per 100 people ($)"
  ),
  distressed: require("./data/distressed-data.json"),
  gpFocus: require("./data/gp-focus.json"),
};

// Some vars
// TODO: move these into the component
// We have to attach multiples
// let svg;
// let margin;
// let scaleX;
// let scaleY;
// let xAxis;
// let yAxis;
// let initialXAxisGroup;
// let initialYAxisGroup;
// let width;
// let height;

// The main React function component
const MultiChart = (props) => {
  const { xField, yField, ...remainingProps } = props;
  const root = useRef(); // SVG element ref
  const windowSize = useWindowSize();

  // TODO: change this to have a prop that differentiates between chart types
  const xTicks = props.xNumberOfTicks === 5 ? xTicks5 : xTicks6;

  const [isDocked, setIsDocked] = useState(null);

  let chartSolidPath;
  let chartAveragePath;

  // Instance vars using refs
  const svg = useRef();

  // Some component state vars
  // const [svg, setSvg] = useState();
  const [dots, setDots] = useState();
  const [solidPath, setSolidPath] = useState();
  const [averagePath, setAveragePath] = useState();
  const [xAxisGroup, setXAxisGroup] = useState();
  const [yAxisGroup, setYAxisGroup] = useState();

  const lineGenerator = d3
    .line()
    .defined((d) => !isNaN(d[yField]))
    .x((d) => scaleX(d[xField]))
    .y((d) => scaleY(d[yField]));

  // Format y tick values with $ or % depending on type
  const formatYTicks = (x) => {
    if (props.yValueType === "percent") return `${x}%`;
    else if (props.yValueType === "dollars") {
      if (x === 0) return `$${x}`;
      const commaFormatter = d3.format(",");
      return `${commaFormatter(x)}`;
    } else return x;
  };

  const initChart = () => {
    // Set component scoped SVG selection
    svg.current = d3.select(root.current);

    // Calculate width height and margins
    const width = svg.current.node().getBoundingClientRect().width;
    const height = window.innerHeight;
    const margin = calculateMargins(width, height);

    // Set attributes on the SVG
    svg.current.attr("width", width);
    svg.current.attr("height", height);

    // Set up scale functions
    const scaleX = d3
      .scalePoint()
      .domain(xTicks)
      .range([margin.left, width - margin.right]);

    const scaleY = d3
      .scaleLinear()
      .domain([0, props.yMax])
      .range([height - margin.bottom, margin.top]);

    const makeXAxis = (g) =>
      g.attr("transform", `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(scaleX)
          .tickFormat("")
          .tickValues(xTicks.filter((tick) => typeof tick === "string"))
      );

    const makeYAxis = (svgLocal) =>
      svgLocal
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
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .style("stroke", "#a4a4a4")
            .style("stroke-opacity", 0.5)
            .style("stroke-width", 1)
            .style("shape-rendering", "crispEdges")
        )
        .call((g) => g.selectAll(".tick text"));

    // Draw the axis
    const xAxisGroup = svg.current.append("g").call(makeXAxis);
    const yAxisGroup = svg.current.append("g").call(makeYAxis);
  };

  // const createChart = () => {
  //   const initialSvg = d3.select(root.current);

  //   width = initialSvg.node().getBoundingClientRect().width;
  //   height = window.innerHeight;

  //   margin = calculateMargins(width, height);

  //   scaleX = d3
  //     .scalePoint()
  //     .domain(xTicks)
  //     .range([margin.left, width - margin.right]);

  //   scaleY = d3
  //     .scaleLinear()
  //     .domain([0, props.yMax])
  //     .range([height - margin.bottom, margin.top]);

  //   xAxis = (g) =>
  //     g.attr("transform", `translate(0,${height - margin.bottom})`).call(
  //       d3
  //         .axisBottom(scaleX)
  //         .tickFormat("")
  //         .tickValues(xTicks.filter((tick) => typeof tick === "string"))
  //     );

  //   yAxis = makeYAxis;

  //   // Draw the axis
  //   initialXAxisGroup = initialSvg.append("g").call(xAxis);
  //   initialYAxisGroup = initialSvg.append("g").call(yAxis);

  //   initialSvg.attr("width", width);
  //   initialSvg.attr("height", height);

  //   // ADD LINE BACK LATER
  //   // if (props.solidLine) {
  //   //   // Create the path
  //   //   chartSolidPath = initialSvg
  //   //     .append("path")
  //   //     .attr("fill", "none")
  //   //     .attr("stroke", "none")
  //   //     .attr("stroke-width", 2)
  //   //     .attr("stroke", props.dotColor)
  //   //     .attr("stroke-linejoin", "round")
  //   //     .attr("stroke-linecap", "round")
  //   //     .data([dataObject[props.dataKey]])
  //   //     .attr("d", lineGenerator);

  //   //   // Get the length of the line
  //   //   const totalLength = chartSolidPath.node().getTotalLength();

  //   //   // Animate the path
  //   //   // TODO: focus on animations later
  //   //   chartSolidPath
  //   //     .attr("stroke-dasharray", `${totalLength},${totalLength}`)
  //   //     .attr("stroke-dashoffset", totalLength)
  //   //     .transition()
  //   //     .duration(LINE_ANIMATION_DURATION)
  //   //     .attr("stroke-dashoffset", 0);
  //   // }

  //   if (props.averageLine) {
  //     const averageData = generateAverageData(
  //       dataObject[props.dataKey],
  //       xField,
  //       yField
  //     );

  //     // Create the path
  //     chartAveragePath = initialSvg
  //       .append("path")
  //       .data([averageData])
  //       .attr("fill", "none")
  //       .attr("stroke", "#929292")
  //       .attr("stroke-width", 1)
  //       .attr("stroke-dasharray", `2, 2`)
  //       .attr("d", lineGenerator);
  //   }

  //   console.log(isDocked);

  //   const initialDots = initialSvg
  //     .selectAll("circle")
  //     .data(dataObject[props.dataKey])
  //     .join("circle")
  //     .style("stroke", "rgba(255, 255, 255, 0.6)")
  //     .style("stroke-width", "1.5")
  //     .style("fill", props.dotColor)
  //     .style("transition", "opacity 1s")
  //     .style("opacity", isDocked ? 1.0 : 0.0)
  //     .attr("cx", (d) => {
  //       if (d[xField] === "National") {
  //         return 200;
  //       }

  //       return scaleX(d[xField]);
  //     })
  //     .attr("cy", (d) => scaleY(d[yField]))
  //     .attr("r", dotRadius);

  //   chartTitle.current = initialSvg
  //     .append("text")
  //     .attr("x", 100)
  //     .attr("y", 100)
  //     .text("HELLO");

  //   setSvg(initialSvg);
  //   setDots(initialDots);
  //   setSolidPath(chartSolidPath);
  //   setAveragePath(chartAveragePath);
  //   setXAxisGroup(initialXAxisGroup);
  //   setYAxisGroup(initialYAxisGroup);
  // };

  // Initial layout effect run once on mount
  useLayoutEffect(() => {
    // Use intersection observer to trigger animation to start
    // only afer we scroll the chart into view
    let callback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsDocked(true);
        } else if (!entry.isIntersecting) {
          setIsDocked(false);
        }
      });
    };

    let observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.99,
    });

    observer.observe(root.current);

    // Init layout effect after delay
    // setTimeout(() => {
    // createChart();
    // }, 2000);
  }, []);

  // // Detect and handle window resize events
  // useLayoutEffect(() => {
  //   // Wait till we have an svg mounted
  //   if (!svg) return;

  //   width = svg.node().getBoundingClientRect().width;
  //   height = window.innerHeight;

  //   // Recalculate margins
  //   margin = calculateMargins(width, height);

  //   scaleX.range([margin.left, width - margin.right]);
  //   scaleY.range([height - margin.bottom, margin.top]);

  //   svg.attr("width", width);
  //   svg.attr("height", height);

  //   // yAxis = makeYAxis;

  //   xAxisGroup.call(xAxis);
  //   yAxisGroup.call(yAxis);

  //   if (props.solidLine && solidPath) {
  //     // Resize the path
  //     solidPath.attr("d", lineGenerator);
  //   }

  //   if (props.averageLine && averagePath) {
  //     averagePath.attr("d", lineGenerator);
  //   }

  //   dots
  //     .attr("cx", (d) => scaleX(d[xField]))
  //     .attr("cy", (d) => scaleY(d[yField]));
  // }, [windowSize.width, windowSize.height]);

  // Handle chart data change (will usually be via scrollyteller marks)
  // useLayoutEffect(() => {
  //   if (!svg) return;

  //   chartTitle.current.attr("y", 200);

  //   scaleX.domain(props.xNumberOfTicks === 5 ? xTicks5 : xTicks6);
  //   scaleY.domain([0, props.yMax]);

  //   yAxis = makeYAxis;

  //   xAxisGroup.transition().duration(TRANSITION_DURATION).call(xAxis);

  //   yAxisGroup.transition().duration(TRANSITION_DURATION).call(yAxis);

  //   // Check if we want a solid line between dots
  //   if (props.solidLine) {
  //     if (solidPath) solidPath.remove();

  //     const newSolidPath = svg
  //       .append("path")
  //       .attr("fill", "none")
  //       .attr("stroke", "none")
  //       .attr("stroke-width", 2)
  //       .attr("stroke", props.dotColor)
  //       .attr("stroke-linejoin", "round")
  //       .attr("stroke-linecap", "round")
  //       .data([dataObject[props.dataKey]])
  //       .attr("d", lineGenerator);

  //     // // Get the length of the line
  //     // const totalLength = path.node().getTotalLength();

  //     // // Animate the path
  //     // // TODO: focus on animations later
  //     // path
  //     //   .attr("stroke-dasharray", `${totalLength},${totalLength}`)
  //     //   .attr("stroke-dashoffset", totalLength)
  //     //   .transition()
  //     //   .duration(LINE_ANIMATION_DURATION)
  //     //   .attr("stroke-dashoffset", 0);

  //     setSolidPath(newSolidPath);
  //   } else if (solidPath) solidPath.remove();

  //   // Check if we want to average the dots and plot a dotted line
  //   if (props.averageLine) {
  //     if (averagePath) averagePath.remove();

  //     const averageData = generateAverageData(
  //       dataObject[props.dataKey],
  //       xField,
  //       yField
  //     );

  //     // Create the path
  //     const newAveragePath = svg
  //       .append("path")
  //       .data([averageData])
  //       .attr("fill", "none")
  //       .attr("stroke", "#929292")
  //       .attr("stroke-width", 1)
  //       .attr("stroke-dasharray", `2, 2`)
  //       .attr("d", lineGenerator);

  //     setAveragePath(newAveragePath);
  //   } else if (averagePath) averagePath.remove();

  //   // TODO: we need to handle extra data in the join I think
  //   // see here: https://observablehq.com/@d3/selection-join
  //   // NOTE: Fixed now. We needed to explicitly set attributes
  //   // and styles etc.
  //   const newDots = svg
  //     .selectAll("circle")
  //     .data(dataObject[props.dataKey])
  //     .join("circle")
  //     .style("stroke", "rgba(255, 255, 255, 0.6)")
  //     .style("stroke-width", "1.5")
  //     .style("fill", props.dotColor)
  //     .style("transition", "opacity 1s")
  //     .attr("cx", (d) => {
  //       if (d[xField] === "National") {
  //         return -200000;
  //       }

  //       return scaleX(d[xField]);
  //     })
  //     .attr("cy", (d) => scaleY(d[yField]))
  //     .attr("r", dotRadius);

  //   // Make sure dots are on top so raise them up
  //   newDots.raise();

  //   setDots(newDots);
  // }, [props.yMax, props.xNumberOfTicks, props.dataKey]);

  // Detect docked or not
  useEffect(() => {
    if (!svg.current) {
      // Attach the chart once we know if we are docked
      // or not
      initChart();
      return;
    }

    // if (isDocked) {
    //   dots.style("opacity", 1.0);
    // } else {
    //   dots.style("opacity", 0.0);
    // }
  }, [isDocked]);

  return (
    <div className={styles.root}>
      <svg className={"scatter-plot"} ref={root}></svg>
      <div className={styles.devInfo}>{isDocked ? "DOCKED" : "UNDOCKED"}</div>
    </div>
  );
};

// Set default props
MultiChart.defaultProps = {
  dotColor: "red",
  xField: "SA3 group",
  yField: "Medicare benefits per 100 people ($)",
};

export default MultiChart;
