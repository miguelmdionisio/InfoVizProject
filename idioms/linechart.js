function createLineChart(data) {

    // Append SVG to the chart div
    lineChartSVG = d3.select("#lineChart")
        .append("svg")
        .attr("height", lineChartHeight + 50)
        .append("g")
        .attr("transform", `translate(${lineChartMargin.left}, ${lineChartMargin.top})`);

    // set up shadow highlights
    createShadowHighlights("Default");
    for (const e of events) {
        createShadowHighlights(e.name);
    }

    // Scales
    const xScale = d3.scaleLinear().range([0, lineChartWidth]);
    let yScale = d3.scaleLinear().range([lineChartHeight, 0]);

    // Axis definitions
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d => `${d / 1e9}`);

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
                return { year: year, gdp: +d[year] };
            }),
            selected: true
        };
    });

    // Set domain for xScale and yScale
    xScale.domain(d3.extent(years));
    yScale.domain([0, d3.max(countries, c => d3.max(c.values, v => v.gdp))]);

    // Setup range selection brush and attach it to svg
    const brush = d3.brush()
        .extent([[0, 0], [lineChartWidth, lineChartHeight]])
        .on("start brush end", brushed)
        .keyModifiers(false);
    const brushGroup = lineChartSVG.append("g")
        .attr("class", "brush")
        .call(brush);

    // Range selection brush function
    function brushed({ selection }) {
        if (selection === null) {
            countries.forEach(d => d.selected = true);
            lineChartSVG.selectAll(".line")
                .style("opacity", 1.0);
            selectionOngoing = false;
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
                    d.selected = true;
                    d3.select(this).style("opacity", "1.0");
                } else {
                    if (!shiftIsPressed || !selectionOngoing) {
                        d.selected = false;
                        d3.select(this).style("opacity", "0.1");
                    }
                }
            });

        selectionOngoing = true;
    }

    // Add x-axis to the chart
    lineChartSVG.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${lineChartHeight})`)
        .call(xAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("x", lineChartWidth)
        .attr("y", 15)
        .attr("text-anchor", "end")
        .text("Year");

    // Add y-axis to the chart
    lineChartSVG.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("x", 6)
        .attr("dy", "-0.5em")
        .attr("text-anchor", "end")
        .text("GDP (Billions $)");

    // Set up color scale for the lines
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

    // Add line for each country
    lineChartSVG.selectAll(".line")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .attr("stroke", d => southernCountries.includes(d.name) ? "#9E6240" : "#206087")
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .style("opacity", 1.0)
        .on("mouseover", function(event, d) {
            d3.select(this).style("cursor", "pointer").style("stroke-width", 3);
            tooltip.style("opacity", 1);
        })
        .on("mousemove", function(event, d) {
            const [mouseX, mouseY] = d3.pointer(event);
            const closestYear = Math.round(xScale.invert(mouseX));
            const closestData = d.values.find(v => v.year === closestYear);
    
            if (closestData) {
                tooltip.html(`<strong>${d.name}</strong><br>Year: ${closestData.year}<br>GDP: ${(closestData.gdp / 1e9).toFixed(3)} B$`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 30}px`);
            }
        })
        .on("mouseleave", function(event, d) {
            d3.select(this).style("stroke-width", "1.5px");
            tooltip.style("opacity", 0);
    
            if (!d.selected) {
                d3.select(this).style("opacity", "0.1");
            }
        })
        .on("click", function (event, d) {
            if (!shiftIsPressed) {
                dismissBrush();
                countries.forEach(d => d.selected = false);
                lineChartSVG.selectAll(".line")
                    .style("opacity", 0.1);
            }

            d.selected = !d.selected;
            d3.select(this).style("stroke-width", "1.5px");
            d3.select(this).style("opacity", d.selected ? "1.0" : "0.1");
            selectionOngoing = d.selected;
        });

    function dismissBrush() {
        brushGroup.call(brush.move, null);
    }

    d3.select("#resetButton").on("click", () => {
        countries.forEach(d => d.selected = true);
        lineChartSVG.selectAll(".line")
            .style("opacity", 1.0);
        dismissBrush();
        selectionOngoing = false;
    });

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
            .attr("width", 60)
            .attr("height", lineChartHeight + 20)
            .attr("transform", `translate(0, 10)`);

        const yControlScale = d3.scaleLinear()
            .domain([0, maxGDP])
            .range([lineChartHeight, 0]);

        const yControlAxis = d3.axisRight(yControlScale)
            .ticks(6)
            .tickFormat(d => `${d / 1e9}B`);

        yAxisControl.append("g")
            .attr("transform", `translate(30, 10)`)
            .call(yControlAxis);

        const sliderGroup = yAxisControl.append("g")
            .attr("class", "sliders")
            .attr("transform", `translate(0, 10)`);

        const minSlider = sliderGroup.append("circle")
            .attr("cx", 30)
            .attr("cy", yControlScale(0))
            .attr("r", 8)
            .style("fill", "tomato")
            .style("opacity", 0.3);

        const maxSlider = sliderGroup.append("circle")
            .attr("cx", 30)
            .attr("cy", yControlScale(maxGDP))
            .attr("r", 8)
            .attr("fill", "green")
            .attr("opacity", 0.3);

        const tooltip = d3.select("#tooltip")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        minSlider.call(d3.drag()
            .on("drag", function (event) {
                const newY = Math.min(yControlScale.range()[0], Math.max(event.y, yControlScale.range()[1]));
                d3.select(this).attr("cy", newY);
                updateYAxisFromSliders();

                const sliderBounds = minSlider.node().getBoundingClientRect();
                tooltip.html(`${(yControlScale.invert(newY) / 1e9).toFixed(0)}B`)
                    .style("left", `${sliderBounds.left + window.scrollX + 10}px`)
                    .style("top", `${sliderBounds.top + window.scrollY - 30}px`)
                    .style("opacity", 1);
            })
            .on("end", function () {
                tooltip.style("opacity", 0);
            })
        );
        
        maxSlider.call(d3.drag()
            .on("drag", function (event) {
                const newY = Math.min(yControlScale.range()[0], Math.max(event.y, yControlScale.range()[1]));
                d3.select(this).attr("cy", newY);
                updateYAxisFromSliders();

                const sliderBounds = maxSlider.node().getBoundingClientRect();
                tooltip.html(`${(yControlScale.invert(newY) / 1e9).toFixed(0)}B`)
                    .style("left", `${sliderBounds.left + window.scrollX + 10}px`)
                    .style("top", `${sliderBounds.top + window.scrollY - 30}px`)
                    .style("opacity", 1);
            })
            .on("end", function () {
                tooltip.style("opacity", 0);
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

    createYaxisControl();
    updateHighlight();
    updateChordDiagrams();
}
