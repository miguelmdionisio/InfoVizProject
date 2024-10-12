function updateHighlight() {
    let someSelected = false;

    for (const e of events) {
        if (e.selected) {
            someSelected = true;
            showOrHideShadowHighlight(e.name);
        } else {
            showOrHideShadowHighlight(e.name, false);
        }
    }

    if (!someSelected) {
        showOrHideShadowHighlight("Default");
        moveHighLight("Default", getClosestYear(timelineStartYear), getClosestYear(timelineEndYear));
    } else {
        showOrHideShadowHighlight("Default", false);
    }

};

function createShadowHighlights(nickname, start, end) {
    const xScale = d3.scaleTime()
    .domain([new Date(minYear, 1, 1), new Date(maxYear, 1, 1)])
    .range([0, lineChartWidth]);

    const xStart = xScale(new Date(Math.max(minYear, start), 1, 1));
    const xEnd = xScale(new Date(Math.min(maxYear, end), 1, 1));
    const xStartPre = xScale(new Date(Math.max(minYear, start - 2), 1, 1));
    const xEndPost = xScale(new Date(Math.min(maxYear, end + 2), 1, 1));

    if ((xEnd - xStart) < 0) {
        return;
    }

    lineChartSVG.append("rect")
        .attr("class", "highlight")
        .attr("fill", duringPeriodColor)
        .attr("opacity", 0.5)
        .attr("x", xStart)
        .attr("y", 0)
        .attr("width", xEnd - xStart)
        .attr("height", 0)
        .attr("id", "mainHighlight" + nickname.replace(/\s+/g, ''));

    lineChartSVG.append("rect")
        .attr("class", "highlight-pre")
        .attr("fill", prePeriodColor)
        .attr("opacity", 0.5)
        .attr("x", xStartPre)
        .attr("y", 0)
        .attr("width", Math.max(0, xStart - xStartPre))
        .attr("height", 0)
        .attr("id", "preHighlight" + nickname.replace(/\s+/g, ''));
    
    lineChartSVG.append("rect")
        .attr("class", "highlight-post")
        .attr("fill", postPeriodColor)
        .attr("opacity", 0.5)
        .attr("x", xEnd)
        .attr("y", 0)
        .attr("width", Math.max(0, xEndPost - xEnd))
        .attr("height", 0)
        .attr("id", "postHighlight" + nickname.replace(/\s+/g, ''));
};

function showOrHideShadowHighlight(nickname, show = true) {
    const highlightMainElement = document.getElementById("mainHighlight" + nickname.replace(/\s+/g, ''));
    const highlightPreElement = document.getElementById("preHighlight" + nickname.replace(/\s+/g, ''));
    const highlightPostElement = document.getElementById("postHighlight" + nickname.replace(/\s+/g, ''));

    d3.select(highlightMainElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("height", show ? lineChartHeight : 0);

    d3.select(highlightPreElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("height", show ? lineChartHeight : 0);

    d3.select(highlightPostElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("height", show ? lineChartHeight : 0);
}

function moveHighLight(nickname, start, end) {
    const xScale = d3.scaleTime()
    .domain([new Date(minYear, 1, 1), new Date(maxYear, 1, 1)])
    .range([0, lineChartWidth]);

    const xStart = xScale(new Date(Math.max(minYear, start), 1, 1));
    const xEnd = xScale(new Date(Math.min(maxYear, end), 1, 1));
    const xStartPre = xScale(new Date(Math.max(minYear, start - 2), 1, 1));
    const xEndPost = xScale(new Date(Math.min(maxYear, end + 2), 1, 1));

    if ((xEnd - xStart) < 0) {
        return;
    }

    const highlightMainElement = document.getElementById("mainHighlight" + nickname.replace(/\s+/g, ''));
    const highlightPreElement = document.getElementById("preHighlight" + nickname.replace(/\s+/g, ''));
    const highlightPostElement = document.getElementById("postHighlight" + nickname.replace(/\s+/g, ''));

    d3.select(highlightMainElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xStart)
        .attr("width", xEnd - xStart)
        .attr("height", lineChartHeight);

    d3.select(highlightPreElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xStartPre)
        .attr("width", xStart - xStartPre)
        .attr("height", lineChartHeight);

    d3.select(highlightPostElement)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("x", xEnd)
        .attr("width", xEndPost - xEnd)
        .attr("height", lineChartHeight);
}
