let selectionOngoing = false;
let shiftIsPressed = false;

const minYear = 1991;
const maxYear = 2018;
const maxGDP = 4456080000000;

let timelineStartSlider, timelineEndSlider;
let timelineXScale;
let timelineRangeLine;
let timelineStartYear, timelineEndYear;

const lineChartMargin = {top: 20, right: 80, bottom: 0, left: 80},
lineChartWidth = window.innerWidth - 200,
lineChartHeight = window.innerHeight/2 - 250;

const chordDiagramMargin = {top: 0, right: 80, bottom: 0, left: 80},
chordDiagramWidth = window.innerWidth / 3 - 50,
chordDiagramHeight = window.innerHeight/2 - 100;

let lineChartSVG;

let events = [];

const southernCountries = ["Portugal", "Spain", "Italy", "Slovenia", "Croatia", "Hungary", "Romania", "Bulgaria", "Greece", "Turkey", "Cyprus", "Malta"];
const southernCountryCodes = ["POR", "SPN", "ITA", "SLV", "CRO", "HUN", "ROM", "BUL", "GRC", "TUR", "CYP", "MLT"];

let chordDiagramsData;
const chordDiagramsOuterRadius = Math.min(chordDiagramWidth, chordDiagramHeight) / 2 - 40;
const chordDiagramsInnerRadius = chordDiagramsOuterRadius - 20;
const chordDiagramsColors = d3.scaleOrdinal(d3.schemeCategory10);
const chordDiagramsArcs = []; // 0 = immigration, 1 = emigration
const chordDiagramsRibbons = []; // 0 = immigration, 1 = emigration