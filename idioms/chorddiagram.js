let countries;
let updatedMatrix;

function createChordDiagram(flowDirection) {
    const divId = (flowDirection == "inflow") ? "#chordDiagramImmigration" : "#chordDiagramEmigration";
    const globalVarsId = +(flowDirection != "inflow");

    const svg = d3.select(divId)
        .append("svg")
        .attr("width", chordDiagramWidth)
        .attr("height", chordDiagramHeight)
        .append("g")
        .attr("transform", "translate(" + (chordDiagramWidth / 2 + 20) + "," + (chordDiagramHeight / 2 + 20) + ")");

    // background rect to detect clicks outside the chord diagrams
    svg.append("rect")
        .attr("width", chordDiagramWidth)
        .attr("height", chordDiagramHeight)
        .attr("transform", "translate(" + (-chordDiagramWidth / 2 - 20) + "," + (-chordDiagramHeight / 2 - 20) + ")")
        .style("fill", "transparent")
        .on("click", () => {
            if (!shiftIsPressed) emptyListOfCountries("selection");
        });

    const filteredData = chordDiagramsData.filter(d => {
        return +d.Year >= timelineStartYear.getFullYear() && +d.Year <= timelineEndYear.getFullYear()
    });
    
    countries = Array.from(new Set(filteredData.map(d => d["Origin Country Code"]).concat(filteredData.map(d => d["Dest Country Code"]))));
    const matrix = Array.from({ length: countries.length }, () => Array(countries.length).fill(0));
    filteredData.forEach(d => {
        const originIndex = countries.indexOf(d["Origin Country Code"]);
        const destIndex = countries.indexOf(d["Dest Country Code"]);
        matrix[originIndex][destIndex] += (flowDirection == "inflow") ? +d.Inflow : +d.Outflow;
    });
    updatedMatrix = matrix;

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
        .style("fill", d => {
            const isSouthern = southernCountryCodes.includes(countries[d.index]);
            return isSouthern ? southernCountriesColor : northernCountriesColor;
        })
        .style("stroke", d => {
            const isSouthern = southernCountryCodes.includes(countries[d.index]);
            const color = isSouthern ? southernCountriesColor : northernCountriesColor
            return d3.rgb(color).darker();
        })
        .attr("d", arc)
        .on("mouseover", (event, d) => {
            const countryCode = countries[d.index];
            const countryName = countryCodesToNames[countryCode];
            addToListOfCountries(countryName, "hover");

            let flowSum = 0;
            for (let i = 0; i < countries.length; i++) {
                flowSum += updatedMatrix[i][d.index];
            }
            tooltip
                .style("opacity", 1)
                .html(countryName + ": " + flowSum.toLocaleString('de-DE') + ((flowDirection == "inflow") ? " immigrants" : " emigrants")) // update tooltip text
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", (event, d) => {
            const countryCode = countries[d.index];
            const countryName = countryCodesToNames[countryCode];
            removeFromListOfCountries(countryName, "hover");
            tooltip.style("opacity", 0);
        })
        .on("mouseup", (event, d) => {
            const countryCode = countries[d.index];
            const countryName = countryCodesToNames[countryCode];
            if (countryIsInListOfCountries(countryName, "selection")) removeFromListOfCountries(countryName, "selection");
            else {
                if (!shiftIsPressed) emptyListOfCountries("selection");
                addToListOfCountries(countryName, "selection");
            }
        });

    chordDiagramsRibbons[globalVarsId] = svg.append("g")
        .attr("fill-opacity", 0.5)
        .selectAll("path")
        .data(chords)
        .enter().append("path")
        .attr("d", d3.ribbon().radius(chordDiagramsInnerRadius))
        .style("fill", d => {
            const isSouthern = southernCountryCodes.includes(countries[d.source.index]);
            return isSouthern ? southernCountriesColor : northernCountriesColor;
        })
        .style("stroke", d => {
            const isSouthern = southernCountryCodes.includes(countries[d.source.index]);
            const color = isSouthern ? southernCountriesColor : northernCountriesColor
            return d3.rgb(color).darker();
        });

    svg.append("g").selectAll("text")
        .data(chords.groups)
        .enter().append("text")
        .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
            d.name = countries[d.index];
        })
        .attr("dy", ".35em")
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + (chordDiagramsOuterRadius + 20) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .style("font-size", function(d) {
            return "12px";
        })
        .text(d => d.name);

    // setup tooltip
    const tooltip = d3
        .select("#chordTooltip")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

