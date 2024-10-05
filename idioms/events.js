function setupEvents() {
    d3.csv("../../data/economic_events.csv").then(function(data) {
        const uniqueEventNames = [...new Set(data.map(d => d.event_name))];

        const select = d3.select("#event-select");

        uniqueEventNames.forEach(eventName => {
            select.append("option")
                .attr("value", eventName)
                .text(eventName);
        });

        function handleEventChange() {
            const selectedOptions = Array.from(select.node().selectedOptions).map(option => option.value);
            console.log("Selected Events:", selectedOptions);
        }

        select.on("change", handleEventChange);

    }).catch(function(error) {
        console.error("Error loading the CSV file:", error);
    });

}
