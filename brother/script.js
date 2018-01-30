var map;
var items;
var myPosition;
var markers = [];
var infowindows = [];         
    
/******************   HELPERS    *******************/    
function calculateDistance(a,t,n,r){var s=deg2rad(n-a),h=deg2rad(r-t),M=Math.sin(s/2)*Math.sin(s/2)+Math.cos(deg2rad(a))*Math.cos(deg2rad(n))*Math.sin(h/2)*Math.sin(h/2),d=2*Math.atan2(Math.sqrt(M),Math.sqrt(1-M));return parseInt(6371*d)}
function deg2rad(n){return n*(Math.PI/180)}

// function for dynamic sorting
function compareValues(key,order='asc'){return function(a,b){if(!a.hasOwnProperty(key)||!b.hasOwnProperty(key)){return 0}
const varA=(typeof a[key]==='string')?a[key].toUpperCase():a[key];const varB=(typeof b[key]==='string')?b[key].toUpperCase():b[key];let comparison=0;if(varA>varB){comparison=1}else if(varA<varB){comparison=-1}
return((order=='desc')?(comparison*-1):comparison)}}

function showAll() { 
    for(var i=0;i<items.length;i++){
    items[i].marker.setVisible(true); 
    }
}       

function setVisibility(id){
    for(var i=0;i<items.length;i++){
    items[i].marker.setVisible(false); 
    }
    items[id].marker.setVisible(true); 
}             

function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}  

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
        
    // Handlebars Helper
    Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
        return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });         
    /*************************************/             
    
    $(document.body).on('click', '.menu_lateral', function() {
    var id = $(this).data('id');
    $('.menu_lateral').removeClass('active');
    $(this).addClass('active');
    setVisibility(id)
    google.maps.event.trigger(items[id].marker,'click')
    map.panTo(items[id].marker.getPosition())
    });         

    
    function success(pos) {
    var crd = pos.coords;
    console.log('More or less ' + crd.accuracy + ' meters.');         
    myPosition = {lat: crd.latitude, lng: crd.longitude};         
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: myPosition
    }); 
    // Set current position
    var position = new google.maps.Marker({
        position: myPosition,
        map: map,
        title: 'Mi ubicación'
    });   
    position.setMap(map); 
    setMarkers();       
        
    };
    
    function error(err) {
    // Si hay error muestra el mapa sin geoposicion
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: {lat: -34.6209276, lng: -58.4458738}
    }); 
    setMarkers();
    };


    function setMarkers() {
    $.ajax({
        dataType: "json",
        url: "data.json",
        success: function(i){     
        var infowindow = new google.maps.InfoWindow();
        items = i;

        // Calcular distancia
        for (i in items) {  
        if(!isEmpty(myPosition)){
            items[i].distancia = calculateDistance(myPosition.lat,myPosition.lng,items[i].latitud,items[i].longitud);  
        }      
        }

        // Ordenar por distancia
        if(!isEmpty(myPosition)){
        items.sort(compareValues('distancia')); 
        } else {
        items.sort(compareValues('provincia')); 
        }               
        // Fin de calcular distancia

        for (i in items) {  
        // Create marker
        var marker = new google.maps.Marker({
            position: {lat: items[i].latitud, lng: items[i].longitud},
            map: map,
            title: items[i].nombre,
            animation: google.maps.Animation.DROP,                
            icon: pinSymbol()
        });  
        items[i].marker = marker;                
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
            infowindow.setContent(items[i].nombre + '<br>' + items[i].direccion + '<br>' + items[i].localidad );
            infowindow.open(map, marker);
            }
        })(items[i].marker, i));                
        }       

        // Template
        var targetContainer = $("#items_layout");
        var source = $("#mustacheTemplate").html();
        var template = Handlebars.compile(source);
        var html = template({items: items});            
        $(targetContainer).html(html);          
        }
    }); 
    }
    
    // Run
    navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
    });  