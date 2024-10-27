function init() {

    const colorScale = d3.scaleOrdinal()
        .domain(['Northern Countries', 'Southern Countries'])
        .range([northernCountriesColor, southernCountriesColor]);
    const swatchesElement = Swatches(colorScale, {
        columns: 2,
        swatchSize: 20,
        format: d => d,
        onClickSwatch: (value, deselect = false) => {
            emptyListOfCountries("selection");
            if (deselect) {
                return;
            }

            if (value == "Southern Countries") {
                batchAddToListOfCountries(southernCountries, "selection");
            } else {
                const northernCountries = EUCountryNames.filter(cn => !southernCountries.includes(cn));
                batchAddToListOfCountries(northernCountries, "selection");
            }

        }
    });
    document.getElementById('swatches-container').appendChild(swatchesElement);

    d3.csv("../data/unemployment.csv")
    .then((data) => {
        unemploymentData = data;
        EUCountryNames = data.map((dataPoint) => dataPoint.Country);
        northernCountries = EUCountryNames.filter(name => !southernCountries.includes(name));

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

    d3.csv("../data/economic_events.csv")
    .then((data) => {
        createGanttChart(data);
        createTimeline();

        d3.csv("../data/gdp_clean.csv")
            .then((data) => {
                data = data.filter(dataItem => EUCountryNames.includes(dataItem["Country Name"]));
                createLineChart(data);
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
            countryNamesToCodes[originName] = originCode;
    
            const destCode = row['Dest Country Code'];
            const destName = row['Dest Country'];
            countryCodesToNames[destCode] = destName;
            countryNamesToCodes[destName] = destCode;

        });

        createChordDiagram("inflow");
        createChordDiagram("outflow");
    });

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

document.addEventListener("DOMContentLoaded", function() {
    loaded = true;
});