function createTimeline() {
    const margin = { top: 0, right: 20, bottom: 0, left: 20 };
    const width = window.innerWidth - 200;
    const height = 30  - margin.top - margin.bottom;

    timelineStartYear = new Date(minYear, 0, 1);
    timelineEndYear = new Date(maxYear, 0, 1);

    const svg = d3.select("#timeline")
        .append("svg")
        .append("g")
        .attr("height", 50)
        .attr("transform", `translate(${margin.left * 4}, ${margin.top})`);

    timelineXScale = d3.scaleTime()
        .domain([new Date(minYear, 0, 1), new Date(maxYear, 0, 1)])
        .range([0, width]);

    const xAxis = d3.axisBottom(timelineXScale)
        .ticks(33)
        .tickFormat((d, i) => d.getFullYear() % 5 === 0 ? d3.timeFormat("%Y")(d) : "");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(xAxis);

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

    const tooltip = d3.select("#tooltip").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0); // start hidden

    timelineRangeLine = sliderGroup.append("line")
        .attr("class", "range-line")
        .attr("x1", timelineXScale(timelineStartYear))
        .attr("x2", timelineXScale(timelineEndYear))
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "#999")
        .attr("stroke-width", 4);

    d3.selectAll(".slider").call(d3.drag()
        .on("start", function (event, d) {
            tooltip.style("opacity", 1); // show tooltip
        })
        .on("drag", function (event, d) {
            if (d3.select(this).classed("start")) {
                let newX = Math.min(timelineXScale(timelineEndYear), Math.max(0, event.x));
                timelineStartYear = timelineXScale.invert(newX);
                d3.select(this).attr("cx", timelineXScale(timelineStartYear));

                const sliderBounds = timelineStartSlider.node().getBoundingClientRect();
                tooltip.html(`${getClosestYear(timelineStartYear)}`) // update tooltip text
                    .style("left", `${sliderBounds.left + window.scrollX - 10}px`)
                    .style("top", `${sliderBounds.top + window.scrollY - 30}px`)
                    .style("opacity", 1);

            } else if (d3.select(this).classed("end")) {
                let newX = Math.max(timelineXScale(timelineStartYear), Math.min(width, event.x));
                timelineEndYear = timelineXScale.invert(newX);
                d3.select(this).attr("cx", timelineXScale(getClosestYear(timelineEndYear)));

                const sliderBounds = timelineEndSlider.node().getBoundingClientRect();
                tooltip.html(`${getClosestYear(timelineEndYear)}`) // update tooltip text
                    .style("left", `${sliderBounds.left + window.scrollX - 10}px`)
                    .style("top", `${sliderBounds.top + window.scrollY - 30}px`)
                    .style("opacity", 1);
            }
            updateRangeLine(timelineStartYear, timelineEndYear);
            updateHighlight();
        })
        .on('end', function (event) { // snap to closest year
            tooltip.style("opacity", 0); // hide tooltip

            if (d3.select(this).classed("start")) {
                timelineStartYear = new Date(getClosestYear(timelineStartYear), 0, 1);
                d3.select(this).attr("cx", timelineXScale(timelineStartYear));
            } else if (d3.select(this).classed("end")) {
                timelineEndYear = new Date(getClosestYear(timelineEndYear), 0, 1);
                d3.select(this).attr("cx", timelineXScale(timelineEndYear));
            }
            updateRangeLine(timelineStartYear, timelineEndYear);
            updateChordDiagrams();
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

function updateRangeLine(start, end) {
    timelineRangeLine
        .attr("x1", timelineXScale(start))
        .attr("x2", timelineXScale(end));
}