/*
TODO:
width height hardcoded
filter, interaction in general
tooltip worth it?
color according to gdp (add gdp data)
*/
function init() {
    d3.csv("../data/migration_clean.csv")
    .then((data) => {
        createLineChart(data);
    });
}