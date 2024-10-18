/*
TODO:
width height hardcoded
filter, interaction in general
*/
function init() {
    d3.csv("../data/unemployment.csv")
    .then((data) => {
        unemploymentData = data;
        EUCountryNames = data.map((dataPoint) => dataPoint.Country);

        d3.json("../data/europe.geojson").then(function(geojson) {
            // const countries = data.map((dataPoint) => dataPoint.Country);
            const mapFeatures = geojson.features;
            filteredMapFeatures = mapFeatures;
            // .filter(feature =>
            //     countries.includes(feature.properties.NAME)
            // );
    
            unemploymentYears = Object.keys(data[0])
                .filter(key => !isNaN(key))
                .map(Number);

            createChoroplethMap(data);
        });
    });

    d3.csv("../data/migration_clean.csv")
    .then((data) => {
        chordDiagramsData = data.filter(dataItem =>
            EUCountryNames.includes(dataItem["Dest Country"]) && EUCountryNames.includes(dataItem["Origin Country"])
        );

        chordDiagramsData.forEach(row => {
            const originCode = row['Origin Country Code'];
            const originName = row['Origin Country'];
            countryCodesToNames[originCode] = originName;
    
            const destCode = row['Dest Country Code'];
            const destName = row['Dest Country'];
            countryCodesToNames[destCode] = destName;
        });

        createChordDiagram("inflow");
        createChordDiagram("outflow");
    });

    d3.csv("../data/economic_events.csv")
    .then((data) => {
        createGanttChart(data);
    });

    d3.csv("../data/gdp_clean.csv")
    .then((data) => {
        data = data.filter(dataItem => EUCountryNames.includes(dataItem["Country Name"]));
        createLineChart(data);

        const colorScale = d3.scaleOrdinal()
            .domain(['Northern', 'Southern'])
            .range([northernCountriesColor, southernCountriesColor]);
        const swatchesElement = Swatches(colorScale, {
            columns: 2,
            swatchSize: 20,
            format: d => d
        });
        document.getElementById('swatches-container').appendChild(swatchesElement);

    });
    createTimeline();
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        shiftIsPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        shiftIsPressed = false;
    }
});