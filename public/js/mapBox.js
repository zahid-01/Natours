export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiemFoaWQwMSIsImEiOiJjbGFqYWtqcnYwYXkwM3ZycWVlNzNoeW56In0.LUy248glfYR3_vJgbNJhOA';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/zahid01/clajdz4kd003j14o6gx3bhmkn',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      anchor: 'bottom',
      element: el,
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({ offset: 35 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>${loc.day} ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      left: 50,
      right: 50,
      bottom: 200,
      top: 250,
    },
  });
};
