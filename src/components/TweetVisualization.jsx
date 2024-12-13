import "./TweetVisualization.css";

import { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

class TweetVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlightedPoints: [],
    };
  }

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.data !== this.props.data ||
      prevProps.chartType !== this.props.chartType
    ) {
      this.renderChart();
    }
  }

  handleCircleClick = (pointData, event) => {
    const { highlightedPoints } = this.state;
    const isSelected = highlightedPoints.find((p) => p.id === pointData.id);

    if (isSelected) {
      this.setState({
        highlightedPoints: highlightedPoints.filter(
          (p) => p.id !== pointData.id
        ),
      });
    } else {
      this.setState({
        highlightedPoints: [...highlightedPoints, pointData],
      });
    }

    const circle = d3.select(event.target);
    const strokeColor = isSelected ? "none" : "black";
    circle.attr("stroke", strokeColor);
  };

  renderChart = () => {
    const { data, chartType } = this.props;
    const { highlightedPoints } = this.state;

    if (data.length === 0) return;

    const margin = { top: 20, right: 80, bottom: 50, left: 100 },
      width = 506 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

    d3.select(".container").html("");

    const container = d3.select(".container").style("display", "flex");

    const chartsDiv = container
      .append("div")
      .style("display", "flex")
      .style("flex", "1")
      .style("flex-direction", "column");

    const legend = container
      .append("div")
      .classed("legend", true)
      .style("width", "300px")
      .style("margin-left", "10px");

    const groupedData = new Map();
    data.forEach((entry) => {
      const month = entry["Month"];

      if (!groupedData.has(month)) {
        groupedData.set(month, []);
      }

      groupedData.get(month).push(entry);
    });

    updateColors = () => {
      const { chartType } = this.props;

      const legend = d3.select(".legend");
      legend.selectAll("svg").remove();

      if (chartType === "Sentiment") {
        const sentimentColorScaling = d3
          .scaleLinear()
          .domain([-1, 0, 1])
          .range(["red", "#ECECEC", "green"]);

        const legendWidth = 20;
        const legendHeight = 200;

        const legendSvg = legend
          .append("svg")
          .attr("width", legendWidth + 150)
          .attr("height", legendHeight + 50);

        const legendGroup = legendSvg
          .append("g")
          .attr("transform", `translate(0, 10)`);

        const gradient = "legendGradient";

        const defs = legendGroup.append("defs");

        const linearGradient = defs
          .append("linearGradient")
          .attr("id", gradient)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "0%")
          .attr("y2", "100%");

        linearGradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "green");

        linearGradient
          .append("stop")
          .attr("offset", "50%")
          .attr("stop-color", "#ECECEC");

        linearGradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "red");

        legendGroup
          .append("rect")
          .style("fill", `url(#${gradient})`)
          .attr("width", legendWidth)
          .attr("height", legendHeight);

        const legendScale = d3
          .scaleLinear()
          .domain([1, -1])
          .range([0, legendHeight]);

        const legendAxis = d3
          .axisRight(legendScale)
          .tickValues([1, -1])
          .tickFormat((d) => (d === 1 ? "Positive" : "Negative"));

        legendGroup
          .append("g")
          .attr("transform", `translate(${legendWidth}, 0)`)
          .call(legendAxis);
      } else if (chartType === "Subjectivity") {
        const subjectivityColorScaling = d3
          .scaleLinear()
          .domain([0, 1])
          .range(["#ECECEC", "#4467C4"]);

        const legendWidth = 20;
        const legendHeight = 200;

        const legendSvg = legend
          .append("svg")
          .attr("width", legendWidth + 150)
          .attr("height", legendHeight + 50);

        const legendGroup = legendSvg
          .append("g")
          .attr("transform", `translate(0, 10)`);

        const gradient = "subjectivityGradient";

        const defs = legendGroup.append("defs");

        const linearGradient = defs
          .append("linearGradient")
          .attr("id", gradient)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "0%")
          .attr("y2", "100%");

        linearGradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "#4467C4");

        linearGradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#ECECEC");

        legendGroup
          .append("rect")
          .style("fill", `url(#${gradient})`)
          .attr("width", legendWidth)
          .attr("height", legendHeight);

        const legendScale = d3
          .scaleLinear()
          .domain([1, 0])
          .range([0, legendHeight]);

        const legendAxis = d3
          .axisRight(legendScale)
          .tickValues([1, 0])
          .tickFormat((d) => (d === 1 ? "High" : "Low"));

        legendGroup
          .append("g")
          .attr("transform", `translate(${legendWidth}, 0)`)
          .call(legendAxis);
      }
    };

    groupedData.forEach((monthData, month) => {
      const currsvg = chartsDiv
        .append("div")
        .style("margin-bottom", "20px")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      const g = currsvg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const nodes = monthData.map((d, i) => ({
        id: i,
        x: d["Dimension 1"],
        y: d["Dimension 2"],
        sentiment: d["Sentiment"],
        subjectivity: d["Subjectivity"],
        rawTweet: d["RawTweet"],
        radius: 5,
      }));

      const simulation = d3
        .forceSimulation(nodes)
        .force("collision", d3.forceCollide().radius(6))
        .force(
          "x",
          d3.forceX((d, i) => (i % Math.floor(width / 10)) * 10)
        )
        .force(
          "y",
          d3.forceY((d, i) => Math.floor(i / Math.floor(width / 10)) * 10)
        )
        .on("tick", () => {
          node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        });

      const node = g
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", (d) =>
          chartType === "Sentiment"
            ? d3
                .scaleLinear()
                .domain([-1, 0, 1])
                .range(["red", "#ECECEC", "green"])(d.sentiment)
            : d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"])(
                d.subjectivity
              )
        )
        .attr("stroke", (d) =>
          highlightedPoints.find((p) => p.id === d.id) ? "black" : "none"
        )
        .attr("stroke-width", 2)
        .on("click", (event, d) => this.handleCircleClick(d, event));

      currsvg
        .append("text")
        .attr("x", margin.left - 60)
        .attr("y", (height + 10) / 2)
        .style("font-weight", "bold")
        .text(month);
    });

    this.updateColors();
  };

  render() {
    const { highlightedPoints } = this.state;

    return (
      <>
        <div
          className="container"
          style={{
            display: "flex",
            gap: "1rem",
            width: "20rem",
            marginTop: "1.5rem",
          }}
        />{" "}
        {highlightedPoints.length > 0 && (
          <div>
            <ul style={{ listStyleType: "none" }}>
              {highlightedPoints.map((point, index) => (
                <li key={index}>{point.rawTweet}</li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }
}

TweetVisualization.propTypes = {
  chartType: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
};

export default TweetVisualization;
