async function fetchLatLonData(stateName) {
  const response = await fetch(`latlon/${stateName}.latlon`);
  if (!response.ok) {
    throw new Error("Failed to fetch the file");
  }
  return response.json();
}

function addPolylineToMap(latlng, map) {
  const polyline = L.polyline(latlng, {color: 'red'}).addTo(map);
  map.fitBounds(polyline.getBounds());
}

function createStateMap(stateName) {
  const mapId = `${stateName}Map`;
  const map = L.map(mapId);

  L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  fetchLatLonData(stateName).then(data => {
    addPolylineToMap(data, map);
  });

  return map;
}

// Create maps for each state
const states = ['oregon', 'california', 'nevada', 'utah', 'colorado', 'wyoming'];
const maps = states.reduce((acc, state) => {
  acc[state] = createStateMap(state);
  return acc;
}, {});




