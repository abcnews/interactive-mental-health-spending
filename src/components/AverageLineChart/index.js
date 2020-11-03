import React, { useRef, useEffect, useState } from "react";
import useWindowSize from "../MultiChart/useWindowSize";
import { Fade } from "@material-ui/core";
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
  sortData,
  calculateMargins,
  xTicks5,
  xTicks6,
  generateAverageData,
  usePrevious,
  lowestHighest,
  processData,
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
const PULSE_RADIUS = 26;

// Chart bar constants
const BAR_COLOR = "rgba(191, 191, 191, 0.1)";
const BAR_HIGHLIGHT_COLOR = "rgba(200, 200, 200, 0.59)";
const BAR_HEIGHT_EXTEND = 22;
const DOT_BAR_HEIGHT_EXTEND = 45;
const BACKGROUND_COLOR = "#f0f0f0";

// Load our data and assign to object
// const dataObject = {
//   empty: [],
//   distressed: require("../MultiChart/data/distressed-data.json"),
//   mentalCondition: require("../MultiChart/data/mental-condition-data.json"),
//   allied: processData(
//     require("../MultiChart/data/1-allied-mental-health.json")
//   ),
//   psychiatrists: processData(require("../MultiChart/data/2-psychiatry.json")),
//   clinicalPsychologists: processData(
//     require("../MultiChart/data/3-clinical-psychologist.json")
//   ),
//   gpMentalHealth: processData(
//     require("../MultiChart/data/4-gp-mental-health.json")
//   ),
//   otherAllied: processData(
//     require("../MultiChart/data/5-other-allied-mental-health.json")
//   ),
//   gpFocus: processData(require("../MultiChart/data/6-gp-focussed.json")),
// };

// The main React function component
const AverageLineChart = props => {
  // const { xField, yField, ...restProps } = props;
  const root = useRef(); // SVG element ref
  const windowSize = useWindowSize();
  const prevYMax = usePrevious(props.yMax);

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
  const [chartTitle, setChartTitle] = useState("");
  const [rightEdge, setRightEdge] = useState();

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

  const processAverageLines = () => {
    console.dir(averageData);
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
                .duration(LINE_ANIMATION_DURATION)
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
      threshold: 0.5,
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

    const width = component.svg.node().getBoundingClientRect().width;
    const height = window.innerHeight * 0.8;

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

    setRightEdge(width - margin.right);

    // Actually update the axes in the SVG
    component.xAxis.call(makeXAxis);
    component.yAxis.call(makeYAxis);

    // Re-process all charts up update
    if (hasBeenDocked) processAverageLines();
  }, [windowSize.width, props.chartType, props.yMax]);

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
        // processMarker();
        setHasBeenDocked(true);
        setLinesDataKey(props.lines);
        setDotsDataKey(props.dots);
        setAverageData(props.averages);
        setOwnQuintile(props.userQuintile);
        setOwnRegion(props.userRegion);
      }
    } else {
      // For now let's remove data when un-docking...
      // (Maybe don't do this in the end product)
      // setLinesDataKey([
      //   {
      //     lineName: "line1",
      //     dataKey: "empty",
      //   },
      //   {
      //     lineName: "line2",
      //     dataKey: "empty",
      //   },
      // ]);
      // setDotsDataKey({ dataKey: "empty" });
      // setHighlightBars([]);
      // setAverageData([]);
      // setOwnQuintile(null);
      // setOwnRegion(null);
    }
  }, [isDocked]);

  // Calculate which vertical bars need to be highlighted
  useEffect(() => {
    if (!component.svg) return;
    // TODO: make this logic:
    // for highlightBars state
    // if (!hasBeenDocked) return;

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
  }, [
    props.highlightOwnBar,
    props.highlightBars,
    hasBeenDocked,
    ownQuintile,
    ownRegion,
  ]);

  useEffect(() => {
    setLinesDataKey(props.lines);
  }, [props.lines]);

  useEffect(() => {
    setDotsDataKey(props.dots);
  }, [props.dots]);

  useEffect(() => {
    if (isDocked || hasBeenDocked) setAverageData(props.averages);
  }, [props.averages]);

  useEffect(() => {
    if (isDocked || hasBeenDocked) processAverageLines();
  }, [averageData]);

  useEffect(() => {
    setChartTitle(props.chartTitle);
  }, [props.chartTitle]);

  // Calculate values for return
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = window.innerHeight - margin.top - margin.bottom;

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
                borderRight: "2px solid #f0f0f0",
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
                borderRight: "2px solid #f0f0f0",
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
                borderRight: "2px solid #f0f0f0",
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
                borderRight: "2px solid #f0f0f0",
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
                  ? `${chartHeight + DOT_BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(1)
                  ? ownRegion === 1 && props.highlightOwnBar
                    ? "#999"
                    : props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(2)
                  ? `${chartHeight + DOT_BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(2)
                  ? ownRegion === 2 && props.highlightOwnBar
                    ? "#999"
                    : props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(3)
                  ? `${chartHeight + DOT_BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(3)
                  ? ownRegion === 3 && props.highlightOwnBar
                    ? "#999"
                    : props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(4)
                  ? `${chartHeight + DOT_BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(4)
                  ? ownRegion === 4 && props.highlightOwnBar
                    ? "#999"
                    : props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(5)
                  ? `${chartHeight + DOT_BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                borderRight: "1px solid #f0f0f0",
                backgroundColor: highlightBars.includes(5)
                  ? ownRegion === 5 && props.highlightOwnBar
                    ? "#999"
                    : props.dots.dotColor
                  : BACKGROUND_COLOR,
              }}
            ></span>
            <span
              className={styles.dotHighlightBar}
              style={{
                height: highlightBars.includes(6)
                  ? `${chartHeight + DOT_BAR_HEIGHT_EXTEND}px`
                  : `${chartHeight}px`,
                backgroundColor: highlightBars.includes(6)
                  ? ownRegion === 6 && props.highlightOwnBar
                    ? "#999"
                    : props.dots.dotColor
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
          <div className={styles.rebatesY}>
            Medicare rebates per 100 people ($)
          </div>
        ) : (
          <div className={styles.proportionY}>Proportion of persons</div>
        )}
      </div>

      <div
        className={styles.chartTitle}
        style={{ top: margin.top, left: rightEdge }}
      >
        <Fade in={props.chartType !== "line"}>
          <span>{chartTitle}</span>
        </Fade>
      </div>

      {props.chartType === "line" && (
        <div
          className={styles.tickTextContainer}
          style={{
            bottom: margin.bottom,
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

      <div
        className={styles.tickTextContainer}
        style={{
          bottom: margin.bottom,
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
            Major city low advantage
          </span>
          <span
            style={{
              width: `${chartWidth / 6 - TICK_TEXT_MARGIN}px`,
            }}
          >
            Major city medium advantage
          </span>
          <span
            style={{
              width: `${chartWidth / 6 - TICK_TEXT_MARGIN}px`,
            }}
          >
            Major city high advantage
          </span>
        </div>
      </div>

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
                className={styles.testimonialDot}
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
AverageLineChart.defaultProps = {
  chartType: "dot",
};

export default AverageLineChart;
