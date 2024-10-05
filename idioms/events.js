// function setupEvents() {
//     d3.csv("../../data/economic_events.csv").then(function(data) {
//         const uniqueEventNames = [...new Set(data.map(d => d.event_name))];

//         const select = d3.select("#event-select");

//         uniqueEventNames.forEach(eventName => {
//             select.append("option")
//                 .attr("value", eventName)
//                 .text(eventName);
//         });

//         function handleEventChange() {
//             const selectedOptions = Array.from(select.node().selectedOptions).map(option => option.value);

//             const selectedSet = new Set(selectedOptions);
//             const selectedEventsData = data.filter(d => selectedSet.has(d.event_name));
//             const eventsYears = selectedEventsData.map(d => ({
//                 event_name: d.event_name,
//                 start_year: d.year_start,
//                 end_year: d.year_end
//             }));
//             updateHighlightBasedOnEventSelection(eventsYears);
//         }

//         function clearSelection() {
//             select.selectAll("option").property("selected", false);
//             handleEventChange();
//         }

//         select.on("change", handleEventChange);
//         d3.select("#clear-selection").on("click", clearSelection);

//     }).catch(function(error) {
//         console.error("Error loading the CSV file:", error);
//     });

// }
