let previouslyUnderlinedSwatch = null;

function Swatches(color, {
    columns = null,
    format,
    unknown: formatUnknown,
    swatchSize = 15,
    swatchWidth = swatchSize,
    swatchHeight = swatchSize,
    marginLeft = 0,
    onClickSwatch = null
} = {}) {
    const id = `-swatches-${Math.random().toString(16).slice(2)}`;
    const unknown = formatUnknown == null ? undefined : color.unknown();
    const unknowns = unknown == null || unknown === d3.scaleImplicit ? [] : [unknown];
    const domain = color.domain().concat(unknowns);
    if (format === undefined) format = x => x === unknown ? formatUnknown : x;

    previouslyUnderlinedSwatch = null;

    function createSwatchItem(value) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `${id}-item`;
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.paddingBottom = '1px';

        const swatchDiv = document.createElement('div');
        swatchDiv.className = `${id}-swatch`;
        swatchDiv.style.width = `${swatchWidth}px`;
        swatchDiv.style.height = `${swatchHeight}px`;
        swatchDiv.style.background = color(value);
        swatchDiv.style.margin = '0 0.5em 0 0';

        const labelDiv = document.createElement('div');
        labelDiv.className = `${id}-label`;
        labelDiv.style.whiteSpace = 'nowrap';
        labelDiv.style.overflow = 'hidden';
        labelDiv.style.textOverflow = 'ellipsis';
        labelDiv.style.maxWidth = `calc(100% - ${swatchWidth}px - 0.5em)`;
        labelDiv.style.marginRight = '10px';
        const label = format(value);
        labelDiv.textContent = label;
        labelDiv.title = label;

        itemDiv.addEventListener('click', () => handleClick(labelDiv, value, onClickSwatch));

        itemDiv.appendChild(swatchDiv);
        itemDiv.appendChild(labelDiv);
        return itemDiv;
    }

    function createSwatchRow(value) {
        const span = document.createElement('span');
        span.className = id;
        span.style.display = 'inline-flex';
        span.style.alignItems = 'center';
        span.style.marginRight = '1em';

        const colorDiv = document.createElement('div');
        colorDiv.style.width = `${swatchWidth}px`;
        colorDiv.style.height = `${swatchHeight}px`;
        colorDiv.style.marginRight = '0.5em';
        colorDiv.style.background = color(value);

        span.addEventListener('click', () => handleClick(labelDiv, value, onClickSwatch));

        span.appendChild(colorDiv);
        span.appendChild(document.createTextNode(format(value)));
        return span;
    }

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginLeft = `${marginLeft}px`;
    container.style.minHeight = '33px';
    container.style.font = '10px sans-serif';

    const style = document.createElement('style');
    style.textContent = `
        .${id}-item {
            break-inside: avoid;
            display: flex;
            align-items: center;
            padding-bottom: 1px;
            cursor: pointer;
        }
        .${id}-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: calc(100% - ${swatchWidth}px - 0.5em);
        }
        .${id}-swatch {
            width: ${swatchWidth}px;
            height: ${swatchHeight}px;
            margin: 0 0.5em 0 0;
        }
        .${id} {
            display: inline-flex;
            align-items: center;
            margin-right: 1em;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    if (columns !== null) {
        const gridDiv = document.createElement('div');
        gridDiv.style.display = 'flex';
        gridDiv.style.alignItems = 'center';
        gridDiv.style.width = '100%';
        gridDiv.style.columns = columns;

        domain.forEach(value => {
            gridDiv.appendChild(createSwatchItem(value));
        });

        container.appendChild(gridDiv);
    } else {
        domain.forEach(value => {
            container.appendChild(createSwatchRow(value));
        });
    }

    return container;
}

function handleClick(labelDiv, value, callback) {
    if (previouslyUnderlinedSwatch) {
        previouslyUnderlinedSwatch.style.textDecoration = 'none';

        if (previouslyUnderlinedSwatch == labelDiv) {
            previouslyUnderlinedSwatch = null;
            callback(value, true);
            return;
        }
    }

    labelDiv.style.textDecoration = 'underline';
    previouslyUnderlinedSwatch = labelDiv;
    callback(value);
}

function clearLegend() {
    if (previouslyUnderlinedSwatch) {
        previouslyUnderlinedSwatch.style.textDecoration = 'none';
    }
}