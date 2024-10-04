/*
TODO:
width height hardcoded
filter, interaction in general
*/
function init() {
    d3.csv("../processed_data/gdp_clean.csv")
    .then((data) => {
        createLineChart(data);
    });
}