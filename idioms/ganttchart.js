let ganttSVG;

function createGanttChart(data) {

    const margin = { top: 0, right: 20, bottom: 0, left: 20 };
    const width = window.innerWidth - 200;
    const height = 80  - margin.top - margin.bottom;

    let eventIdx = 0;
    for (const item of data) {
        // TODO: keep this or?
        // if (item.year_start < minYear || item.year_end > maxYear) {
        //     continue;
        // }

        const event = {
            name: item.event_name,
            startDate: new Date(item.year_start, 1, 1),
            endDate: new Date(item.year_end, 1, 1),
            row: eventIdx % 2 ? 2 : 1, // alternate rows
            selected: false
        };
        eventIdx++;
        events.push(event);
    }

    ganttSVG = d3.select("#ganttchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left * 4}, ${margin.top})`);

    ganttSVG.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        .on("mouseup", function() {
            events.forEach((task) => task.selected = false);
            // svg.selectAll(".hover-label").remove();

            timelineStartYear = new Date(minYear, 1, 1);
            timelineEndYear = new Date(maxYear, 1, 1);

            updateSlidersBasedOnEventSelection();
            updateBarSelectionColors();
        });

    const x = d3.scaleTime()
        .domain([new Date(minYear, 0, 1), new Date(maxYear, 0, 1)])
        .range([0, width]);

    const rows = Array.from(new Set(events.map(d => d.row)));
    const rowScale = d3.scaleBand()
        .domain(rows)
        .range([0, height])
        .padding(0.5);

    ganttSVG.selectAll(".bar")
        .data(events)
        .enter()
        .append("rect")
        .attr("class", "ganttbar")
        .attr("x", d => x(d.startDate))
        .attr("y", d => rowScale(d.row))
        .attr("width", d => x(d.endDate) - x(d.startDate))
        .attr("height", rowScale.bandwidth())
        // .append("text")
        //     // .attr("class", "hover-label")
        //     .attr("id", d => "hoverLabel" + d.name.replace(/\s+/g, ''))
        //     .attr("x", d => x(d.startDate))
        //     .attr("y", d => rowScale(d.row) - 5)
        //     .attr("font-size", 14)
        //     .text(d => d.name)

        .on("mouseup", function(event, d) {
            if (!shiftIsPressed) {
                events.forEach((task) => task.selected = false);
            }

            d.selected = true;
            updateSlidersBasedOnEventSelection();
            updateBarSelectionColors();

            // events.forEach((task) => {
            //     if (!task.selected) {
            //         d3.select("#hoverLabel" + task.name.replace(/\s+/g, '')).remove();
            //     }
            // });
        })

        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", highlightedEventsColor);
    
            // if (!svg.select("#hoverLabel" + d.name.replace(/\s+/g, '')).node()) {
            //     // hover label
            //     svg.append("text")
            //         .attr("class", "hover-label")
            //         .attr("id", "hoverLabel" + d.name.replace(/\s+/g, ''))
            //         .attr("x", x(d.startDate))
            //         .attr("y", rowScale(d.row) - 5)
            //         .attr("font-size", 14)
            //         .text(d.name);
            // }
        })

        .on("mouseout", function(event, d) {
            d3.select(this)
            .transition()
            .duration(200)
            .style("fill", d.selected ? highlightedEventsColor : eventsColor);

            // events.forEach((task) => {
            //     if (!task.selected) {
            //         d3.select("#hoverLabel" + task.name.replace(/\s+/g, '')).remove();
            //     }
            // });
        });

    ganttSVG.selectAll(".bar-text")
        .data(events)
        .enter()
        .append("text")
        .attr("class", "hover-label")
        .attr("id", d => "hoverLabel" + d.name.replace(/\s+/g, ''))
        .attr("x", d => x(d.startDate))
        .attr("y", d => rowScale(d.row) - 3)  // Adjust the y position if necessary
        .attr("font-size", 14)
        .text(d => d.name);
}

function updateBarSelectionColors() {
    ganttSVG.selectAll(".ganttbar")
        .transition()
        .duration(200)
        .style("fill", function(d) {
            return d.selected ? highlightedEventsColor : eventsColor;
        });
}

function updateSlidersBasedOnEventSelection() {
    const allNotSelected = events.every(event => event.selected === false);

    const earliestStartDate = allNotSelected ? new Date(minYear, 1, 1) : events
        .filter(event => event.selected)
        .map(event => event.startDate)
        .reduce((earliest, date) => earliest < date ? earliest : date, Infinity) || null;
    timelineStartYear = earliestStartDate;

    const latestEndDate = allNotSelected ? new Date(maxYear, 1, 1) : events
        .filter(event => event.selected)
        .map(event => event.endDate)
        .reduce((latest, date) => latest > date ? latest : date, -Infinity) || null;
    timelineEndYear = latestEndDate;

    timelineStartSlider.attr("cx", timelineXScale(earliestStartDate));
    timelineEndSlider.attr("cx", timelineXScale(latestEndDate));
    updateRangeLine(earliestStartDate, latestEndDate);
    updateHighlight();
    updateChordDiagrams();
    updateChoroplethMap();
}

function updateEventsBasedOnSliderMovement() {
    events.forEach(e => {
        if (e.startDate.getFullYear() == timelineStartYear.getFullYear()
            && e.endDate.getFullYear() == timelineEndYear.getFullYear()) {e.selected = true;}
        else e.selected = false;
    });
    updateBarSelectionColors();
}

function deselectAllEvents() {
    events.forEach(e => {
        e.selected = false;
    });
}
