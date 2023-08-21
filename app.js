const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// Fetch the data
d3.json(url).then(data => {
  const baseTemperature = data.baseTemperature;
  const monthlyVariance = data.monthlyVariance;

  // Create the chart
  const width = 1000;
  const height = 500;
  const padding = 60;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([d3.min(monthlyVariance, d => d.year), d3.max(monthlyVariance, d => d.year)])
    .range([padding, width - padding]);

  const yScale = d3.scaleBand()
    .domain([...Array(12).keys()])
    .range([height - padding, padding]);

  // Create color scale
  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([d3.max(monthlyVariance, d => d.variance), d3.min(monthlyVariance, d => d.variance)]);

  // Create cells
  svg.selectAll(".cell")
    .data(monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.month - 1))
    .attr("width", xScale(2) - xScale(1))
    .attr("height", yScale(0) - yScale(1))
    .attr("data-month", d => d.month - 1)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => baseTemperature + d.variance)
    .attr("fill", d => colorScale(d.variance))
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // Add x-axis
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format("d"));
  
  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis);

  // Add y-axis
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(month => {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return months[month];
    });
  
  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  // Create legend
  const legendColors = colorScale.ticks(6);
  const legendWidth = 300 / legendColors.length;

  const legend = d3.select("#legend")
    .append("svg")
    .attr("width", 300)
    .attr("height", 40);
  
  legend.selectAll(".legend-item")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", (d, i) => i * legendWidth)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", 20)
    .attr("fill", d => colorScale(d));

  // Tooltip handlers
  function handleMouseOver(event, d) {
    const tooltip = d3.select("#tooltip");
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`${d.year} - ${d.month}<br>${(baseTemperature + d.variance).toFixed(2)}°C<br>${d.variance.toFixed(2)}°C`)
      .attr("data-year", d.year)
      .style("left", event.pageX + "px")
      .style("top", event.pageY - 28 + "px");
  }

  function handleMouseOut() {
    d3.select("#tooltip").transition().duration(500).style("opacity", 0);
  }
});
