const hoveredCountries = createObservableArray([], onHoverChange);
const selectedCountries = createObservableArray([], onSelectChange);

let shiftIsPressed = false;
let showBorder = true;

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
chordDiagramHeight = window.innerHeight / 2 - 100;

const choroplethMapMargin = {top: 0, right: 80, bottom: 0, left: 80},
choroplethMapWidth = window.innerWidth / 3 - 50,
choroplethMapHeight = window.innerHeight / 2 - 100;

let lineChartSVG;

let events = [];

const southernCountries = ["Portugal", "Spain", "Italy", "Slovenia", "Croatia", "Hungary", "Romania", "Bulgaria", "Greece", "Cyprus", "Malta"];
const southernCountryCodes = ["POR", "SPN", "ITA", "SLV", "CRO", "HUN", "ROM", "BUL", "GRC", "CYP", "MLT"];
let EUCountryNames = [];
let northernCountries = [];
let countryCodesToNames = {};
let countryNamesToCodes = {};

let chordDiagramsData;
const chordDiagramsOuterRadius = Math.min(chordDiagramWidth, chordDiagramHeight) / 2 - 40;
const chordDiagramsInnerRadius = chordDiagramsOuterRadius - 20;
const chordDiagramsColors = d3.scaleOrdinal(d3.schemeCategory10);
const chordDiagramsArcs = []; // 0 = immigration, 1 = emigration
const chordDiagramsRibbons = []; // 0 = immigration, 1 = emigration

let unemploymentData;
let filteredMapFeatures;
let unemploymentYears;


// COLORS

const southernCountriesColor = "#D36135";
const northernCountriesColor = "#4C9079";

const eventsColor = "#282B28";
const highlightedEventsColor = "#6D736D";
document.documentElement.style.setProperty('--eventsColor', eventsColor);

const duringPeriodColor = "#D3D3D3";
const prePeriodColor = "#7b94b8";
const postPeriodColor = "#32507a";
const timelineRangeLineColor = "#999";

// const mapCountryHoverColor = "#E5D4ED";
// const mapCountrySelectColor = "#6D72C3";
const mapCountryHoverColor = "#000000";
const mapCountrySelectColor = "#000000";
const undefinedMapCountryColor = "#ccc";
document.documentElement.style.setProperty('--mapCountryHoverColor', mapCountryHoverColor);
document.documentElement.style.setProperty('--mapCountrySelectColor', mapCountrySelectColor);

const tooltipBackgroundColor = "#fff";
const tooltipBorderColor = "#ccc";
document.documentElement.style.setProperty('--tooltipBackgroundColor', tooltipBackgroundColor);
document.documentElement.style.setProperty('--tooltipBorderColor', tooltipBorderColor);

const axesColor = "#000";
document.documentElement.style.setProperty('--axesColor', axesColor);

const boxSelectionBackgroundColor = "#add8e6";
const boxSelectionBorderColor = "#1E90FF";
document.documentElement.style.setProperty('--boxSelectionBackgroundColor', boxSelectionBackgroundColor);
document.documentElement.style.setProperty('--boxSelectionBorderColor', boxSelectionBorderColor);