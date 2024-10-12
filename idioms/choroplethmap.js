// Define margin and dimensions for the charts
const margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 80,
};
const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

globalDataUnemployment = [];

function interpolateRgb(t) {
  return d3.interpolateRgb("#8ce7db", "#2e8377")(t);
}

function updateChoroplethMap(minYear, maxYear) {
  if (maxYear != undefined && minYear != undefined) {
    currentData = [];
    for (let i = 0; i < globalDataUnemployment.length; i++) {
      nextCountry = {};
      nextCountry["country"] = globalDataUnemployment[i].Country;
      total = 0;
      for (let j = minYear; j < maxYear; j++) {
        total += parseInt(globalDataUnemployment[i][j.toString()]);
      }
      nextCountry["unemployment"] = total / (maxYear - minYear);
      currentData.push(nextCountry);
    }

    console.log(currentData);

    const colorScale = d3
      .scaleLog()
      .domain([
        d3.min(currentData, (d) => d.unemployment),
        d3.max(currentData, (d) => d.unemployment),
      ])
      .range([0, 1]);

    const svg = d3.select("#choropleth");

    const mapGroup = svg.select("g");

    currentData.forEach((element) => {
      mapGroup
        .selectAll("path")
        .filter(function (d) {
          return d.properties.NAME == element.country;
        })
        .attr("fill", interpolateRgb(colorScale(element.unemployment)));
    });

    // Create a legend for the choropleth map
    const svg2 = d3
      .select("#choroplethLabel")

    // Create the legend rectangle filled with the color scale gradient
    const legend = svg2.select("g");
    const legendHeight = height - 40;
    const legendWidth = 20;

    legend.selectAll("text").remove();

    // Add tick marks and labels to the legend
    for (let index = 0; index <= 1; index += 0.25) {
      legend
        .append("text")
        .attr("x", legendWidth + 5)
        .attr("y", legendHeight * index)
        .text(Math.round(colorScale.invert(index)));
    }
  }
}

function createChoroplethMap(globalDataUn, globalDataCountries) {
  globalDataCountries = topojson.feature(
    globalDataCountries,
    globalDataCountries.objects.europe
  );
  // Filter the data to remove entries with missing incomeperperson values

  globalDataUnemployment = globalDataUn;

  currentData = [];
  for (let i = 0; i < globalDataUnemployment.length; i++) {
    nextCountry = {};
    nextCountry["country"] = globalDataUnemployment[i].Country;
    total = 0;
    for (let j = minYear; j < maxYear; j++) {
      total += parseInt(globalDataUnemployment[i][j.toString()]);
    }
    nextCountry["unemployment"] = total / (maxYear - minYear);
    currentData.push(nextCountry);
  }

  // Create an SVG element to hold the map
  const svg = d3
    .select("#choropleth")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a group to hold the map elements
  const mapGroup = svg.append("g");

  // Create a color scale for the incomeperperson values
  const colorScale = d3
    .scaleLog()
    .domain([
      d3.min(currentData, (d) => d.unemployment),
      d3.max(currentData, (d) => d.unemployment),
    ])
    .range([0, 1]);

  // Create a projection to convert geo-coordinates to pixel values
  const projection = d3
    .geoMercator()
    .fitSize([width, height], globalDataCountries);

  // Create a path generator for the map
  const path = d3.geoPath().projection(projection);

  // Add countries as path elements to the map
  mapGroup
    .selectAll(".country")
    .data(globalDataCountries.features)
    .enter()
    .append("path")
    .attr("class", "country data")
    .attr("d", path)
    .attr("stroke", "black")
    .append("title")
    .text((d) => d.properties.NAME);

  // Set the fill color of each country based on its incomeperperson value
  currentData.forEach((element) => {
    mapGroup
      .selectAll("path")
      .filter(function (d) {
        return d.properties.NAME == element.country;
      })
      .attr("fill", interpolateRgb(colorScale(element.unemployment)));
  });

  // Create zoom behavior for the map
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", zoomed);

  // Apply zoom behavior to the SVG element
  svg.call(zoom);

  // Function to handle the zoom event
  function zoomed(event) {
    mapGroup.attr("transform", event.transform);
  }

  // Create a legend for the choropleth map
  const svg2 = d3
    .select("#choroplethLabel")
    .append("svg")
    .attr("width", width * 0.2)
    .attr("height", height);

  // Create a gradient for the legend color scale
  const defs = svg2.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", "colorScaleGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", interpolateRgb(0));

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", interpolateRgb(1));

  // Create the legend rectangle filled with the color scale gradient
  const legend = svg2.append("g").attr("transform", `translate(0, 20)`);
  const legendHeight = height - 40;
  const legendWidth = 20;

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#colorScaleGradient)");

  // Add tick marks and labels to the legend
  for (let index = 0; index <= 1; index += 0.25) {
    legend
      .append("text")
      .attr("x", legendWidth + 5)
      .attr("y", legendHeight * index)
      .text(Math.round(colorScale.invert(index)));
  }

}
