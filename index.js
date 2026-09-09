function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const container = document.createElement('div');
container.id = 'plotly-table-container';
document.body.appendChild(container);

function drawViz(data) {
  if (!window.Plotly) return;

  const tables = data.tables.DEFAULT;
  const fields = data.fields;

  if (!tables || tables.length === 0) return;

  const headers = [];
  if (fields.dimensions) {
    fields.dimensions.forEach((dim) => headers.push(dim.name));
  }
  if (fields.metrics) {
    fields.metrics.forEach((met) => headers.push(met.name));
  }

  const cellColumns = headers.map((_, colIndex) => {
    const numDims = fields.dimensions ? fields.dimensions.length : 0;
    return tables.map((row) => {
      if (colIndex < numDims) {
        return row.dimensions[colIndex];
      } else {
        return row.metrics[colIndex - numDims];
      }
    });
  });

  const headerColor = data.style.headerBgColor.value.color || '#1a73e8';
  const cellColor = data.style.cellBgColor.value.color || '#ffffff';

  const tableData = [
    {
      type: 'table',
      header: {
        values: headers.map((h) => `<b>${h}</b>`),
        fill: { color: headerColor },
        align: 'center',
        font: { family: 'Roboto, sans-serif', size: 12, color: 'white' },
        height: 28
      },
      cells: {
        values: cellColumns,
        fill: { color: cellColor },
        align: 'left',
        font: { family: 'Roboto, sans-serif', size: 11, color: '#333333' },
        height: 24
      }
    }
  ];

  const layout = {
    autosize: true,
    margin: { t: 5, r: 5, l: 5, b: 5 }
  };

  const config = { responsive: true, displayModeBar: false };

  Plotly.react('plotly-table-container', tableData, layout, config);
}

Promise.all([
  loadScript('https://unpkg.com/@google/dscc/build/dscc.min.js'),
  loadScript('https://cdn.plot.ly/plotly-2.27.0.min.js')
]).then(() => {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}).catch((err) => {
  console.error('Error loading component dependencies:', err);
});