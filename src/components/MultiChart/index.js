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

export default props => {
  const root = useRef();
  const windowSize = useWindowSize();
  data = props.data;

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
      .domain([0, props.yMax])
      .range([height - margin.bottom, margin.top]);

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

    scaleY.domain([0, props.yMax]);

    yAxisGroup
      .transition()
      .duration(250)
      .call(yAxis);

    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .transition()
      .duration(0)
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
