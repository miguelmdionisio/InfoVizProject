let legend, legendTextTop, legendTextBottom;
let mapSVG;
let avgUnemployment;

function createChoroplethMap(data) {

    const projection = d3.geoMercator()
        .center([10, 58])
        .scale(340)
        .translate([choroplethMapWidth / 2, choroplethMapHeight / 2]);
    
    const path = d3.geoPath().projection(projection);
    
    mapSVG = d3.select("#choroplethmap").append("svg")
        .attr("width", choroplethMapWidth)
        .attr("height", choroplethMapHeight);
    
    avgUnemployment = data.reduce((acc, dataPoint) => {
        let sum = 0;
        let count = 0;
    
        unemploymentYears.forEach(year => {
            if (year >= timelineStartYear.getFullYear() && year <= timelineEndYear.getFullYear()) {
                sum += +dataPoint[year];
                count++;
            }
        });
    
        const avg = count > 0 ? sum / count : 0;
        acc[dataPoint.Country] = avg;
    
        return acc;
    }, {});

    const minAvg = Math.floor(Math.min(...Object.values(avgUnemployment)));
    const maxAvg = Math.ceil(Math.max(...Object.values(avgUnemployment)));
    const colorScale = d3.scaleSequential(d3.interpolatePurples)
        .domain([minAvg, maxAvg]);

    mapSVG.selectAll("path")
        .data(filteredMapFeatures)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", function(d) {
            const countryName = d.properties.NAME;
            const value = avgUnemployment[countryName];
            return value ? colorScale(value) : undefinedMapCountryColor;
        })
        .on("mouseover", function(d) {
            const country = d.srcElement.__data__;
            const countryName = country.properties.NAME;
            addToListOfCountries(countryName, "hover");

            const avgUnemploymentValue = avgUnemployment[countryName];
            tooltip
                .style("opacity", 1)
                .html(countryName + ": " + avgUnemploymentValue.toFixed(2) + "%") // update tooltip text
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            const country = d.srcElement.__data__;
            const countryName = country.properties.NAME;
            removeFromListOfCountries(countryName, "hover");
            tooltip.style("opacity", 0);
        })
        .on("mouseup", function(d) {
            const country = d.srcElement.__data__;
            const countryName = country.properties.NAME;
            if (countryIsInListOfCountries(countryName, "selection")) removeFromListOfCountries(countryName, "selection");
            else {
                if (!shiftIsPressed) emptyListOfCountries("selection");
                addToListOfCountries(countryName, "selection");
            }
        });

    mapSVG.on("click", function(event) {
        const isCountryClick = d3.select(event.target).classed("country");
        if (!isCountryClick && !shiftIsPressed) emptyListOfCountries("selection");
    });

    // setup tooltip
    const tooltip = d3.select("#mapTooltip").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // LEGEND STUFF

    const legendWidth = 20;
    const legendHeight = choroplethMapHeight;
    const legendX = choroplethMapWidth - 45;
    const legendY = (choroplethMapHeight - legendHeight) / 2 + 20;

    const defs = mapSVG.append("defs");

    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%") // start of gradient
        .attr("y1", "100%") // start at the top
        .attr("x2", "0%") // end of gradient
        .attr("y2", "0%"); // end at the bottom

    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((d, i, nodes) => ({
            offset: `${(100 * i) / (nodes.length - 1)}%`,
            color: colorScale(d)
        })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legend = mapSVG.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");

    legendTextTop = mapSVG.append("text")
        .attr("x", legendX + legendWidth + 5)
        .attr("y", legendY + 20)
        .attr("fill", "black")
        .attr("dy", "-0.3em")
        .text(maxAvg.toFixed(0) + "%")
        .attr("text-anchor", "start");

    legendTextBottom = mapSVG.append("text")
        .attr("x", legendX + legendWidth + 5)
        .attr("y", legendY + legendHeight)
        .attr("fill", "black")
        .attr("dy", "-0.3em")
        .text(minAvg.toFixed(0) + "%")
        .attr("text-anchor", "start");

}

function updateChoroplethMap() {
    if (unemploymentYears == undefined) {
        return;
    }

    avgUnemployment = unemploymentData.reduce((acc, dataPoint) => {
        let sum = 0;
        let count = 0;
    
        unemploymentYears.forEach(year => {
            if (year >= timelineStartYear.getFullYear() && year <= timelineEndYear.getFullYear()) {
                sum += +dataPoint[year];
                count++;
            }
        });
    
        const avg = count > 0 ? sum / count : 0;
        acc[dataPoint.Country] = avg;
    
        return acc;
    }, {});

    const minAvg = Math.min(...Object.values(avgUnemployment));
    const maxAvg = Math.max(...Object.values(avgUnemployment));
    const colorScale = d3.scaleSequential(d3.interpolatePurples)
        .domain([minAvg, maxAvg]);

    d3.selectAll("path.country")
    .transition() // add transition for smooth updating
    .duration(1000) // duration of the transition
    .attr("fill", function(d) {
        const countryName = d.properties.NAME;
        const value = avgUnemployment[countryName];
        return value ? colorScale(value) : undefinedMapCountryColor;
    });

    // update the legend
    legend
        .style("fill", "url(#linear-gradient)");

    // update legend text
    legendTextTop
        .text(maxAvg.toFixed(0) + "%");
    legendTextBottom
        .text(minAvg.toFixed(0) + "%");

    const defs = d3.select("#choroplethmap defs");

    const linearGradient = defs.select("#linear-gradient");

    linearGradient.selectAll("stop").remove(); // clear existing stops

    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((d, i, nodes) => ({
            offset: `${(100 * i) / (nodes.length - 1)}%`,
            color: colorScale(d)
        })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
}

function updateHoveredMapCountries() {
    const nodeList = mapSVG.selectAll("path")._groups[0];
    for (const node of nodeList) {
        const countryName = node.__data__.properties.NAME;
        d3.select(node).classed("hovered", false);

        if (countryIsInListOfCountries(countryName)) {
            d3.select(node)
                .classed("hovered", true);
        }
    }
}

function updateSelectedMapCountries() {
    const nodeList = mapSVG.selectAll("path")._groups[0];
    for (const node of nodeList) {
        const countryName = node.__data__.properties.NAME;
        if (countryIsInListOfCountries(countryName, "selection")) d3.select(node).classed("selected", true);
        else d3.select(node).classed("selected", false);
    }
}
