var map;
var items;
var myPosition;
var locations = [];
var markers = [];

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

function getLocations(cb) {    
    $.ajax({
        dataType: "json",
        url: "js/data.json",
        success: function(data) {
            cb && cb(data)
        }
    });
}

function initMap(position) {

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: {
            lat: -34.6209276,
            lng: -58.4458738
        }
    });
    var infoWin = new google.maps.InfoWindow();


    if(position != false){
        var coords = position.coords;
        myPosition = {
            lat: coords.latitude,
            lng: coords.longitude
        };
    
        var center = new google.maps.LatLng(myPosition.lat, myPosition.lng);
        var position = new google.maps.Marker({
            position: myPosition,
            map: map,
            title: 'Mi ubicación'
        });
    
        map.panTo(center);
        map.setZoom(10);    
        position.setMap(map);        
    }

    getLocations(function(locations){
        var markers = locations.map(function(location, i) {
            var marker = new google.maps.Marker({
                position: {
                    lat: parseFloat(location.lat),
                    lng: parseFloat(location.lng)
                },
                title: location.nombre,
                animation: google.maps.Animation.DROP,
                icon: pinSymbol()                
            });

            google.maps.event.addListener(marker, 'click', function(evt) {
              infoWin.setContent(location.nombre + '<br>' + location.direccion + '<br>' + location.localidad + '<br>' + location.provincia + '<br>' + location.telefono + '<br>' + location.email );
              infoWin.open(map, marker);
            })
            return marker;
          });
        
          // Add a marker clusterer to manage the markers.
          var markerCluster = new MarkerClusterer(map, markers);      
    })     
    
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

            var myPosition = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };     
        
            var center = new google.maps.LatLng(myPosition.lat, myPosition.lng);
            var position = new google.maps.Marker({
                position: myPosition,
                map: map,
                title: 'Ubicación'
            });
        
            map.panTo(center);
            map.setZoom(15);    
            position.setMap(map);  
        });

        map.fitBounds(bounds);
    });    

    
  }
  
  //google.maps.event.addDomListener(window, "load", initMap);


navigator.geolocation.getCurrentPosition(function(position){
    initMap(position)
}, function(){
    initMap(false)
}, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
});

  