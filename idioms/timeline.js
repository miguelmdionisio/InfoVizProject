function createTimeline() {
    // Set up dimensions and margins for the SVG container
    const margin = { top: 0, right: 20, bottom: 0, left: 20 };
    const width = window.innerWidth - 200;
    const height = 30  - margin.top - margin.bottom;

    timelineStartYear = new Date(minYear, 0, 1);
    timelineEndYear = new Date(maxYear, 0, 1);

    // Append the SVG element to the timeline div
    const svg = d3.select("#timeline")
        .append("svg")
        .append("g")
        .attr("height", 50)
        .attr("transform", `translate(${margin.left * 6}, ${margin.top})`);

    // Define the scale for the timeline (years 1990 to 2023)
    timelineXScale = d3.scaleTime()
        .domain([new Date(minYear, 0, 1), new Date(maxYear, 0, 1)])
        .range([0, width]);

    // Define the axis using the scale
    const xAxis = d3.axisBottom(timelineXScale)
        .ticks(33)  // Number of ticks, representing each year
        .tickFormat((d, i) => d.getFullYear() % 5 === 0 ? d3.timeFormat("%Y")(d) : ""); // Show year only for multiples of 5F

    // Append the x-axis to the SVG
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(xAxis);

    // Add slider circles for start and end years
    const sliderGroup = svg.append("g").attr("class", "sliders");

    timelineStartSlider = sliderGroup.append("circle")
        .attr("class", "slider start")
        .attr("cx", timelineXScale(timelineStartYear))
        .attr("cy", height / 2)
        .attr("r", 8)
        .style("fill", "#F0D2D1");

    timelineEndSlider = sliderGroup.append("circle")
        .attr("class", "slider end")
        .attr("cx", timelineXScale(timelineEndYear))
        .attr("cy", height / 2)
        .attr("r", 8)
        .style("fill", "#8EB19D");

    // Create a tooltip div
    const tooltip = d3.select("#tooltip").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0); // Start hidden

    // Add a line between the two sliders to indicate the selected range
    timelineRangeLine = sliderGroup.append("line")
        .attr("class", "range-line")
        .attr("x1", timelineXScale(timelineStartYear))
        .attr("x2", timelineXScale(timelineEndYear))
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "#999")
        .attr("stroke-width", 4);

    // Update line and constrain dragging behavior to keep startYear <= endYear
    d3.selectAll(".slider").call(d3.drag()
        .on("start", function (event, d) {
            tooltip.style("opacity", 1); // Show tooltip
        })
        .on("drag", function (event, d) {
            if (d3.select(this).classed("start")) {
                let newX = Math.min(timelineXScale(timelineEndYear), Math.max(0, event.x));
                timelineStartYear = timelineXScale.invert(newX);
                d3.select(this).attr("cx", timelineXScale(timelineStartYear));

                const sliderBounds = timelineStartSlider.node().getBoundingClientRect();
                tooltip.html(`${getClosestYear(timelineStartYear)}`) // Update tooltip text
                    .style("left", `${sliderBounds.left + window.scrollX - 10}px`) // Use slider's left position
                    .style("top", `${sliderBounds.top + window.scrollY - 30}px`) // Adjust top position
                    .style("opacity", 1);

            } else if (d3.select(this).classed("end")) {
                let newX = Math.max(timelineXScale(timelineStartYear), Math.min(width, event.x));
                timelineEndYear = timelineXScale.invert(newX);
                d3.select(this).attr("cx", timelineXScale(timelineEndYear));

                const sliderBounds = timelineEndSlider.node().getBoundingClientRect();
                tooltip.html(`${getClosestYear(timelineEndYear)}`) // Update tooltip text
                    .style("left", `${sliderBounds.left + window.scrollX - 10}px`) // Use slider's left position
                    .style("top", `${sliderBounds.top + window.scrollY - 30}px`) // Adjust top position
                    .style("opacity", 1);
            }
            updateRangeLine(timelineStartYear, timelineEndYear);
            updateHighlight();
        })
        .on('end', function (event) { // snap to closest year
            tooltip.style("opacity", 0); // Hide tooltip

            if (d3.select(this).classed("start")) {
                timelineStartYear = new Date(getClosestYear(timelineStartYear), 0, 1);
                d3.select(this).attr("cx", timelineXScale(timelineStartYear));
            } else if (d3.select(this).classed("end")) {
                timelineEndYear = new Date(getClosestYear(timelineEndYear), 0, 1);
                d3.select(this).attr("cx", timelineXScale(timelineEndYear));
            }
            updateRangeLine(timelineStartYear, timelineEndYear);
        })
    );

    // d3.csv("../../data/economic_events.csv").then(function(data) {
    //     const uniqueEventNames = [...new Set(data.map(d => d.event_name))];

    //     const select = d3.select("#event-select");

    //     uniqueEventNames.forEach(eventName => {
    //         select.append("option")
    //             .attr("value", eventName)
    //             .text(eventName);
    //     });

    //     function handleEventChange() {
    //         const selectedOptions = Array.from(select.node().selectedOptions).map(option => option.value);

    //         const selectedSet = new Set(selectedOptions);
    //         const selectedEventsData = data.filter(d => selectedSet.has(d.event_name));
    //         const eventsYears = selectedEventsData.map(d => ({
    //             event_name: d.event_name,
    //             year_start: d.year_start,
    //             year_end: d.year_end
    //         }));
    //         updateSlidersBasedOnEventSelection(eventsYears);
    //     }

    //     function clearSelection() {
    //         select.selectAll("option").property("selected", false);
    //         handleEventChange();
    //     }

    //     select.on("change", handleEventChange);
    //     d3.select("#clear-selection").on("click", clearSelection);

    // }).catch(function(error) {
    //     console.error("Error loading the CSV file:", error);
    // });
      
}

function getClosestYear(date) {
    const currentYear = date.getFullYear();
    const jan1CurrentYear = new Date(currentYear, 0, 1);
    const jan1NextYear = new Date(currentYear + 1, 0, 1);
    const diffToCurrentYear = Math.abs(date - jan1CurrentYear);
    const diffToNextYear = Math.abs(date - jan1NextYear);
    return diffToCurrentYear <= diffToNextYear ? currentYear : currentYear + 1;
}

// Update the range line positions whenever the sliders are dragged
function updateRangeLine(start, end) {
    timelineRangeLine
        .attr("x1", timelineXScale(start))
        .attr("x2", timelineXScale(end));
}