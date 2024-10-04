let shiftIsPressed = false;
let selectionOngoing = false;

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
    const yAxis = d3.axisLeft(yScale).tickFormat(d => `${d / 1e9} B$`);

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
            }),
            selected: true
        };
    });

    // Set domain for xScale and yScale
    xScale.domain(d3.extent(years));
    yScale.domain([
        0,
        d3.max(countries, c => d3.max(c.values, v => v.gdp))
    ]);

    // setup range selection brush and attach it to svg
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start brush end", brushed)
        .keyModifiers(false);
    const brushGroup = svg.append("g")
        .attr("class", "brush")
        .call(brush);

    // range selection brush function
    function brushed({selection}) {
        if (selection === null) {
            countries.forEach(d => d.selected = true);
            svg.selectAll(".line")
                .style("opacity", 1.0);
            selectionOngoing = false;
            return
        };
        
        const [[x0, y0], [x1, y1]] = selection;
    
        svg.selectAll(".line")
            .each(function(d) {
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
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", `translate(0, ${height})`)
       .call(xAxis)
       .append("text")
       .attr("fill", "#000")
       .attr("x", width)
       .attr("y", 15)
       .attr("text-anchor", "end")
       .text("Year");

    // Add y-axis to the chart
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("x", 6)
        .attr("dy", "-0.5em")
        .attr("text-anchor", "end")
        .text("GDP (Billions)");

    // Set up color scale for the lines
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Add line for each country
    const countryLines = svg.selectAll(".line")
       .data(countries)
       .enter()
       .append("path")
       .attr("class", "line")
       .attr("d", d => line(d.values))
       .attr("stroke", d => color(d.name))
       .attr("stroke-width", 1.5)
       .attr("fill", "none")
       .style("opacity", 1.0)
       .on("mouseover", function(event, d) {
            d3.select(this).style("cursor", "pointer").style("stroke-width", 3);
            d3.select(this).style("opacity", "1.0");
        })
        .on("mouseleave", function(event, d) {
            d3.select(this).style("stroke-width", "1.5px");
            if (!d.selected) {
                d3.select(this).style("opacity", "0.1");
            }
        })
        .on("mousemove", function(event, d) { // Display tooltip with country name and closest gdp horizontally

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
        .on("click", function(event, d) {
            if (!shiftIsPressed) {
                dismissBrush();
                countries.forEach(d => d.selected = false);
                svg.selectAll(".line")
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
        svg.selectAll(".line")
            .style("opacity", 1.0);
        dismissBrush();
        selectionOngoing = false;
    });

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