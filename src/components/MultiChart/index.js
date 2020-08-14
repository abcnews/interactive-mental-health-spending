import React, { useRef, useLayoutEffect, useEffect } from "react";
import * as d3Select from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Fetch from "d3-fetch";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import useWindowSize from "./useWindowSize";
import styles from "./styles.scss";

const d3 = {
  ...d3Select,
  ...d3Scale,
  ...d3Fetch,
  ...d3Array,
  ...d3Axis,
  ...d3ScaleChromatic
};

// Test data
// const wineQuality = require("./wineQuality.json");
const data = require("./test-data.json");
const X_FIELD = "SA3 group";
const Y_FIELD = "Medicare benefits per 100 people ($)";

// const xVar = "Alcohol";
// const yVar = "Citric Acid";
// const titleHeight = 40;
// const figPadding = 15;
// const yAxisWidth = 42;
// const xAxisHeight = 35;
// const textHeight = 14;

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

export default props => {
  const root = useRef();
  const windowSize = useWindowSize();

  const createChart = () => {
    margin = {
      top: window.innerHeight * 0.2,
      right: window.innerWidth * 0.1,
      bottom: window.innerHeight * 0.1,
      left: window.innerWidth * 0.1
    };

    svg = d3.select(root.current);

    width = svg.node().getBoundingClientRect().width;
    height = window.innerHeight;

    // const data = [
    //   { xfield: 4, yfield: 55 },
    //   { xfield: 5, yfield: 66 },
    //   { xfield: 5, yfield: 76 }
    // ];

    scaleX = d3
      .scalePoint()
      .domain([
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
      ])
      .range([margin.left, width - margin.right]);

    scaleY = d3
      .scaleLinear()
      .domain([5000, 1])
      .range([margin.top, height - margin.bottom]);

    xAxis = g =>
      g.attr("transform", `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(scaleX)
          .tickFormat("")
          // .ticks([8])
          .tickValues([
            "start",
            "spacer2",
            "spacer3",
            "spacer4",
            "spacer5",
            "spacer6",
            "end"
          ])
        // .tickSize(-200)
      );

    // yAxis = g => {
    //   return g.attr("transform", `translate(0,${height - margin.bottom})`).call(
    //     d3
    //       .axisLeft(scaleX)
    //       .tickFormat("")
    //       .ticks(5)
    //     // .tickSize(-200)
    //   );
    // };

    yAxis = svg =>
      svg
        .attr("transform", `translate(${margin.left},0)`)
        .call(
          d3
            .axisLeft(scaleY)
            .tickPadding([6])
            .tickSize(-(width - margin.left - margin.right))
          // .tickFormat(formatTick)
        )
        .call(g => g.select(".domain").remove())
        .call(g =>
          g
            .selectAll(".tick line")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-dasharray", "2,2")
        )
        .call(
          g => g.selectAll(".tick text")
          // .attr("x", 0)
          // .attr("y", 0)
        );

    //d3.axisBottom(scaleX).tickSize(3);

    // Draw the axis
    xAxisGroup = svg.append("g").call(xAxis);
    yAxisGroup = svg.append("g").call(yAxis);

    svg.attr("width", width);
    svg.attr("height", height);

    dots = svg
      .append("g")
      .attr("class", "dots")
      .selectAll()
      .data(data)
      .enter()
      .append("circle")
      .attr("fill", "#435699")
      .attr("cx", d => scaleX(d[X_FIELD]))
      .attr("cy", d => scaleY(d[Y_FIELD]))
      .attr("r", 4);

    return svg;
  };

  const updateChart = () => {
    // Recalculate margins
    margin = {
      top: window.innerHeight * 0.2,
      right: window.innerWidth * 0.1,
      bottom: window.innerHeight * 0.1,
      left: window.innerWidth * 0.1
    };

    // console.log("Resize detected...");
    // console.log(svg.node().getBoundingClientRect());

    width = svg.node().getBoundingClientRect().width;
    height = window.innerHeight;

    scaleX.range([margin.left, width - margin.right]);
    scaleY.range([margin.top, height - margin.bottom]);

    svg.attr("width", width);
    svg.attr("height", height);

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    dots
      .attr("cx", d => scaleX(d[X_FIELD]))
      .attr("cy", d => scaleY(d[Y_FIELD]));
  };

  const initComponent = () => {
    createChart();
  };

  useLayoutEffect(() => {
    // Init layout effect after delay
    setTimeout(() => {
      initComponent();
    }, 500);
  }, []);

  // Detect and handle window resize events
  useLayoutEffect(() => {
    if (!svg) return;

    updateChart();
  }, [windowSize.width, windowSize.height]);

  useLayoutEffect(() => {
    // Wait until chart is mounted
    if (!svg) return;

    console.log("Props updated...");
    console.log(props);
  }, [props]);

  return (
    <div className={styles.root}>
      <svg className={"scatter-plot"} ref={root}></svg>
    </div>
  );
};
