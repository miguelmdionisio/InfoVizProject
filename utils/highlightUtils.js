function updateHighlight() {
    let someSelected = false;

    for (const e of events) {
        if (e.selected) {
            someSelected = true;
            moveShadowHighlight(e.name);
        } else {
            moveShadowHighlight(e.name, false);
        }
    }

    if (!someSelected) {
        moveShadowHighlight("Default");
    } else {
        moveShadowHighlight("Default", false);
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

    lineChartSVG.append("rect")
        .attr("class", "highlight")
        .attr("fill", "#d3d3d3")
        .attr("opacity", 0.5)
        .attr("x", xStart)
        .attr("y", 0)
        .attr("width", xEnd - xStart)
        .attr("height", 0)
        .attr("id", "mainHighlight" + nickname.replace(/\s+/g, ''));

    lineChartSVG.append("rect")
        .attr("class", "highlight-pre")
        .attr("fill", "#F0D2D1")
        .attr("opacity", 0.5)
        .attr("x", xStartPre)
        .attr("y", 0)
        .attr("width", Math.max(0, xStart - xStartPre))
        .attr("height", 0)
        .attr("id", "preHighlight" + nickname.replace(/\s+/g, ''));
    
    lineChartSVG.append("rect")
        .attr("class", "highlight-post")
        .attr("fill", "#8EB19D")
        .attr("opacity", 0.5)
        .attr("x", xEnd)
        .attr("y", 0)
        .attr("width", Math.max(0, xEndPost - xEnd))
        .attr("height", 0)
        .attr("id", "postHighlight" + nickname.replace(/\s+/g, ''));
};

function moveShadowHighlight(nickname, show = true) {

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
