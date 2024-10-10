let selectionOngoing = false;

const minYear = 1991;
const maxYear = 2023;

let timelineStartSlider, timelineEndSlider;
let timelineXScale;
let timelineRangeLine;
let timelineStartYear, timelineEndYear;

const lineChartMargin = {top: 20, right: 80, bottom: 0, left: 80},
lineChartWidth = window.innerWidth - 200,
lineChartHeight = window.innerHeight/2 - 250;

let lineChartSVG;

let events = [];

const southernCountries = ["Portugal", "Spain", "Italy", "Slovenia", "Croatia", "Hungary", "Romania", "Bulgaria", "Greece", "Turkey", "Cyprus", "Malta"];