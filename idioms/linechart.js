let lineTooltip;
let previouslySelectedCountries;

function createLineChart(data) {

    // Append SVG to the chart div
    lineChartSVG = d3.select("#lineChart")
        .append("svg")
        .attr("height", lineChartHeight + 50)
        .append("g")
        .attr("transform", `translate(${lineChartMargin.left}, ${lineChartMargin.top})`);

    // set up shadow highlights
    createShadowHighlights("Default", minYear, maxYear);
    for (const e of events) {
        createShadowHighlights(e.name, e.startDate.getFullYear(), e.endDate.getFullYear());
    }

    // setup tooltip
    const tooltip = d3.select("#lineTooltip").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0) // start hidden
        .style("left", (window.innerWidth / 2) + "px")
        .style("top", (window.innerHeight / 2) + "px");

    // Scales
    const xScale = d3.scaleLinear().range([0, lineChartWidth]);
    let yScale = d3.scaleLinear().range([lineChartHeight, 0]);

    // Axis definitions
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d => `${d / 1e12}`);

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.gdp));

    const years = Object.keys(data[0]).filter(d => d !== "Country Name" && d !== "Country Code").map(Number);

    // Convert data to the required format
    const countries = data.map(d => {
        return {
            name: d["Country Name"],
            values: years
                .filter(year => year >= minYear && year <= maxYear)
                .map(year => {
                    return { year: year, gdp: +d[year] };
                })
        };
    });

    // Set domain for xScale and yScale
    xScale.domain(d3.extent(years.filter(year => year >= minYear && year <= maxYear)));
    yScale.domain([0, d3.max(countries, c => d3.max(c.values, v => v.gdp))]);

    // Setup range selection brush and attach it to svg
    const brush = d3.brush()
        .extent([[0, 0], [lineChartWidth, lineChartHeight]])
        .on("start brush end", brushed)
        .on("start", brushStart)
        .keyModifiers(false);
    const brushGroup = lineChartSVG.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushStart() {
        if (shiftIsPressed) {
            previouslySelectedCountries = [...selectedCountries];
        } else previouslySelectedCountries = [];
    }
    
    // Range selection brush function
    function brushed({ selection }) {
        if (selection === null) {
            return;
        }

        const [[x0, y0], [x1, y1]] = selection;

        lineChartSVG.selectAll(".line")
            .each(function (d) {
                const intersects = d.values.some(point => {
                    const x = xScale(point.year);
                    const y = yScale(point.gdp);
                    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
                });

                if (intersects) {
                    addToListOfCountries(d.name, "selection");
                }
                else {
                    if (!previouslySelectedCountries.includes(d.name)) removeFromListOfCountries(d.name, "selection");
                }
            });
    }

    // Add x-axis to the chart
    lineChartSVG.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${lineChartHeight})`)
        .call(xAxis)
        .append("text")
        .attr("fill", axesColor)
        .attr("x", lineChartWidth)
        .attr("y", 28)
        .attr("text-anchor", "end")
        .text("Year");

    // Add y-axis to the chart
    lineChartSVG.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("fill", axesColor)
        .attr("x", 20)
        .attr("dy", "-0.5em")
        .attr("text-anchor", "end")
        .text("GDP (K Billions, $)");

    // Add line for each country
    lineChartSVG.selectAll(".line")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .attr("stroke", d => southernCountries.includes(d.name) ? southernCountriesColor : northernCountriesColor)
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .style("opacity", 1.0)
        .on("mouseover", function (event, d) {
            addToListOfCountries(d.name, "hover");
        })
        .on("mouseleave", function (event, d) {
            removeFromListOfCountries(d.name, "hover");
            tooltip.style("opacity", 0);
        })
        .on("mousemove", function (event, d) { // display tooltip with country name and closest gdp horizontally
            const [mouseX] = d3.pointer(event);
            const closestYear = Math.round(xScale.invert(mouseX));
            const closestData = d.values.find(v => v.year === closestYear);

            if (closestData) {
                tooltip
                    .style("opacity", 1)
                    .html(d.name + ", " + closestData.year + "<br>GDP: " + (closestData.gdp / 1e12).toFixed(0) + "K B$") // update tooltip text
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");

            } else tooltip.style("opacity", 0);
        })
        .on("click", function (event, d) {
            console.log("here");
            dismissBrush();
            if (!shiftIsPressed) {
                emptyListOfCountries("selection");
            }

            const countryName = d.name;
            if (countryIsInListOfCountries(countryName, "selection")) removeFromListOfCountries(countryName, "selection");
            else addToListOfCountries(countryName, "selection");
        });

    function dismissBrush() {
        brushGroup.call(brush.move, null);
    }

    lineChartSVG.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", lineChartWidth)
        .attr("height", lineChartHeight);

    lineChartSVG.selectAll(".line")
        .attr("clip-path", "url(#clip)");


    // Zoom substitute to control Y Axis
    function createYaxisControl() {
        const yAxisControl = d3.select("#yAxisControls")
            .append("svg")
            .attr("id", "yAxisControl")
            .attr("width", 20)
            .attr("height", lineChartHeight + 20)
            .attr("transform", `translate(0, 10)`);

        const yControlScale = d3.scaleLinear()
            .domain([0, maxGDP])
            .range([lineChartHeight, 0]);

        const yControlAxis = d3.axisRight(yControlScale)
            .ticks(6)
            .tickFormat(d => "");

        yAxisControl.append("g")
            .attr("transform", `translate(30, 10)`)
            .call(yControlAxis);

        const sliderGroup = yAxisControl.append("g")
            .attr("class", "sliders")
            .attr("transform", `translate(0, 10)`);

        const minSlider = sliderGroup.append("circle")
            .attr("class", "slider start")
            .attr("cx", 30)
            .attr("cy", yControlScale(0))
            .attr("r", 8)
            .style("fill", timelineRangeLineColor);

        const maxSlider = sliderGroup.append("circle")
            .attr("class", "slider end")
            .attr("cx", 30)
            .attr("cy", yControlScale(maxGDP))
            .attr("r", 8)
            .attr("fill", timelineRangeLineColor);

        // const tooltip = d3.select("#tooltip")
        //     .append("div")
        //     .attr("class", "tooltip")
        //     .style("opacity", 0);

        minSlider.call(d3.drag()
            .on("drag", function (event) {
                const newY = Math.min(yControlScale.range()[0], Math.max(event.y, yControlScale.range()[1]));
                d3.select(this).attr("cy", newY);
                updateYAxisFromSliders();

                // const sliderBounds = minSlider.node().getBoundingClientRect();
                // tooltip.html(`${(yControlScale.invert(newY) / 1e9).toFixed(0)}B`)
                //     .style("left", `${sliderBounds.left + window.scrollX + 10}px`)
                //     .style("top", `${sliderBounds.top + window.scrollY - 30}px`)
                //     .style("opacity", 1);
            })
            .on("end", function () {
                // tooltip.style("opacity", 0);
            })
        );
        
        maxSlider.call(d3.drag()
            .on("drag", function (event) {
                const newY = Math.min(yControlScale.range()[0], Math.max(event.y, yControlScale.range()[1]));
                d3.select(this).attr("cy", newY);
                updateYAxisFromSliders();

                // const sliderBounds = maxSlider.node().getBoundingClientRect();
                // tooltip.html(`${(yControlScale.invert(newY) / 1e9).toFixed(0)}B`)
                //     .style("left", `${sliderBounds.left + window.scrollX + 10}px`)
                //     .style("top", `${sliderBounds.top + window.scrollY - 30}px`)
                //     .style("opacity", 1);
            })
            .on("end", function () {
                // tooltip.style("opacity", 0);
            })
        );

        function updateYAxisFromSliders() {
            const newMinY = yControlScale.invert(minSlider.attr("cy"));
            const newMaxY = yControlScale.invert(maxSlider.attr("cy"));

            if (newMinY < newMaxY) {
                yScale.domain([newMinY, newMaxY]);
                lineChartSVG.select(".y.axis").call(yAxis);

                lineChartSVG.selectAll(".line")
                    .attr("d", d => line(d.values));
            }
        }
    }

    lineChartSVG.on("click", function(event) {
        dismissBrush();
        const isLineClick = d3.select(event.target).classed("line");
        if (!isLineClick && !shiftIsPressed) emptyListOfCountries("selection");
    });

    // // country color legend
    // var svg = d3.select("#countryLegend");
    // svg.append("circle").attr("cx",200).attr("cy",130).attr("r", 6).style("fill", "#69b3a2");
    // svg.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "#404080");
    // svg.append("text").attr("x", 220).attr("y", 130).text("variable A").style("font-size", "15px").attr("alignment-baseline","middle");
    // svg.append("text").attr("x", 220).attr("y", 160).text("variable B").style("font-size", "15px").attr("alignment-baseline","middle");


    createYaxisControl(); 
    updateHighlight();

}

function updateHoveredLines() {
    const nodeList = lineChartSVG.selectAll(".line")._groups[0];
    for (const node of nodeList) {
        const countryData = node.__data__;
        const countryName = countryData.name;

        d3.select(node).style("stroke-width", "1.5px");
        d3.select(node).style("opacity", "1.0");

        if (countryIsInListOfCountries(countryName, "hover")) {
            d3.select(node).style("cursor", "pointer").style("stroke-width", 3);
            d3.select(node).style("opacity", "1.0");
        } else if (countryIsInListOfCountries(countryName, "selection")) {
            d3.select(node).style("cursor", "pointer").style("stroke-width", 1.5);
            d3.select(node).style("opacity", "1.0");
        } else if (hoveredCountries.length == 0 && selectedCountries.length == 0) {
            d3.select(node).style("opacity", "1.0");
        } else {
            d3.select(node).style("opacity", "0.1");
        }
    }
}

function updateSelectedLines() {
    const nodeList = lineChartSVG.selectAll(".line")._groups[0];
    for (const node of nodeList) {
        const countryData = node.__data__;
        const countryName = countryData.name;

        if (countryIsInListOfCountries(countryName, "selection")) {
            d3.select(node).style("stroke-width", "1.5px");
            d3.select(node).style("opacity", "1.0");
        } else {
            d3.select(node).style("opacity", (selectedCountries.length == 0) ? 1.0 : 0.1);
        }
    }
}
