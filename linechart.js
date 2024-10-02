/*
TODO:
width height hardcoded
filter, interaction in general
tooltip worth it?
color according to gdp (add gdp data)
*/
var migrationData;

function startDashboard() {
    d3.csv("../data/net_migration.csv")
    .then((data) => {
        migrationData = data;
        
        migrationData.forEach(d => {
            for (let key in d) {
                if (!isNaN(+d[key])&& key !== "Country Name" && key !== "Country Code") {
                    d[key] = +d[key];
                }
            }
        });

        createLineChart(migrationData);
    })
}


//todo move this to a separate file
//todo width and heioght are currently hardcoded
function createLineChart(data){
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

    const allValues = data.flatMap(d => d3.range(1991, 2021).map(year => d[year]));
    //console.log(allValues);
    console.log(d3.min(allValues), d3.max(allValues));
    const yScale = d3.scaleLinear()
    .domain([d3.min(allValues), d3.max(allValues)])
    .range([500, 0]);

    const line = d3.line()
    .x((d, i) => xScale(1991 + i))
    .y(d => yScale(d));

    const color = d3.scaleOrdinal(d3.schemeCategory10); //all different colors for now

     
    svg.selectAll(".line")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", d => color(d["Country Name"]))
    .attr("stroke-width", 1.5)
    .attr("d", d => {
        const values = d3.range(1991, 2021).map(year => d[year]);
        return line(values);
    }) //todo very poor mouse over interaction
    .on("mouseover", function(event, d) {
        d3.select(this)
        .attr("stroke-width", 3);
        svg.append("text")
        .attr("class", "title-text")
        .style("fill", color(d["Country Name"]))
        .text(d["Country Name"])
        .attr("x", 700)
        .attr("y", yScale(d[2020]));

    })
    .on("mouseout", function(event, d) {
        d3.select(this)
        .attr("stroke-width", 1.5);
        svg.selectAll(".title-text").
        remove();
    });

    //todo x axis is in y=0, but rn its too cluttered
    svg.append("g")
        .attr("transform", `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));


    //eixo y
    svg.append("g")
    .call(d3.axisLeft(yScale));

}