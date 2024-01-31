// mapToken is defined in index.ejs
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'cluster-map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-103.5917, 40.6699],
    zoom: 3
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// add current location control to the map
var geolocate = new mapboxgl.GeolocateControl();

map.addControl(geolocate);

geolocate.on('geolocate', function (e) {
    var lon = e.coords.longitude;
    var lat = e.coords.latitude
    var position = [lon, lat];
    console.log("position = ", position);
});

//
// current location
//
// Get current location and update map
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
});

function successLocation(position) {
    var { latitude, longitude } = position.coords;
    map.setCenter([longitude, latitude]); // Update map center
    new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map); // Add marker at current location
    console.log("latitude = ", latitude, "longitude = ", longitude);
}

function errorLocation() {
    alert('Unable to retrieve your location');
}


//

map.on('load', () => {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data.
        // Mapbox expect an array of data under the key of "features"
        // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 10
            //   * Yellow, 30px circles when point count is between 10 and 30
            //   * Pink, 40px circles when point count is greater than or equal to 30
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#83c3f7',
                10,
                '#64b5f6',
                30,
                '#467eac'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                10,
                25,
                30,
                35
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#121858'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const text = e.features[0].properties.popupMarkup;

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                text
            )
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});