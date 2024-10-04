//todo width and height are currently hardcoded
function createLineChart(data){

    //group by country and year
    let nestedData = d3.group(data, d => d["Origin Country"], d => d["Year"]);

    let lineData = [];
    nestedData.forEach((yearsMap, country) => {
        let countryData = [];

        yearsMap.forEach((yearData, year) => {
            let flow = d3.sum(yearData, d => +d["Flow"] || 0);

            countryData.push({
                year: +year,
                flow: flow
            });
        });

        countryData.sort((a, b) => a.year - b.year);

        lineData.push({
            country: country,
            data: countryData
        });
    });

    console.log(lineData);


    const svg = d3
    .select("#lineChart")
    .append("svg")
    .attr("width", 800)
    .attr("height", 600)
    .append("g")
    .attr("transform", "translate(50,50)");

    const xScale = d3.scaleLinear()
    .domain([1991, 2021])
    .range([0, 700]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(lineData, c => d3.min(c.data, v => v.flow)), 
                 d3.max(lineData, c => d3.max(c.data, v => v.flow))])
        .range([500, 0]);

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.flow));
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,500)")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg.selectAll(".line")
        .data(lineData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.data))
        .style("stroke", "black")
        .style("fill", "none");

}