import React, { useRef, useLayoutEffect, useEffect } from "react";
import * as d3Select from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Fetch from "d3-fetch";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import * as d3Transition from "d3-transition";
import useWindowSize from "./useWindowSize";
import styles from "./styles.scss";

const d3 = {
  ...d3Select,
  ...d3Scale,
  ...d3Fetch,
  ...d3Array,
  ...d3Axis,
  ...d3ScaleChromatic,
  ...d3Transition
};

// Test data
// const wineQuality = require("./wineQuality.json");

const X_FIELD = "SA3 group";
const Y_FIELD = "Medicare benefits per 100 people ($)";
const TRANSITION_DURATION = 250;

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

let data;
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

export default props => {
  const root = useRef();
  const windowSize = useWindowSize();
  data = props.data;
  xTicks = props.xNumberOfTicks === 5 ? xTicks5 : xTicks6

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

          .tickValues(xTicks.filter(tick => typeof(tick) === "string"))

      );

    yAxis = svg =>
      svg
        .attr("transform", `translate(${margin.left},0)`)
        .attr("id", "y-axis")
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
      .selectAll("circle")
      .data(data)
      .join("circle")
      .style("stroke", "rgba(255, 255, 255, 0.6)")
      .style("stroke-width", "1.5")
      .style("fill", "#435699")

      .attr("cx", d => {
        if (d[X_FIELD] === "National") {
          return 200;
        }

        return scaleX(d[X_FIELD]);
      })
      .attr("cy", d => scaleY(d[Y_FIELD]))
      .attr("r", 4);

    return svg;
  };

  const resizeChart = () => {
    // Recalculate margins
    margin = {
      top: window.innerHeight * 0.2,
      right: window.innerWidth * 0.1,
      bottom: window.innerHeight * 0.1,
      left: window.innerWidth * 0.1
    };

    width = svg.node().getBoundingClientRect().width;
    height = window.innerHeight;

    scaleX.range([margin.left, width - margin.right]);
    scaleY.range([height - margin.bottom, margin.top]);

    svg.attr("width", width);
    svg.attr("height", height);

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    dots
      .attr("cx", d => scaleX(d[X_FIELD]))
      .attr("cy", d => scaleY(d[Y_FIELD]));
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

  useLayoutEffect(() => {
    if (!svg) return;
    console.log(`New props detected:`);
    console.log(props);

    scaleX.domain(props.xNumberOfTicks === 5 ? xTicks5 : xTicks6);
    scaleY.domain([0, props.yMax]);

    xAxisGroup
      .transition()
      .duration(250)
      .call(xAxis);

    yAxisGroup
      .transition()
      .duration(250)
      .call(yAxis);

    // TODO: we need to handle extra data in the join I think
    // see here: https://observablehq.com/@d3/selection-join
    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .transition()
      .duration(1000)
      .delay(TRANSITION_DURATION)
      .attr("cx", d => {
        if (d[X_FIELD] === "National") {
          return -1000000;
        }

        return scaleX(d[X_FIELD]);
      })
      .attr("cy", d => scaleY(d[Y_FIELD]));
  }, [props]);

  return (
    <div className={styles.root}>
      <svg className={"scatter-plot"} ref={root}></svg>
    </div>
  );
};
