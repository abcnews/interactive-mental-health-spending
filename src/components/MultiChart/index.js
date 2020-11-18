import React, { useRef, useEffect, useState } from "react";
import useWindowSize from "./useWindowSize";
// import { Fade } from "@material-ui/core";
import { CSSTransition, TransitionGroup } from "react-transition-group";
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
  calculateMargins,
  xTicks5,
  xTicks6,
  generateAverageData,
  usePrevious,
  lowestHighest,
  processData,
  mobileAndTabletCheck,
} from "./lib";

// File scoped constants
const dotRadius = 6;
const LINE_ANIMATION_DURATION = 2000;
const TICK_TEXT_MARGIN = 4;
const DOTS_UPDATE_DURATION = 1000;
const DOTS_ENTER_DURATION = 1000;
const Y_AXIS_DURATION = 1000;
const DOTS_EXIT_DURATION = 1000;
const ANIMATION_OFFSET = 0.5;
const PULSE_RADIUS = 64;

// Chart bar constants
const BAR_COLOR = "rgba(191, 191, 191, 0.0)";
const BAR_HIGHLIGHT_COLOR = "#D9D9D9";
const BAR_HEIGHT_EXTEND = 22;
const DOT_BAR_HEIGHT_EXTEND = 52;
const DOT_BAR_HEIGHT_EXTEND_MOBILE = 66;
const BACKGROUND_COLOR = "#f0f0f0";
const BAR_BORDER_COLOR = "white";

// Load our data and assign to object
const dataObject = {
  empty: [],
  distressed: require("./data/distressed-data.json"),
  mentalCondition: require("./data/mental-condition-data.json"),
  allied: processData(require("./data/1-allied-mental-health.json")),
  psychiatrists: processData(require("./data/2-psychiatry.json")),
  clinicalPsychologists: processData(
    require("./data/3-clinical-psychologist.json")
  ),
  gpMentalHealth: processData(require("./data/4-gp-mental-health.json")),
  otherAllied: processData(require("./data/5-other-allied-mental-health.json")),
  gpFocus: processData(require("./data/6-gp-focussed.json")),
};

