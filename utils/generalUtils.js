function addToListOfCountries(newCountry, listName) { // list = "selection" || "hover"
    const list = (listName == "selection") ? selectedCountries : hoveredCountries;
    if (!list.includes(newCountry)) {
        list.push(newCountry);
    }
}

function batchAddToListOfCountries(newCountries, listName) {
    const list = (listName == "selection") ? selectedCountries : hoveredCountries;
    newCountries = newCountries.filter(cn => !countryIsInListOfCountries(cn, listName));
    list.push(...newCountries);
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
    const list = (listName == "selection") ? selectedCountries : hoveredCountries;
    list.splice(0, list.length);
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

    const selectionIsSouthernCountries = haveSameElements(arr, southernCountries);
    const selectionIsNorthernCountries = haveSameElements(arr, northernCountries);

    if (selectedCountries.length == 0 || (!selectionIsSouthernCountries && !selectionIsNorthernCountries)) {
        clearLegend();
    } else {
        const selection = selectionIsSouthernCountries ? "Southern Countries" : "Northern Countries";
        changeSwatchSelection(selection, true);
    }
};

const haveSameElements = (arr1, arr2) =>
    arr1.length === arr2.length &&
    arr1.every(element => arr2.includes(element)) &&
    arr2.every(element => arr1.includes(element));