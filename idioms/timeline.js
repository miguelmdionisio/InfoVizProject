function createTimeline() {
    // Set up dimensions and margins for the SVG container
    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const width = 840 - margin.left - margin.right;
    const height = 100  - margin.top - margin.bottom;

    let startYear = new Date(minYear, 0, 1);
    let endYear = new Date(maxYear, 0, 1);

    // Append the SVG element to the timeline div
    const svg = d3.select("#timeline")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left + (window.innerWidth/2 - 840/2)}, ${margin.top})`);

    // Define the scale for the timeline (years 1990 to 2023)
    const xScale = d3.scaleTime()
        .domain([new Date(minYear, 0, 1), new Date(maxYear, 0, 1)])
        .range([0, width]);

    // Define the axis using the scale
    const xAxis = d3.axisBottom(xScale)
        .ticks(33)  // Number of ticks, representing each year
        .tickFormat((d, i) => d.getFullYear() % 5 === 0 ? d3.timeFormat("%Y")(d) : ""); // Show year only for multiples of 5F

    // Append the x-axis to the SVG
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(xAxis);

    // Add slider circles for start and end years
    const sliderGroup = svg.append("g").attr("class", "sliders");

    const startSlider = sliderGroup.append("circle")
        .attr("class", "slider start")
        .attr("cx", xScale(startYear))
        .attr("cy", height / 2)
        .attr("r", 8)
        .style("fill", "#F0D2D1");

    const endSlider = sliderGroup.append("circle")
        .attr("class", "slider end")
        .attr("cx", xScale(endYear))
        .attr("cy", height / 2)
        .attr("r", 8)
        .style("fill", "#8EB19D");

    // Create a tooltip div
    const tooltip = d3.select("#tooltip").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0); // Start hidden

    // Add a line between the two sliders to indicate the selected range
    const rangeLine = sliderGroup.append("line")
        .attr("class", "range-line")
        .attr("x1", xScale(startYear))
        .attr("x2", xScale(endYear))
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "#999")
        .attr("stroke-width", 4);

    // Update the range line positions whenever the sliders are dragged
    function updateRangeLine() {
        rangeLine
            .attr("x1", xScale(startYear))
            .attr("x2", xScale(endYear));
    }

    // Update line and constrain dragging behavior to keep startYear <= endYear
    d3.selectAll(".slider").call(d3.drag()
        .on("start", function (event, d) {
            tooltip.style("opacity", 1); // Show tooltip
        })
        .on("drag", function (event, d) {
            if (d3.select(this).classed("start")) {
                let newX = Math.min(xScale(endYear), Math.max(0, event.x));
                startYear = xScale.invert(newX);
                d3.select(this).attr("cx", xScale(startYear));

                const sliderBounds = startSlider.node().getBoundingClientRect();
                tooltip.html(`${getClosestYear(startYear)}`) // Update tooltip text
                    .style("left", `${sliderBounds.left + window.scrollX - 10}px`) // Use slider's left position
                    .style("top", `${sliderBounds.top + window.scrollY - 30}px`) // Adjust top position
                    .style("opacity", 1);

            } else if (d3.select(this).classed("end")) {
                let newX = Math.max(xScale(startYear), Math.min(width, event.x));
                endYear = xScale.invert(newX);
                d3.select(this).attr("cx", xScale(endYear));

                const sliderBounds = endSlider.node().getBoundingClientRect();
                tooltip.html(`${getClosestYear(endYear)}`) // Update tooltip text
                    .style("left", `${sliderBounds.left + window.scrollX - 10}px`) // Use slider's left position
                    .style("top", `${sliderBounds.top + window.scrollY - 30}px`) // Adjust top position
                    .style("opacity", 1);
            }
            updateRangeLine();
        })
        .on('end', function (event) { // snap to closest year
            tooltip.style("opacity", 0); // Hide tooltip

            if (d3.select(this).classed("start")) {
                startYear = new Date(getClosestYear(startYear), 0, 1);
                d3.select(this).attr("cx", xScale(startYear));
            } else if (d3.select(this).classed("end")) {
                endYear = new Date(getClosestYear(endYear), 0, 1);
                d3.select(this).attr("cx", xScale(endYear));
            }
            updateRangeLine();
            updateHighlight(getClosestYear(startYear), getClosestYear(endYear));
        })
    );
}

function getClosestYear(date) {
    const currentYear = date.getFullYear();
    const jan1CurrentYear = new Date(currentYear, 0, 1);
    const jan1NextYear = new Date(currentYear + 1, 0, 1);
    const diffToCurrentYear = Math.abs(date - jan1CurrentYear);
    const diffToNextYear = Math.abs(date - jan1NextYear);
    return diffToCurrentYear <= diffToNextYear ? currentYear : currentYear + 1;
}