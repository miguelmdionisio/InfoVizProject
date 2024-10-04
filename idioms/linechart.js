//todo width and height are currently hardcoded
function createLineChart(data){

    // Dimensions for the chart
    const margin = {top: 20, right: 80, bottom: 50, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // Append SVG to the chart div
    const svg = d3.select("#lineChart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    // Axis definitions
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    // Line generator
    const line = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.gdp));

    const years = Object.keys(data[0]).filter(d => d !== "Country Name" && d !== "Country Code").map(Number);

    // Convert data to the required format
    const countries = data.map(d => {
        return {
            name: d["Country Name"],
            values: years.map(year => {
                return {year: year, gdp: +d[year]};
            })
        };
    });

    // Set domain for xScale and yScale
    xScale.domain(d3.extent(years));
    yScale.domain([
        0,
        d3.max(countries, c => d3.max(c.values, v => v.gdp))
    ]);

    // Add x-axis to the chart
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", `translate(0, ${height})`)
       .call(xAxis)
       .append("text")
       .attr("fill", "#000")
       .attr("x", width)
       .attr("y", -10)
       .attr("text-anchor", "end")
       .text("Year");

    // Add y-axis to the chart
    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("fill", "#000")
       .attr("x", 6)
       .attr("dy", "-2em")
       .attr("text-anchor", "end")
       .text("GDP");

    // Set up color scale for the lines
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Add line for each country
    svg.selectAll(".line")
       .data(countries)
       .enter()
       .append("path")
       .attr("class", "line")
       .attr("d", d => line(d.values))
       .attr("stroke", d => color(d.name))
       .attr("stroke-width", 1.5)
       .attr("fill", "none");

    // // Add legend
    // svg.selectAll(".legend")
    //    .data(countries)
    //    .enter()
    //    .append("text")
    //    .attr("x", width - 50)
    //    .attr("y", (d, i) => i * 20)
    //    .attr("dy", "0.35em")
    //    .attr("text-anchor", "start")
    //    .attr("fill", d => color(d.name))
    //    .text(d => d.name);

}