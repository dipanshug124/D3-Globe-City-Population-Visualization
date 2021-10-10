(function (d3) {
  "use strict";

  const svg = d3.select("svg");
  const height = +svg.attr("height");
  const width = +svg.attr("width");

  const render = (data) => {
    const title = "AQI of Pune";
    const xValue = (d) => d.Date;
    const xAxisLabel = "Year";
    const yValue = (d) => d.AQI;
    const yAxisLabel = "AQI";

    const margin = {
      top: 60,
      right: 80,
      bottom: 90,
      left: 90,
    };
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;
    const circleRadius = 2;

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, xValue))
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, yValue))
      .range([innerHeight, 0])
      .nice();

    const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(15);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);

    const yAxisG = g.append("g").call(yAxis);

    yAxisG.selectAll(".domain").remove();

    yAxisG
      .append("text")
      .attr("class", "axis-label")
      .attr("y", -60)
      .attr("x", -innerHeight / 2)
      .attr("fill", "black")
      .attr("transform", `rotate(-90)`)
      .attr("text-anchor", "middle")
      .text(yAxisLabel);

    const xAxisG = g
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${innerHeight})`);

    xAxisG.selectAll(".domain").remove();

    xAxisG
      .append("text")
      .attr("class", "axis-label")
      .attr("y", 75)
      .attr("x", innerWidth / 2)
      .attr("fill", "black")
      .text(xAxisLabel);

    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cy", (d) => yScale(yValue(d)))
      .attr("cx", (d) => xScale(xValue(d)))
      .attr("r", circleRadius);

    g.append("text").attr("class", "title").attr("y", -10).text(title);
  };

  d3.csv("PNQ_AQI.csv").then((data) => {
    data.forEach((d) => {
      console.log(data);
      d.AQI = +d.AQI;
      d.Date = new Date(d.Date);
    });
    render(data);
  });
})(d3);
