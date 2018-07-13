var map;
var items;
var myPosition;
var markers = [];
var infowindows = [];

function pinSymbol() {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
        fillColor: '#0C2D9F',
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 1,
        scale: 1
    };
}

function displayMarkers(newPosition) {
    var infowindow = new google.maps.InfoWindow(); 

    for (i in items) {
        // Create marker
        var marker = new google.maps.Marker({
            position: {
                lat: parseFloat(items[i].latitud),
                lng: parseFloat(items[i].longitud)
            },
            map: map,
            title: items[i].nombre,
            animation: google.maps.Animation.DROP,
            icon: pinSymbol()
        });
        items[i].marker = marker;

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(items[i].nombre + '<br>' + items[i].direccion + '<br>' + items[i].localidad);
                infowindow.open(map, marker);
            }
        })(items[i].marker, i));
    }

    var options = {
        imagePath: 'assets/images/m'
    };

    var markerCluster = new MarkerClusterer(map, items[i], options);

}

function success(pos) {
    var crd = pos.coords;
    console.log('More or less ' + crd.accuracy + ' meters.');

    myPosition = {
        lat: crd.latitude,
        lng: crd.longitude
    };

    var center = new google.maps.LatLng(myPosition.lat, myPosition.lng);
    var position = new google.maps.Marker({
        position: myPosition,
        map: map,
        title: 'Mi ubicación'
    });

    map.panTo(center);
    map.setZoom(13);    
    position.setMap(map);
    setMarkers(myPosition);
};

function error(err) {
    setMarkers();
};


function setMarkers(newPosition) {    
    $.ajax({
        dataType: "json",
        url: "js/data.json",
        success: function(i) {
            items = i;
            displayMarkers(newPosition);
        }
    });
}


// Run
(function() {

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {
            lat: -34.6209276,
            lng: -58.4458738
        }
    });   
    
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            //Render nuevo mapa 
            for (i in items) {
                items[i].marker.setMap(null);	
            }

           var newPosition = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
           
            setMarkers(newPosition);           

        });



        map.fitBounds(bounds);
    });    

    navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
})();

