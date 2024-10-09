let shiftIsPressed = false;
let selectionOngoing = false;

const minYear = 1991;
const maxYear = 2023;

// Dimensions for the chart
const lineChartMargin = {top: 20, right: 80, bottom: 10, left: 80},
lineChartWidth = window.innerWidth - 200,
lineChartHeight = window.innerHeight/2 - 200;

let lineChartSVG;

//todo width and height are currently hardcoded
function createLineChart(data) {
    // Append SVG to the chart div
    lineChartSVG = d3.select("#lineChart")
        .append("svg")
        .attr("height", lineChartHeight + 50)
        .append("g")
        .attr("transform", `translate(${lineChartMargin.left * 1.5}, ${lineChartMargin.top})`);

    // timespan background shade
    lineChartSVG.append("rect")
        .attr("class", "highlight")
        .attr("fill", "#d3d3d3")
        .attr("opacity", 0.5)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", lineChartHeight);

    lineChartSVG.append("rect")
        .attr("class", "highlight-pre")
        .attr("fill", "#F0D2D1")
        .attr("opacity", 0.5)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", lineChartHeight);
    lineChartSVG.append("rect")
        .attr("class", "highlight-post")
        .attr("fill", "#8EB19D")
        .attr("opacity", 0.5)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", lineChartHeight);

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
                }
                else {
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

    // Add line for each country
    const countryLines = lineChartSVG.selectAll(".line")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .attr("stroke", d => color(d.name))
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .style("opacity", 1.0)
        .on("mouseover", function (event, d) {
            d3.select(this).style("cursor", "pointer").style("stroke-width", 3);
            d3.select(this).style("opacity", "1.0");
        })
        .on("mouseleave", function (event, d) {
            d3.select(this).style("stroke-width", "1.5px");
            if (!d.selected) {
                d3.select(this).style("opacity", "0.1");
            }
        })
        .on("mousemove", function (event, d) { // Display tooltip with country name and closest gdp horizontally
            const [mouseX] = d3.pointer(event);
            const closestYear = Math.round(xScale.invert(mouseX));
            const closestData = d.values.find(v => v.year === closestYear);

            if (closestData) {
                d3.select(this)
                    .select("title")
                    .remove();

                d3.select(this)
                    .append("title")
                    .text(`${d.name} \nYear: ${closestData.year}\nGDP: ${(closestData.gdp / 1e9).toFixed(3)} B$`);
            } else console.log("no data", closestYear);

            d3.select(this).style("opacity", "1.0");
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

    // Add zoom behavior for the y-axis
    const zoom = d3.zoom()
        .scaleExtent([0.5, 100])
        .translateExtent([[0, 0], [lineChartWidth, lineChartHeight]])
        .on("zoom", zoomed);

    lineChartSVG.call(zoom);

    lineChartSVG.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", lineChartWidth)
        .attr("height", lineChartHeight);

    lineChartSVG.selectAll(".line")
    .attr("clip-path", "url(#clip)");


    let y0 = yScale.domain()[0];
    let y1 = yScale.domain()[1];
    //console.log("INITIAL Y0: ", (y0 / 1e9).toFixed(2), "Y1: ", (y1 / 1e9).toFixed(2));
    let previousTransformK;


    function zoomed(event) {
        const transform = event.transform;
        let newY0;
        
        const [mouseX, mouseY] = d3.pointer(event);
        const centerY = yScale.invert(mouseY);
        
        const newYScale = transform.rescaleY(yScale);
        //console.log("newYScale", (newYScale.domain()[0] / 1e9).toFixed(2), (newYScale.domain()[1] / 1e9).toFixed(2));
    

        //top of bottom 10% of y axis
        var bottom10 = newYScale.domain()[1] * 0.1;
        // console.log("bottom10", bottom10);
        // console.log("mouse em", (centerY/1e9).toFixed(2));
        
        if (centerY < bottom10) {
            newY0 = y0;
        } else {newY0 = centerY - (centerY - newYScale.domain()[0]) / (transform.k);}

        let newY1 = centerY + (newYScale.domain()[1] - centerY) / (transform.k);

        y0 = newY0;
        y1 = newY1;
        //console.log("zoom on value", (newYScale.invert(mouseY)/1e9).toFixed(2));
        // console.log("Y0: ", (newY0 / 1e9).toFixed(2), "Y1: ", (newY1 / 1e9).toFixed(2));
    
        const clampedYDomain = [
            Math.max(newY0, yScale.domain()[0]),
            Math.min(newY1, yScale.domain()[1])
        ];
        newYScale.domain(clampedYDomain);
    
        // Redefine y-axis and update lines
        lineChartSVG.select(".y.axis")
            .call(d3.axisLeft(newYScale).tickFormat(d => `${d / 1e9} B$`));
    
        lineChartSVG.selectAll(".line")
            .attr("d", d => line.y(d => newYScale(d.gdp))(d.values));

        previousTransformK = transform.k;

    }

    updateHighlight(minYear, maxYear);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        shiftIsPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        shiftIsPressed = false;
    }
});

function updateHighlight(startYear, endYear) {
    const xScale = d3.scaleTime()
                    .domain([new Date(minYear, 1, 1), new Date(maxYear, 1, 1)])
                    .range([0, lineChartWidth]);
 
    const xStart = xScale(new Date(startYear, 1, 1));
    const xEnd = xScale(new Date(endYear, 1, 1));

    const xStartPre = xScale(new Date(Math.max(minYear, startYear - 2), 1, 1));
    const xEndPost = xScale(new Date(Math.min(maxYear, endYear + 2), 1, 1));
 
    lineChartSVG.select(".highlight")
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xStart)
        .attr("width", xEnd - xStart);

    lineChartSVG.select(".highlight-pre")
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xStartPre)
        .attr("width", Math.max(0, xStart - xStartPre));

    lineChartSVG.select(".highlight-post")
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xEnd)
        .attr("width", Math.max(0, xEndPost - xEnd));
}

