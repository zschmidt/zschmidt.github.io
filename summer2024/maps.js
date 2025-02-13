async function GpxMapFunction(stateName) {
  return await fetch(`latlon/${stateName}.latlon`)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch the file")
    }
    return response.json();
  })
}

function addPolylineToMap(latlng, map) {
    const options = {
        async: true,
        polyline_options: { color: 'red' },
    };

    var polyline = L.polyline(latlng, {color: 'red'}).addTo(map);
    // zoom the map to the polyline
    map.fitBounds(polyline.getBounds());

}

const oregonMap = L.map('oregonMap');

L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(oregonMap);

GpxMapFunction("oregon").then(_data => {
    addPolylineToMap(_data, oregonMap);
});



const californiaMap = L.map('californiaMap');
L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(californiaMap);

GpxMapFunction("california").then(_data => {
    addPolylineToMap(_data, californiaMap);
});

const nevadaMap = L.map('nevadaMap');
L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(nevadaMap);

GpxMapFunction("nevada").then(_data => {
    addPolylineToMap(_data, nevadaMap);
});


const utahMap = L.map('utahMap');
L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(utahMap);

GpxMapFunction("utah").then(_data => {
    addPolylineToMap(_data, utahMap);
});


const coloradoMap = L.map('coloradoMap');
L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(coloradoMap);

GpxMapFunction("colorado").then(_data => {
    addPolylineToMap(_data, coloradoMap);
});



const wyomingMap = L.map('wyomingMap');
L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(wyomingMap);

GpxMapFunction("wyoming").then(_data => {
    addPolylineToMap(_data, wyomingMap);
});




