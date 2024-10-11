function createChordDiagram(flowDirection) {
    const divId = (flowDirection == "inflow") ? "#chordDiagramImmigration" : "#chordDiagramEmigration";
    const globalVarsId = +(flowDirection != "inflow");

    const svg = d3.select(divId)
      .append("svg")
      .attr("width", chordDiagramWidth)
      .attr("height", chordDiagramHeight)
      .append("g")
      .attr("transform", "translate(" + (chordDiagramWidth / 2 + 20) + "," + (chordDiagramHeight / 2 + 20) + ")");

    const filteredData = chordDiagramsData.filter(d => {
        return +d.Year >= timelineStartYear.getFullYear() && +d.Year <= timelineEndYear.getFullYear()
    });
    
    const countries = Array.from(new Set(filteredData.map(d => d["Origin Country Code"]).concat(filteredData.map(d => d["Dest Country Code"]))));
    const matrix = Array.from({ length: countries.length }, () => Array(countries.length).fill(0));
    filteredData.forEach(d => {
        const originIndex = countries.indexOf(d["Origin Country Code"]);
        const destIndex = countries.indexOf(d["Dest Country Code"]);
        matrix[originIndex][destIndex] += (flowDirection == "inflow") ? +d.Inflow : +d.Outflow;
    });

    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const chords = chord(matrix);

    const arc = d3.arc()
      .innerRadius(chordDiagramsInnerRadius)
      .outerRadius(chordDiagramsOuterRadius);

    chordDiagramsArcs[globalVarsId] = svg.append("g")
      .selectAll("path")
      .data(chords.groups)
      .enter().append("path")
      .style("fill", d => chordDiagramsColors(d.index))
      .style("stroke", d => d3.rgb(chordDiagramsColors(d.index)).darker())
      .attr("d", arc);

    chordDiagramsRibbons[globalVarsId] = svg.append("g")
      .attr("fill-opacity", 0.67)
      .selectAll("path")
      .data(chords)
      .enter().append("path")
      .attr("d", d3.ribbon().radius(chordDiagramsInnerRadius))
      .style("fill", d => chordDiagramsColors(d.target.index))
      .style("stroke", d => d3.rgb(chordDiagramsColors(d.target.index)).darker());

    svg.append("g").selectAll("text")
        .data(chords.groups)
        .enter().append("text")
        .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
            d.name = countries[d.index];
        })
        .attr("dy", ".35em")
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + (chordDiagramsOuterRadius + 10) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .text(d => d.name);

}

function updateChordDiagrams() {

    const divIds = ["#chordDiagramImmigration", "#chordDiagramEmigration"];
    for (const divId of divIds) {
        const diagram = d3.select(divId);
        const globalVarsId = +(divId != "#chordDiagramImmigration");

        // recompute data shown in diagram
        const filteredData = chordDiagramsData.filter(d => {
            return +d.Year >= timelineStartYear.getFullYear() && +d.Year <= timelineEndYear.getFullYear()
        });
        
        const countries = Array.from(new Set(filteredData.map(d => d["Origin Country Code"]).concat(filteredData.map(d => d["Dest Country Code"]))));
        const matrix = Array.from({ length: countries.length }, () => Array(countries.length).fill(0));
        filteredData.forEach(d => {
            const originIndex = countries.indexOf(d["Origin Country Code"]);
            const destIndex = countries.indexOf(d["Dest Country Code"]);
            matrix[originIndex][destIndex] += (divId == "#chordDiagramImmigration") ? +d.Inflow : +d.Outflow;
        });

        const chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);

        const chords = chord(matrix);

        const arc = d3.arc()
            .innerRadius(chordDiagramsInnerRadius)
            .outerRadius(chordDiagramsOuterRadius);

        const ribbon = d3.ribbon().radius(chordDiagramsInnerRadius);

        // animate arcs
        chordDiagramsArcs[globalVarsId]
            .data(chords.groups, d => d.index)
            .transition()
            .duration(0)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(1);
                return t => arc(interpolate(t));
            });

        // animate ribbons
        chordDiagramsRibbons[globalVarsId]
        .data(chords, d => `${d.source.index}-${d.target.index}`)
        .transition()
        .duration(0)
        .attrTween("d", function(d) {
            const previous = this._current || d;
            const interpolate = d3.interpolate(previous, d);
            this._current = interpolate(1);
            return t => ribbon(interpolate(t));
        });

        // animate labels
        const labels = diagram.selectAll("text")
            .data(chords.groups, d => d.index);

        labels.enter()
            .append("text")
            .attr("dy", ".35em")
            .merge(labels)
            .transition()
            .duration(0)
            .attr("transform", function(d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + (chordDiagramsOuterRadius + 10) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(d => countries[d.index]);

        labels.exit().remove();
    }
}