// The main React function component
const MultiChart = props => {
  const { xField, yField, ...restProps } = props;
  const root = useRef(); // SVG element ref
  const windowSize = useWindowSize();
  const prevYMax = usePrevious(props.yMax);
  const prevWindowSize = usePrevious(windowSize);

  // TODO: change this to have a prop that differentiates between chart types
  const xTicks = props.chartType === "line" ? xTicks5 : xTicks6;

  // Initialise state
  const [isDocked, setIsDocked] = useState(null);
  const [hasBeenDocked, setHasBeenDocked] = useState(false);
  const [margin, setMargin] = useState({
    top: 0, // Proper margins are calculated later
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [svgWidth, setSvgWidth] = useState(0);
  const [ownQuintile, setOwnQuintile] = useState(null);
  const [ownRegion, setOwnRegion] = useState(null);
  const [highlightBars, setHighlightBars] = useState([]);
  const [lineLabels, setLineLabels] = useState([]);
  const [linesDataKey, setLinesDataKey] = useState([]);
  const [dotsDataKey, setDotsDataKey] = useState();
  const [dotTopBottomLabels, setDotTopBottomLabels] = useState([]);
  const [dotCustomLabels, setDotCustomLabels] = useState([]);
  const [averageLineLabels, setAverageLineLabels] = useState([]);
  const [averageData, setAverageData] = useState([]);
  const [testimonalDots, setTestimonialDots] = useState([]);
  const [chartTitle, setChartTitle] = useState(null);
  const [chartHeight, setChartHeight] = useState(100);
  // const [rightEdge, setRightEdge] = useState();

  // Previous state or props of things
  // const prevLineLabels = usePrevious(lineLabels);

  // Instance vars using refs
  // This object will stick around over the lifetime
  // of the component. We attach SVG elements etc to this
  // using component.svg = d3.select...... etc etc.
  const componentRef = useRef({});
  const { current: component } = componentRef;

  // Format y tick values with $ or % depending on type
  const formatYTicks = x => {
    if (props.chartType === "line") return `${x}%`;
    else if (props.chartType === "dot") {
      if (x === 0) return `$${x}`;
      const commaFormatter = d3.format(",");
      return `${commaFormatter(x)}`;
    } else return x;
  };

  const initChart = () => {
    // Set component scoped SVG selection
    component.svg = d3.select(root.current);

    // TODO: Maybe find a way to detect if animating
    // and modify transitions based on this (if there's time)
    // component.isAnimating = false;

    // Add our x & y axes groups to component scoped ref
    // (We actually draw the axes later in the initial window size effect)
    component.xAxis = component.svg.append("g").classed("x-axis", true);
    component.yAxis = component.svg.append("g").classed("y-axis", true);
  };

  const processCharts = transitionTime => {
    // if (!isDocked) return;
    if (props.chartType === "line") processLines(transitionTime);
    if (props.chartType === "dot") processDots(transitionTime);
    if (props.chartType === "dot") processAverageLines(transitionTime);
  };

  const processLines = transitionTime => {
    if (!Array.isArray(linesDataKey)) return;

    const collectedLineLabels = [];

    for (const line of linesDataKey) {
      const label = { text: line.labelText };

      const lineGenerator = d3
        .line()
        .defined(d => !isNaN(d[line.yField]))
        .x(d => component.scaleX(d[line.xField]))
        .y(d => component.scaleY(d[line.yField]));

      const lineDots = component.svg
        .selectAll(`circle.${line.lineName}`)
        .data(dataObject[line.dataKey])
        .join(
          enter =>
            enter
              .append("circle")
              .classed(line.lineName, true)
              .attr("cy", d => component.scaleY(d[line.yField]))
              .style("opacity", 0.0)
              .style("stroke", "rgba(255, 255, 255, 0.6)")
              .style("stroke-width", "1.5")
              .style("fill", line.dotColor)
              .attr("cx", d => {
                if (d[line.xField] === "National") {
                  // Probs don't need any more
                  return -2000000;
                }

                return component.scaleX(d[line.xField]);
              })
              .attr("r", dotRadius)
              .call(enter => {
                // Fade dots in
                enter.transition().style("opacity", 1.0);

                if (enter.empty()) return;

                const path = component.svg
                  .data([dataObject[line.dataKey]])
                  .append("path")
                  .classed(line.lineName, true)
                  .attr("fill", "none")
                  .attr("stroke-width", 2)
                  .attr("stroke", line.dotColor)
                  .style("opacity", 1.0)
                  .attr("d", lineGenerator);

                if (path.empty()) return;

                // Get the length of the line
                const totalLength = path.node().getTotalLength();

                const lineBox = path.node().getBBox();
                label.x = lineBox.x;
                label.y = lineBox.y;

                // Animate the path
                path
                  .attr("stroke-dasharray", `${totalLength},${totalLength}`)
                  .attr("stroke-dashoffset", totalLength)
                  .transition()
                  .duration(transitionTime || LINE_ANIMATION_DURATION)
                  .attr("stroke-dashoffset", 0);
              }),
          update =>
            update
              .attr("cy", d => component.scaleY(d[line.yField]))
              .call(update => {
                if (update.empty()) return;

                const path = component.svg
                  .data([dataObject[line.dataKey]])
                  .select(`path.${line.lineName}`)
                  .attr("stroke-dasharray", 0)
                  .attr("d", lineGenerator);

                if (path.empty()) return;

                const lineBox = path.node().getBBox();
                label.x = lineBox.x;
                label.y = lineBox.y;
              })
              .attr("cx", d => {
                if (d[line.xField] === "National") {
                  return -2000000;
                }

                return component.scaleX(d[line.xField]);
              }),
          exit =>
            exit
              .call(exit => {
                if (exit.empty()) return;
                component.svg.select(`path.${line.lineName}`).remove();
              })
              .transition()
              .style("opacity", 0.0)
              .remove()
        );

      if (label.text) collectedLineLabels.push(label);

      // Dots on top (z-axis)
      lineDots.raise();
    }

    setLineLabels(collectedLineLabels);
  };

  const processDots = transitionTime => {
    if (!dotsDataKey) return;

    // A kind of hack so average labels don't appear
    // when transition starts but then user moves to
    // a different marker.
    component.dontSetAverageLabels = true;

    // Try not filtering, just deal with ungrouped and NP later
    const sa3s = dataObject[dotsDataKey.dataKey];

    // Work out lowest and highest
    // NOTE: Doesn't detect duplicates TODO: do this later maybe
    const { lowest, highest } = lowestHighest(sa3s, dotsDataKey.yField);

    // Show low high labels if there is a low and high and if
    // it is set in the key
    if (lowest && highest && props.showLowHighDots) {
      setTimeout(() => {
        setDotTopBottomLabels([
          {
            text: lowest["SA3 name"],
            x: component.scaleX(lowest[dotsDataKey.xField]),
            y: component.scaleY(lowest[dotsDataKey.yField]),
            align: lowest[dotsDataKey.xField] < 5 ? "left" : "right",
            type: "low",
          },
          {
            text: highest["SA3 name"],
            x: component.scaleX(highest[dotsDataKey.xField]),
            y: component.scaleY(highest[dotsDataKey.yField]),
            align: highest[dotsDataKey.xField] < 5 ? "left" : "right",
            type: "high",
          },
        ]);
      }, 500);
    } else
      setTimeout(() => {
        setDotTopBottomLabels([]);
      }, 500);

    const { userSa3 } = props;

    // Show own label if there are dots and option is set
    if (sa3s.length > 0 && props.labelOwnDot && userSa3) {
      setTimeout(() => {
        const matched = sa3s.find(sa3 => {
          if (sa3["SA3 name"] === userSa3.name) return true;
          else return false;
        });

        if (matched) {
          setDotCustomLabels([
            {
              text: matched["SA3 name"],
              x: component.scaleX(matched[dotsDataKey.xField]),
              y: component.scaleY(matched[dotsDataKey.yField]),
              align: matched[dotsDataKey.xField] < 5 ? "left" : "right",
            },
          ]);
        }
      }, 500);
    } else {
      setTimeout(() => {
        setDotCustomLabels([]);
      }, 500);
    }

    // Set testimonial dot
    if (sa3s.length > 0 && dotsDataKey.testimonialSa3) {
      setTimeout(() => {
        const foundTesimonial = sa3s.find(sa3 => {
          if (sa3["SA3 name"] === dotsDataKey.testimonialSa3) return true;
          else return false;
        });

        if (foundTesimonial) {
          setTestimonialDots([
            {
              text: foundTesimonial["SA3 name"],
              x: component.scaleX(foundTesimonial[dotsDataKey.xField]),
              y: component.scaleY(foundTesimonial[dotsDataKey.yField]),
              align: foundTesimonial[dotsDataKey.xField] < 5 ? "left" : "right",
              color: dotsDataKey.dotColor,
            },
          ]);
        }
      }, 500);
    } else {
      setTimeout(() => {
        setTestimonialDots([]);
      }, 500);
    }

    const sa3sFiltered = sa3s.filter(dot => {
      if (dot["SA3 group"] === "ungrouped") return false;
      if (dot["Medicare benefits per 100 people ($)"] === "NP") return false;
      return true;
    });

    // Process dots and get average of each group
    let averageDotsData = generateAverageData(
      sa3sFiltered,
      "SA3 group",
      "Medicare benefits per 100 people ($)"
    );

    const lineGenerator = d3
      .line()
      .defined(d => !isNaN(d["Medicare benefits per 100 people ($)"]))
      .x(d => component.scaleX(d["SA3 group"]))
      .y(d => component.scaleY(d["Medicare benefits per 100 people ($)"]));

    const zeroDataLine = [
      {
        "Medicare benefits per 100 people ($)": 0,
        "SA3 group": "1",
      },
      {
        "Medicare benefits per 100 people ($)": 0,
        "SA3 group": "2",
      },
      {
        "Medicare benefits per 100 people ($)": 0,
        "SA3 group": "3",
      },
      {
        "Medicare benefits per 100 people ($)": 0,
        "SA3 group": "4",
      },
      {
        "Medicare benefits per 100 people ($)": 0,
        "SA3 group": "5",
      },
      {
        "Medicare benefits per 100 people ($)": 0,
        "SA3 group": "6",
      },
    ];

    // Dotted line average
    if (!component.averageLine) {
      // Add line
      component.averageLine = component.svg
        .append("path")
        .attr("d", d => lineGenerator(zeroDataLine))
        .classed("dotted", true)
        .attr("fill", "none")
        .attr(
          "stroke",
          props.hideDottedLine ? "rgba(255, 255, 255, 0.0)" : "black"
        )
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", `5, 2`)
        .style("opacity", 0.0);

      component.averageLine
        .transition()
        .duration(transitionTime || DOTS_UPDATE_DURATION + sa3s.length)
        .attr("d", d => lineGenerator(averageDotsData))
        .style("opacity", props.hideDottedLine ? 0.0 : 1.0);
    } else if (averageDotsData.length > 0) {
      // Update line
      component.averageLine
        .transition()
        .duration(
          transitionTime ||
            DOTS_UPDATE_DURATION + sa3s.length * ANIMATION_OFFSET
        )
        .attr(
          "stroke",
          props.hideDottedLine ? "rgba(255, 255, 255, 0.0)" : "black"
        )
        .style("opacity", props.hideDottedLine ? 0.0 : 1.0)
        .attr("d", d => lineGenerator(averageDotsData));
    } else {
      component.averageLine
        .transition()
        .duration(
          transitionTime ||
            DOTS_UPDATE_DURATION + sa3s.length * ANIMATION_OFFSET
        )
        .style("opacity", 0.0)
        .end()
        .then(() => {
          component.averageLine.attr("d", d => lineGenerator(zeroDataLine));
        })
        .catch(e => null);
    }

    // Process dots D3 data join
    const dotsDots = component.svg
      .selectAll("circle.dots")
      .data(sa3s, d => d["SA3 name"])
      .join(
        enter =>
          enter
            .append("circle")
            .classed("dots", true)
            .classed("dots-testimony-target", d => {
              if (d["SA3 name"] === dotsDataKey.testimonialSa3) return true;
              else return false;
            })
            .classed("dots-own-dot", d => {
              if (
                userSa3 &&
                d["SA3 name"] === userSa3.name &&
                props.labelOwnDot
              )
                return true;
              else return false;
            })
            .style("stroke", "rgba(255, 255, 255, 1.0)")
            .style("stroke-width", "0.9")
            .style("fill", d => {
              if (props.showLowHighDots) {
                if (d["SA3 name"] === lowest["SA3 name"]) return "black";
                if (d["SA3 name"] === highest["SA3 name"]) return "black";
              }

              if (props.labelOwnDot && userSa3) {
                if (d["SA3 name"] === userSa3.name) return "black";
              }

              return dotsDataKey.dotColor;
            })
            .attr("cx", d => component.scaleX(d[dotsDataKey.xField]))
            .attr("r", dotRadius)
            .attr("cy", component.scaleY(0))
            .style("opacity", d => {
              if (d[dotsDataKey.yField] === "NP") return 0.0;
              return 1.0;
            })
            .call(enter => {
              if (enter.empty()) return;

              const ownDotTarget = d3.select(".dots-own-dot");
              if (!ownDotTarget.empty()) ownDotTarget.raise();

              enter
                .transition()
                .duration(transitionTime || DOTS_ENTER_DURATION)
                .delay((d, i) => i * ANIMATION_OFFSET) // Maybe don't do this effect
                .attr("cy", d => {
                  if (d[dotsDataKey.yField] === "NP")
                    return component.scaleY(0);
                  return component.scaleY(d[dotsDataKey.yField]);
                });
            }),
        update =>
          update
            .classed("dots-testimony-target", d => {
              if (d["SA3 name"] === dotsDataKey.testimonialSa3) return true;
              else return false;
            })
            .classed("dots-own-dot", d => {
              if (
                userSa3 &&
                d["SA3 name"] === userSa3.name &&
                props.labelOwnDot
              )
                return true;
              else return false;
            })
            .attr("cx", d => {
              return component.scaleX(d[dotsDataKey.xField]);
            })
            .call(update => {
              if (update.empty()) return;

              return update
                .transition()
                .duration(transitionTime || DOTS_UPDATE_DURATION)
                .delay((d, i) => i * ANIMATION_OFFSET) // Animation effect
                .style("fill", d => {
                  if (props.showLowHighDots) {
                    if (d["SA3 name"] === lowest["SA3 name"]) return "black";
                    if (d["SA3 name"] === highest["SA3 name"]) return "black";
                  }

                  if (props.labelOwnDot && userSa3) {
                    if (d["SA3 name"] === userSa3.name) return "black";
                  }

                  return dotsDataKey.dotColor;
                })
                .style("opacity", d => {
                  if (d[dotsDataKey.yField] === "NP") return 0.0;
                  return 1.0;
                })
                .attr("cy", d => {
                  if (d[dotsDataKey.yField] === "NP")
                    return component.scaleY(0);
                  return component.scaleY(d[dotsDataKey.yField]);
                });
            }),
        exit =>
          exit
            .call(exit => {
              if (exit.empty()) return;
            })
            .transition()
            .duration(transitionTime || DOTS_EXIT_DURATION)
            .style("opacity", 0.0)
            .remove()
      )
      .style("display", d => {
        // Hide ungrouped SA3s
        if (d["SA3 group"] === "ungrouped") return "none";
        // if (d[dotsDataKey.yField] === "NP") return "none";
        return "block";
      });

    // Dots on top (z-axis)
    dotsDots.raise();
  };

  const processAverageLines = transitionTime => {
    let collectedAverageLabels = [];

    const lineAverage = d3
      .line()
      .defined(d => !isNaN(d))
      .x((d, i) => component.scaleX(i + 1))
      .y(d => component.scaleY(d));

    component.svg
      .selectAll("path.average-line")
      .data(averageData, d => {
        return d.key;
      })
      .join(
        enter =>
          enter
            .append("path")
            .classed("average-line", true)
            .attr("fill", "none")
            .attr("stroke", d => d.color || "steelblue")
            .attr("stroke-width", 2.3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => lineAverage(d.values))
            .each(function (d) {
              const path = d3.select(this);

              // Get the length of the line
              const totalLength = this.getTotalLength();
              const lineBox = path.node().getBBox();
              const lastValue = d.values[d.values.length - 1];
              const yPos = component.scaleY(lastValue);

              let collectedLabel = {
                text: d.name,
                color: d.color,
                x: lineBox.x + lineBox.width,
                y: yPos,
              };

              collectedAverageLabels.push(collectedLabel);

              // Short circuit label appearance later
              component.dontSetAverageLabels = false;

              // Animate the path
              path
                .attr("stroke-dasharray", `${totalLength},${totalLength}`)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(transitionTime || LINE_ANIMATION_DURATION)
                .attr("stroke-dashoffset", 0)
                .end()
                .then(() => {
                  if (!component.dontSetAverageLabels)
                    setAverageLineLabels(collectedAverageLabels);
                });
            }),
        update =>
          update
            .attr("d", d => lineAverage(d.values))
            .each(function (d) {
              const path = d3.select(this);
              const lineBox = path.node().getBBox();
              const lastValue = d.values[d.values.length - 1];
              const yPos = component.scaleY(lastValue);

              let collectedLabel = {
                text: d.name,
                color: d.color,
                x: lineBox.x + lineBox.width,
                y: yPos,
              };

              collectedAverageLabels.push(collectedLabel);

              setAverageLineLabels(collectedAverageLabels);
            }),
        exit =>
          exit.remove().call(exit => {
            if (exit.empty()) return;

            setAverageLineLabels([]);
          })
      );
  };

  // Initial layout effect run once on mount
  useEffect(() => {
    // Use intersection observer to trigger animation to start
    // only afer we scroll the chart into view
    let callback = (entries, observer) => {
      entries.forEach(entry => {
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
      threshold: 0.9,
    });

    observer.observe(root.current);

    // Do on unmount
    return () => {
      component.svg = null;
      observer.disconnect();
    };
  }, []);

  // Handle initial chart draw and also chart updates
  useEffect(() => {
    // Wait till we have an svg mounted
    if (!component.svg) return;

    const isYAxisTransition = prevYMax === props.yMax;
    const yResizeAmount = Math.abs(windowSize.height - prevWindowSize.height);
    const xResizeAmount = Math.abs(windowSize.width - prevWindowSize.width);

    // Don't resize on trivial resizes (eg. mobile browser scroll hide address bar)
    if (mobileAndTabletCheck()) {
      if (yResizeAmount > 0 && yResizeAmount < 128 && xResizeAmount === 0)
        return;
    }

    // const iOS =
    //   /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // const iw = iOS ? screen.width : window.innerWidth,
    //   ih = iOS ? screen.height : window.innerHeight;

    const width = component.svg.node().getBoundingClientRect().width;
    const height = windowSize.height; //window.innerHeight;

    component.svg.attr("width", width);
    component.svg.attr("height", height);

    // Recalculate margins
    const margin = calculateMargins(width, height);

    // Update component state for calculated values
    setMargin(margin);
    setSvgWidth(width);

    // Just make local scale functions again
    component.scaleX = d3
      .scalePoint()
      .domain(xTicks)
      .range([margin.left, width - margin.right]);

    component.scaleY = d3
      .scaleLinear()
      .domain([0, props.yMax])
      .range([height - margin.bottom, margin.top]);

    // Recalculate axis generators
    const makeXAxis = g =>
      g.attr("transform", `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(component.scaleX)
          .tickFormat("")
          .tickValues(xTicks.filter(tick => typeof tick === "string"))
          .tickSize(props.chartType === "line" ? 0 : 6)
      );

    const makeYAxis = group =>
      group
        .attr("transform", `translate(${margin.left},0)`)
        .transition()
        .duration(isYAxisTransition ? 0 : Y_AXIS_DURATION) // Only transition on yMax
        .call(
          d3
            .axisLeft(component.scaleY)
            .tickPadding([3])
            .tickSize(-(width - margin.left - margin.right))
            .ticks(props.chartType === "line" ? 10 : 5)
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

    // setRightEdge(width - margin.right);

    // Actually update the axes in the SVG
    component.xAxis.call(makeXAxis);
    component.yAxis.call(makeYAxis);

    // Re-process all charts up update
    // The param sets transition time
    // First tried at 0 but of course this means false
    // in JS land.
    if (hasBeenDocked) processCharts(!isYAxisTransition ? false : 1);
  }, [windowSize.width, windowSize.height, props.chartType, props.yMax]);

  useEffect(() => {
    // const iOS =
    //   /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // const iw = iOS ? screen.width : window.innerWidth,
    //   ih = iOS ? screen.height : window.innerHeight;

    // setChartHeight(ih - margin.top - margin.bottom);
    setChartHeight(windowSize.height - margin.top - margin.bottom || 100);
  }, [margin]);

  // Detect docked or not so we can wait to animate
  useEffect(() => {
    if (!component.svg) {
      // Attach the chart once we know if we are docked
      // (or not)
      initChart();
      return;
    }

    if (isDocked) {
      // if (!hasBeenDocked && props.triggerOnDock) {
      if (props.triggerOnDock) {
        setHasBeenDocked(true);
        setLinesDataKey(props.lines);
        setDotsDataKey(props.dots);
        setAverageData(props.averages);
        component.renderBars = true;
        setHighlightBars(props.highlightBars || []);
        setOwnQuintile(props.userQuintile);
        setOwnRegion(props.userRegion);
      }
    } else {
      // For now let's remove data when un-docking...
      // (Maybe don't do this in the end product)
      setLinesDataKey([
        {
          lineName: "line1",
          dataKey: "empty",
        },
        {
          lineName: "line2",
          dataKey: "empty",
        },
      ]);

      setDotsDataKey({ dataKey: "empty" });
      component.renderBars = false;
      setHighlightBars([]);
      setOwnQuintile(null);
      setOwnRegion(null);
      setAverageData([]);
    }
  }, [isDocked]);

  // Calculate which vertical bars need to be highlighted
  useEffect(() => {
    if (!component.svg) return;
    // TODO: make this logic:
    // for highlightBars state
    // if (!hasBeenDocked) return;

    // Dirty hack to force hide the bars on undock
    // due to ownQuintile and ownRegion putting them back in...
    if (!component.renderBars) {
      setHighlightBars([]);
      return;
    }

    let bars = [];

    if (props.highlightBars) {
      bars.push(...props.highlightBars);
    }

    if (props.highlightOwnBar & (props.chartType === "line")) {
      if (!bars.includes(ownQuintile)) {
        bars.push(ownQuintile);
      }
    }

    if (props.highlightOwnBar & (props.chartType === "dot")) {
      if (!bars.includes(ownRegion)) {
        bars.push(ownRegion);
      }
    }

    setHighlightBars(bars);
  }, [props.highlightOwnBar, props.highlightBars, ownQuintile, ownRegion]);

  useEffect(() => {
    setLinesDataKey(props.lines);
  }, [props.lines]);

  useEffect(() => {
    setDotsDataKey(props.dots);
  }, [props.dots]);

  useEffect(() => {
    setAverageData(props.averages);
  }, [props.averages]);

  useEffect(() => {
    if (isDocked || hasBeenDocked) processCharts();
  }, [linesDataKey, dotsDataKey, averageData]);

  useEffect(() => {
    setChartTitle(props.chartTitle);
  }, [props.chartTitle]);

  // Calculate values for return
  const chartWidth = svgWidth - margin.left - margin.right;
  // const chartHeight = window.innerHeight - margin.top - margin.bottom;

  return (
    <div className={styles.root}>
      <div
        className={styles.highlightBars}
        style={{ top: margin.top, left: margin.left, width: chartWidth }}
      >
        {props.chartType === "line" && (
          <>
            <span
              className={styles.lineHighlightBar}
              style={{
                height: highlightBars.includes(1)
                  ? `${chartHeight + BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                flexGrow: 1,
                borderLeft: `2px solid ${BAR_BORDER_COLOR}`,
                borderRight: `1px solid ${BAR_BORDER_COLOR}`,
                backgroundColor: highlightBars.includes(1)
                  ? BAR_HIGHLIGHT_COLOR
                  : BAR_COLOR,
              }}
            ></span>
            <span
              className={styles.lineHighlightBar}
              style={{
                height: highlightBars.includes(2)
                  ? `${chartHeight + BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                flexGrow: 1,
                borderLeft: `1px solid ${BAR_BORDER_COLOR}`,
                borderRight: `1px solid ${BAR_BORDER_COLOR}`,
                backgroundColor: highlightBars.includes(2)
                  ? BAR_HIGHLIGHT_COLOR
                  : BAR_COLOR,
              }}
            ></span>
            <span
              className={styles.lineHighlightBar}
              style={{
                height: highlightBars.includes(3)
                  ? `${chartHeight + BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                flexGrow: 1,
                borderLeft: `1px solid ${BAR_BORDER_COLOR}`,
                borderRight: `1px solid ${BAR_BORDER_COLOR}`,
                backgroundColor: highlightBars.includes(3)
                  ? BAR_HIGHLIGHT_COLOR
                  : BAR_COLOR,
              }}
            ></span>
            <span
              className={styles.lineHighlightBar}
              style={{
                height: highlightBars.includes(4)
                  ? `${chartHeight + BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                flexGrow: 1,
                borderLeft: `1px solid ${BAR_BORDER_COLOR}`,
                borderRight: `1px solid ${BAR_BORDER_COLOR}`,
                backgroundColor: highlightBars.includes(4)
                  ? BAR_HIGHLIGHT_COLOR
                  : BAR_COLOR,
              }}
            ></span>
            <span
              className={styles.lineHighlightBar}
              style={{
                height: highlightBars.includes(5)
                  ? `${chartHeight + BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                flexGrow: 1,
                borderLeft: `1px solid ${BAR_BORDER_COLOR}`,
                borderRight: `2px solid ${BAR_BORDER_COLOR}`,
                backgroundColor: highlightBars.includes(5)
                  ? BAR_HIGHLIGHT_COLOR
                  : BAR_COLOR,
              }}
            ></span>
          </>
        )}

        {props.chartType === "dot" && (
          <>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(1)
                  ? `${
                      chartHeight +
                      (windowSize.width < 600
                        ? DOT_BAR_HEIGHT_EXTEND_MOBILE
                        : DOT_BAR_HEIGHT_EXTEND)
                    }px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                // Previously we had different colours for own bar
                backgroundColor: highlightBars.includes(1)
                  ? ownRegion === 1 && props.highlightOwnBar
                    ? BAR_HIGHLIGHT_COLOR
                    : BAR_HIGHLIGHT_COLOR //props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(2)
                  ? `${
                      chartHeight +
                      (windowSize.width < 600
                        ? DOT_BAR_HEIGHT_EXTEND_MOBILE
                        : DOT_BAR_HEIGHT_EXTEND)
                    }px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(2)
                  ? ownRegion === 2 && props.highlightOwnBar
                    ? BAR_HIGHLIGHT_COLOR
                    : BAR_HIGHLIGHT_COLOR //props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(3)
                  ? `${
                      chartHeight +
                      (windowSize.width < 600
                        ? DOT_BAR_HEIGHT_EXTEND_MOBILE
                        : DOT_BAR_HEIGHT_EXTEND)
                    }px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(3)
                  ? ownRegion === 3 && props.highlightOwnBar
                    ? BAR_HIGHLIGHT_COLOR
                    : BAR_HIGHLIGHT_COLOR //props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(4)
                  ? `${
                      chartHeight +
                      (windowSize.width < 600
                        ? DOT_BAR_HEIGHT_EXTEND_MOBILE
                        : DOT_BAR_HEIGHT_EXTEND)
                    }px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(4)
                  ? ownRegion === 4 && props.highlightOwnBar
                    ? BAR_HIGHLIGHT_COLOR
                    : BAR_HIGHLIGHT_COLOR //props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(5)
                  ? `${
                      chartHeight +
                      (windowSize.width < 600
                        ? DOT_BAR_HEIGHT_EXTEND_MOBILE
                        : DOT_BAR_HEIGHT_EXTEND)
                    }px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(5)
                  ? ownRegion === 5 && props.highlightOwnBar
                    ? BAR_HIGHLIGHT_COLOR
                    : BAR_HIGHLIGHT_COLOR //props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(6)
                  ? `${
                      chartHeight +
                      (windowSize.width < 600
                        ? DOT_BAR_HEIGHT_EXTEND_MOBILE
                        : DOT_BAR_HEIGHT_EXTEND)
                    }px`
                  : `${chartHeight}px`,
                backgroundColor: highlightBars.includes(6)
                  ? ownRegion === 6 && props.highlightOwnBar
                    ? BAR_HIGHLIGHT_COLOR
                    : BAR_HIGHLIGHT_COLOR //props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
          </>
        )}
      </div>
      <svg className={"scatter-plot"} ref={root}></svg>

      <div
        className={styles.chartAxisKey}
        style={{ top: margin.top, left: margin.left - 30 }}
      >
        {props.chartType !== "line" ? (
          <>
            <div className={styles.rebatesY}>
              Medicare rebates per 100 people ($)
            </div>
            <div
              className={styles.titleUnder}
              style={{ color: props.dots ? props.dots.dotColor : "inherit" }}
            >
              {chartTitle ? chartTitle : <span>&nbsp;</span>}
            </div>
          </>
        ) : (
          <div className={styles.proportionY}>Proportion of persons</div>
        )}
      </div>

      {props.chartType === "line" && (
        <div
          className={styles.tickTextContainer}
          style={{
            top: chartHeight + margin.top,
            left: margin.left,
            width: `${chartWidth}px`,
          }}
        >
          <div className={styles.tickTextBox}>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>

          <div className={styles.tickDescription}>
            <div
              style={{
                width: `${chartWidth / 5 - TICK_TEXT_MARGIN}px`,
              }}
            >
              Most disadvantaged
            </div>
            <div
              style={{
                width: `${chartWidth / 5 - TICK_TEXT_MARGIN}px`,
              }}
            >
              Least disadvantaged
            </div>
          </div>
        </div>
      )}
      {props.chartType === "dot" && (
        <div
          className={styles.tickTextContainer}
          style={{
            top: chartHeight + margin.top,
            left: margin.left,
            width: `${chartWidth}px`,
          }}
        >
          <div className={styles.dotTickTextBox}>
            <span
              style={{
                width: `${chartWidth / 6 - TICK_TEXT_MARGIN}px`,
              }}
            >
              Remote
            </span>
            <span
              style={{
                width: `${chartWidth / 6 - TICK_TEXT_MARGIN}px`,
              }}
            >
              Outer regional
            </span>
            <span
              style={{
                width: `${chartWidth / 6 - TICK_TEXT_MARGIN}px`,
              }}
            >
              Inner regional
            </span>
            <span
              style={{
                width: `${chartWidth / 6 - TICK_TEXT_MARGIN}px`,
              }}
            >
              Major city low advan&shy;tage
            </span>
            <span
              style={{
                width: `${chartWidth / 6 - TICK_TEXT_MARGIN}px`,
              }}
            >
              Major city medium advan&shy;tage
            </span>
            <span
              style={{
                width: `${chartWidth / 6 - TICK_TEXT_MARGIN}px`,
              }}
            >
              Major city high advan&shy;tage
            </span>
          </div>
        </div>
      )}

      {/* LABELS */}

      <TransitionGroup className={styles.transitionGroup}>
        {lineLabels.map((label, index) => {
          return (
            <CSSTransition key={index} timeout={0} classNames={"item"}>
              <div
                className={styles.lineLabel}
                key={index}
                style={{ top: label.y, left: label.x }}
              >
                {label.text}
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      <TransitionGroup className={styles.transitionGroup}>
        {dotTopBottomLabels.map((label, index) => {
          return (
            <CSSTransition key={index} timeout={500} classNames={"item"}>
              <div
                className={`${styles.dotLabel} ${
                  label.align === "right" ? styles.alignRight : ""
                } ${label.type === "low" ? styles.baseline : ""}`}
                style={{ top: label.y, left: label.x }}
                key={index}
              >
                {label.text}
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      {/* When a user selects an area these show up in the scrollyteller */}
      <TransitionGroup className={styles.transitionGroup}>
        {dotCustomLabels.map((label, index) => {
          return (
            <CSSTransition key={index} timeout={400} classNames={"item"}>
              <div
                className={styles.customLabelDot}
                style={{ top: label.y, left: label.x }}
              ></div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      <TransitionGroup className={styles.transitionGroup}>
        {dotCustomLabels.map((label, index) => {
          return (
            <CSSTransition key={index} timeout={500} classNames={"item"}>
              <div
                className={`${styles.dotCustomLabel} ${
                  label.align === "right" ? styles.alignRight : ""
                }`}
                style={{ top: label.y, left: label.x }}
                key={index}
              >
                {label.text}
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      {/* Average line labels */}
      <TransitionGroup className={styles.transitionGroup}>
        {averageLineLabels.map((label, index) => {
          return (
            <CSSTransition key={index} timeout={500} classNames={"item"}>
              <div
                className={`${styles.lineLabel} ${styles.averageLabel}`}
                style={{ top: label.y, left: label.x, color: label.color }}
              >
                {label.text}
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      {/* Testimonial animated dot */}

      <TransitionGroup className={styles.transitionGroup}>
        {testimonalDots.map((label, index) => {
          return (
            <CSSTransition key={label.text} timeout={400} classNames={"item"}>
              <div
                className={
                  label.color === "#980400"
                    ? styles.testimonialDotRed
                    : styles.testimonialDot
                }
                style={{
                  top: label.y - PULSE_RADIUS,
                  left: label.x - PULSE_RADIUS,
                }}
              ></div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      <TransitionGroup className={styles.transitionGroup}>
        {testimonalDots.map((label, index) => {
          return (
            <CSSTransition key={label.text} timeout={400} classNames={"item"}>
              <div
                className={styles.testimonialReplacementDot}
                style={{ top: label.y, left: label.x }}
              ></div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      <TransitionGroup className={styles.transitionGroup}>
        {testimonalDots.map((label, index) => {
          return (
            <CSSTransition key={label.text} timeout={500} classNames={"item"}>
              <div
                className={`${styles.dotCustomLabel} ${
                  label.align === "right" ? styles.alignRight : ""
                }`}
                style={{ top: label.y, left: label.x }}
              >
                {label.text}
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    </div>
  );
};

// Set default props
MultiChart.defaultProps = {
  chartType: "dot",
};

export default MultiChart;
