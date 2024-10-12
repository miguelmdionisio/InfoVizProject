/*
TODO:
width height hardcoded
filter, interaction in general
*/
function init() {
    importFiles("../data/gdp_clean.csv", "../data/unemployment.csv", "../data/data.json").then(function (results) {
        globalDataGdp = results[0];
        globalDataUnemployment = results[1];
        globalDataCountries = results[2];
        createLineChart(globalDataGdp);
        createChoroplethMap(globalDataUnemployment, globalDataCountries);
        createTimeline();
    });
}

function loadCSV(file) {
    return d3.csv(file);
}

function loadJson(file) {
    return d3.json(file);
}

function importFiles(fileGdp,fileUnemployment,fileGeo) {
    return Promise.all([loadCSV(fileGdp), loadCSV(fileUnemployment), loadJson(fileGeo)]);
}