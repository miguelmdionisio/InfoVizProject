function addToListOfCountries(newCountry, listName) { // list = "selection" || "hover"
    const list = (listName == "selection") ? selectedCountries : hoveredCountries;
    if (!list.includes(newCountry)) {
        list.push(newCountry);
    }
}

function removeFromListOfCountries(newCountry, listName) {
    const list = (listName == "selection") ? selectedCountries : hoveredCountries;
    const index = list.indexOf(newCountry);
    if (index > -1) {
        list.splice(index, 1);
    }
}

function countryIsInListOfCountries(country, listName) {
    const list = (listName == "selection") ? selectedCountries : hoveredCountries;
    return list.includes(country);
}

function emptyListOfCountries(listName) {
    if (listName == "selection") selectedCountries.splice(0, selectedCountries.length);
    else hoveredCountries.splice(0, hoveredCountries.length);
}

function createObservableArray(initialArray, callback) {
    const handler = {
        set(target, property, value) {
            if (!isNaN(property)) {
                target[property] = value;
                callback(target);
            }
            return true;
        },
        deleteProperty(target, property) {
            if (!isNaN(property)) {
                delete target[property];

                const filteredArray = target.filter(item => item !== undefined);
                while (target.length > 0) {
                    target.pop();
                }
                filteredArray.forEach(item => target.push(item));

                callback(target);
            }
            return true;
        }
    };

    const observableArray = new Proxy(initialArray, handler);
    return observableArray;
}

function toggleBorder() {
    showBorder = !showBorder;
    updateBorderCountries();
}

const onHoverChange = (arr) => {
    updateHoveredLines();
    updateHoveredMapCountries();
    updateHoveredArcs();
};

const onSelectChange = (arr) => {
    updateSelectedLines();
    updateSelectedMapCountries();
    updateSelectedArcs();
};