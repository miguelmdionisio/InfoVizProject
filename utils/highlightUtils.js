function updateHighlight() {
    let someSelected = false;

    for (const e of events) {
        if (e.selected) {
            someSelected = true;
            moveShadowHighlight(e.name, e.startDate.getFullYear(), e.endDate.getFullYear());
        } else {
            hideShadowHighlight(e.name);
        }
    }

    if (!someSelected) {
        moveShadowHighlight("Default", timelineStartYear.getFullYear(), timelineEndYear.getFullYear());
    } else {
        hideShadowHighlight("Default");
    }

};

function createShadowHighlights(nickname) {
    lineChartSVG.append("rect")
        .attr("class", "highlight")
        .attr("fill", "#d3d3d3")
        .attr("opacity", 0.5)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", lineChartHeight)
        .attr("id", "mainHighlight" + nickname.replace(/\s+/g, ''));

    lineChartSVG.append("rect")
        .attr("class", "highlight-pre")
        .attr("fill", "#F0D2D1")
        .attr("opacity", 0.5)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", lineChartHeight)
        .attr("id", "preHighlight" + nickname.replace(/\s+/g, ''));
    
    lineChartSVG.append("rect")
        .attr("class", "highlight-post")
        .attr("fill", "#8EB19D")
        .attr("opacity", 0.5)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", lineChartHeight)
        .attr("id", "postHighlight" + nickname.replace(/\s+/g, ''));
};

function moveShadowHighlight(nickname, newStart, newEnd) {
    const xScale = d3.scaleTime()
        .domain([new Date(minYear, 1, 1), new Date(maxYear, 1, 1)])
        .range([0, lineChartWidth]);

    const xStart = xScale(new Date(Math.max(minYear, newStart), 1, 1));
    const xEnd = xScale(new Date(Math.min(maxYear, newEnd), 1, 1));
    const xStartPre = xScale(new Date(Math.max(minYear, newStart - 2), 1, 1));
    const xEndPost = xScale(new Date(Math.min(maxYear, newEnd + 2), 1, 1));

    const highlightMainElement = document.getElementById("mainHighlight" + nickname.replace(/\s+/g, ''));
    const highlightPreElement = document.getElementById("preHighlight" + nickname.replace(/\s+/g, ''));
    const highlightPostElement = document.getElementById("postHighlight" + nickname.replace(/\s+/g, ''));

    d3.select(highlightMainElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xStart)
        .attr("width", xEnd - xStart);

    d3.select(highlightPreElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xStartPre)
        .attr("width", Math.max(0, xStart - xStartPre));

    d3.select(highlightPostElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xEnd)
        .attr("width", Math.max(0, xEndPost - xEnd));
}

function hideShadowHighlight(nickname) {
    const highlightMainElement = document.getElementById("mainHighlight" + nickname.replace(/\s+/g, ''));
    const highlightPreElement = document.getElementById("preHighlight" + nickname.replace(/\s+/g, ''));
    const highlightPostElement = document.getElementById("postHighlight" + nickname.replace(/\s+/g, ''));

    d3.select(highlightMainElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", minYear)
        .attr("width", 0);

    d3.select(highlightPreElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", minYear)
        .attr("width", 0);

    d3.select(highlightPostElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", minYear)
        .attr("width", 0);
}