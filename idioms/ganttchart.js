function createGanttChart(data) {

    const margin = { top: 10, right: 20, bottom: 0, left: 20 };
    const width = window.innerWidth - 200;
    const height = 110  - margin.top - margin.bottom;

    const tasks = [];
    let taskIdx = 0;
    for (const item of data) {
        // TODO: keep this or?
        // if (item.year_start < minYear || item.year_end > maxYear) {
        //     continue;
        // }

        const task = {
            task: item.event_name,
            startDate: new Date(item.year_start, 1, 1),
            endDate: new Date(item.year_end, 1, 1),
            row: taskIdx % 2 ? 2 : 1 // alternate rows
        };
        taskIdx++;
        tasks.push(task);
    }

    const svg = d3.select("#ganttchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left * 6}, ${margin.top})`);

    const x = d3.scaleTime()
        .domain([new Date(minYear, 0, 1), new Date(maxYear, 0, 1)])
        .range([0, width]);

    const rows = Array.from(new Set(tasks.map(d => d.row)));
    const rowScale = d3.scaleBand()
        .domain(rows)
        .range([0, height])
        .padding(0.5);

    svg.selectAll(".bar")
        .data(tasks)
        .enter()
        .append("rect")
        .attr("class", "ganttbar")
        .attr("x", d => x(d.startDate))
        .attr("y", d => rowScale(d.row))
        .attr("width", d => x(d.endDate) - x(d.startDate))
        .attr("height", rowScale.bandwidth())

        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "#92b0d1");
    
            // hover label
            svg.append("text")
              .attr("class", "hover-label")
              .attr("id", "hoverLabel" + d.task.replace(/\s+/g, ''))
              .attr("x", x(d.startDate))
              .attr("y", rowScale(d.row) - 5)
              .attr("font-size", 14)
              .text(d.task);
          })

          .on("mouseout", function(event, d) {
            d3.select(this)
            .transition()
            .duration(200)
            .style("fill", "#456990");
    
            d3.select("#hoverLabel" + d.task.replace(/\s+/g, '')).remove();
          })
          
          .on("mouseup", function(event, d) {
            updateSlidersBasedOnEventSelection(d);
          });

}

function updateSlidersBasedOnEventSelection(selectedEvent) {
    startSlider.attr("cx", timelineXScale(selectedEvent.startDate));
    endSlider.attr("cx", timelineXScale(selectedEvent.endDate));
    updateRangeLine();
    updateHighlight(getClosestYear(selectedEvent.startDate), getClosestYear(selectedEvent.endDate));
}


/* DON'T DELETE THIS */
// function updateSlidersBasedOnEventSelection(selectionData) {
//     let year_start, year_end;
//     if (selectionData.length == 0) {
//         year_start = minYear;
//         year_end = maxYear;
//     } else {
//         year_start = Math.max(minYear, Number(selectionData[0].year_start));
//         year_end = Math.min(maxYear, Number(selectionData[0].year_end));
//     }

//     startYear = new Date(year_start, 0, 1);
//     endYear = new Date(year_end, 0, 1);

//     startSlider.attr("cx", xScale(startYear));
//     endSlider.attr("cx", xScale(endYear));

//     updateRangeLine();
//     updateHighlight(getClosestYear(startYear), getClosestYear(endYear));
// }