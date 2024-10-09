/*
TODO:
width height hardcoded
filter, interaction in general
*/
function init() {
    d3.csv("../data/gdp_clean.csv")
    .then((data) => {
        createLineChart(data);
    });
    createTimeline();

    d3.csv("../data/economic_events.csv")
    .then((data) => {
        createGanttChart(data);
    });
}