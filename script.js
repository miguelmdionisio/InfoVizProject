/*
TODO:
width height hardcoded
filter, interaction in general
*/
function init() {
    d3.csv("../data/migration_clean.csv")
    .then((data) => {
        chordDiagramsData = data;
        createChordDiagram("inflow");
        createChordDiagram("outflow");
    });

    d3.csv("../data/economic_events.csv")
    .then((data) => {
        createGanttChart(data);
    });

    d3.csv("../data/gdp_clean.csv")
    .then((data) => {
        createLineChart(data);
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