/*
TODO:
width height hardcoded
filter, interaction in general
tooltip worth it?
color according to gdp (add gdp data)
*/
var migrationData;

function startDashboard() {
  d3.csv("../data/net_migration.csv").then((data) => {
    migrationData = data;

    migrationData.forEach((d) => {
      for (let key in d) {
        if (
          !isNaN(+d[key]) &&
          key !== "Country Name" &&
          key !== "Country Code"
        ) {
          d[key] = +d[key];
        }
      }
    });

    createLineChart(migrationData);
    createTimeline();
  });
}

// Size for the top graphs
//const width = 550;
//const height = 350;

// Size for the bottom graph
const width = 1200;
const height = 350;

function createTimeline() {
  const width = 1200;
  const height = 30;
  const svg = d3
    .select("#timeline")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const timeScale = d3
    .scaleTime()
    .domain([new Date(1960, 0, 1), new Date(2020, 11, 31)])
    .range([0, width]);

  const axis = d3.axisBottom(timeScale);


  svg.transition()
  .duration(1000) // Duration in milliseconds
  .attr('transform', 'translate(0, -190)');

  svg
    .append("g")
    .attr("transform", `translate(${width / 3}, ${height / 3})`)
    .call(axis);

  const events = [
    { date: new Date(1990, 2, 15), label: "Event 1" },
    { date: new Date(2015, 5, 1), label: "Event 2" },
    { date: new Date(2004, 7, 1), label: "Event 2" },
    { date: new Date(1970, 8, 10), label: "Event 3" },
  ];

  svg.selectAll("circle")
  .data(events)
  .enter()
  .append("circle")
  .attr("cx", d => timeScale(d.date) + width/3)
  .attr("cy", height/3)
  .attr("r", 5)
  .attr("fill", "red");

  svg.selectAll("text")
  .data(events)
  .enter()
  .append("text")
  .attr("x", d => timeScale(d.date))
  .attr("y", height/2 - 10)
  .text(d => d.label)
  .attr("text-anchor", "middle");
}

//todo move this to a separate file
//todo width and heioght are currently hardcoded
function createLineChart(data) {
  const svg = d3
    .select("#lineChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none")
    .append("g")
    .attr("transform", `translate(${width / 3},20)`);

  const xScale = d3.scaleLinear().domain([1991, 2021]).range([0, width]);

  const allValues = data.flatMap((d) =>
    d3.range(1991, 2021).map((year) => d[year])
  );
  //console.log(allValues);
  console.log(d3.min(allValues), d3.max(allValues));
  const yScale = d3
    .scaleLinear()
    .domain([d3.min(allValues), d3.max(allValues)])
    .range([height, 0]);

  const line = d3
    .line()
    .x((d, i) => xScale(1991 + i))
    .y((d) => yScale(d));

  const color = d3.scaleOrdinal(d3.schemeCategory10); //all different colors for now

  svg
    .selectAll(".line")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", (d) => color(d["Country Name"]))
    .attr("stroke-width", 1.5)
    .attr("d", (d) => {
      const values = d3.range(1991, 2021).map((year) => d[year]);
      return line(values);
    }) //todo very poor mouse over interaction
    .on("mouseover", function (event, d) {
      d3.select(this).style("cursor", "pointer").style("stroke-width", 3);
    })
    .on("mouseleave", function (event, d) {
      d3.select(this).style("stroke-width", "1px");
    })
    .append("title")
    .text((d) => d["Country Name"]);

  //todo x axis is in y=0, but rn its too cluttered
  svg
    .append("g")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

  //eixo y
  svg.append("g").call(d3.axisLeft(yScale));
}