function updateChordDiagrams() {
    if (!chordDiagramsData) {
        return;
    }

    const divIds = ["#chordDiagramImmigration", "#chordDiagramEmigration"];
    for (const divId of divIds) {
        const diagram = d3.select(divId);
        const globalVarsId = +(divId != "#chordDiagramImmigration");

        // recompute data shown in diagram
        const filteredData = chordDiagramsData.filter(d => {
            return +d.Year >= timelineStartYear.getFullYear() && +d.Year <= timelineEndYear.getFullYear()
        });
        countries = Array.from(new Set(filteredData.map(d => d["Origin Country Code"]).concat(filteredData.map(d => d["Dest Country Code"]))));
        const matrix = Array.from({ length: countries.length }, () => Array(countries.length).fill(0));
        filteredData.forEach(d => {
            const originIndex = countries.indexOf(d["Origin Country Code"]);
            const destIndex = countries.indexOf(d["Dest Country Code"]);
            matrix[originIndex][destIndex] += (divId == "#chordDiagramImmigration") ? +d.Inflow : +d.Outflow;
        });
        updatedMatrix = matrix;

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
            .duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(1);
                return t => arc(interpolate(t));
            });

        // animate ribbons
        chordDiagramsRibbons[globalVarsId]
            .data(chords, (d, i) => `${i}`)
            .transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate(this._current, d);
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
            .duration(1000)
            .attr("transform", function(d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + (chordDiagramsOuterRadius + 20) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(d => countries[d.index]);

        labels.exit().remove();
    }
}

function updateHoveredArcs() {
    if (hoveredCountries.length == 0 && (selectedCountries.length == 0)) {
        for (let i = 0; i < chordDiagramsArcs.length; i++) {
            const listOfChords = chordDiagramsArcs[i];
            for (const chord of listOfChords) {
                d3.select(chord)
                    .transition()
                    .duration(500)
                    .style("opacity", 1)
                    .style("cursor", "pointer");
            }
            chordDiagramsRibbons[i]
                .transition()
                .duration(500)
                .style("opacity", 1);
        }
        return;
    }

    const hoveredIndexes = hoveredCountries.map(hc => {
        const hcCode = countryNamesToCodes[hc];
        return countries.indexOf(hcCode);
    });
    const selectedIndexes = selectedCountries.map(hc => {
        const hcCode = countryNamesToCodes[hc];
        return countries.indexOf(hcCode);
    });

    for (let i = 0; i < chordDiagramsArcs.length; i++) {
        const listOfChords = chordDiagramsArcs[i];
        for (const chord of listOfChords) {
            const chordData = chord.__data__;
            const countryCode = countries[chordData.index];
            const countryName = countryCodesToNames[countryCode];

            if (!countryIsInListOfCountries(countryName, "selection")) {
                d3.select(chord)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.1);

                chordDiagramsRibbons[i].filter(r =>
                    (r.source.index == chordData.index && !hoveredIndexes.includes(r.target.index) && !selectedIndexes.includes(r.target.index))
                    || (r.target.index == chordData.index && !hoveredIndexes.includes(r.source.index) && !selectedIndexes.includes(r.source.index))
                )
                    .transition()
                    .duration(200)
                    .style("opacity", 0.1);
            }

            if (countryIsInListOfCountries(countryName, "hover")) {
                d3.select(chord)
                    .transition()
                    .duration(200)
                    .style("opacity", 1);

                chordDiagramsRibbons[i].filter(r => 
                    (r.source.index == chordData.index && !hoveredIndexes.includes(r.target.index) && !selectedIndexes.includes(r.target.index))
                    || (r.target.index == chordData.index && !hoveredIndexes.includes(r.source.index) && !selectedIndexes.includes(r.source.index))
                )
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
            }
        }
    }
}

function updateSelectedArcs() {
    const hoveredIndexes = hoveredCountries.map(hc => {
        const hcCode = countryNamesToCodes[hc];
        return countries.indexOf(hcCode);
    });
    const selectedIndexes = selectedCountries.map(hc => {
        const hcCode = countryNamesToCodes[hc];
        return countries.indexOf(hcCode);
    });

    for (let i = 0; i < chordDiagramsArcs.length; i++) {
        const listOfChords = chordDiagramsArcs[i];
        for (const chord of listOfChords) {
            const chordData = chord.__data__;
            const countryCode = countries[chordData.index];
            const countryName = countryCodesToNames[countryCode];

            if (countryIsInListOfCountries(countryName, "selection")) {
                d3.select(chord)
                    .transition()
                    .duration(200)
                    .style("opacity", 1);

                chordDiagramsRibbons[i].filter(r =>
                    (r.source.index == chordData.index && !hoveredIndexes.includes(r.target.index) && !selectedIndexes.includes(r.target.index))
                    || (r.target.index == chordData.index && !hoveredIndexes.includes(r.source.index) && !selectedIndexes.includes(r.source.index))
                )
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
            } else {
                d3.select(chord)
                    .transition()
                    .duration(500)
                    .style("opacity", (selectedCountries.length == 0) ? 1.0 : 0.1);
                
                chordDiagramsRibbons[i].filter(r =>
                    (r.source.index == chordData.index && !hoveredIndexes.includes(r.target.index) && !selectedIndexes.includes(r.target.index))
                    || (r.target.index == chordData.index && !hoveredIndexes.includes(r.source.index) && !selectedIndexes.includes(r.source.index))
                )
                    .transition()
                    .duration(500)
                    .style("opacity", (selectedCountries.length == 0) ? 1.0 : 0.1);
            }
        }
    }
}
