function setupEvents() {
    d3.csv("../../data/economic_events.csv").then(function(data) {
        const uniqueEventNames = [...new Set(data.map(d => d.event_name))];
        console.log(uniqueEventNames);
    
        const select = d3.select("#event-select");
        select.append("option")
            .attr("value", "")
            .text("Select an event");
    
        uniqueEventNames.forEach(eventName => {
            select.append("option")
                .attr("value", eventName)
                .text(eventName);
        });

    }).catch(function(error) {
        console.error("Error loading the CSV file:", error);
    });
}
