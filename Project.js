var $ = function(id){
	return document.getElementById(id);
}

function initialize() {
	infowindow = [];
	marker = [];
	inputArray = [];
	autocompleteArray = [];
	currentPlace = [];
	directionsService = new google.maps.DirectionsService();
	directionsDisplay = [];
	request = [];
	selectedMode = [];

	var mapOptions = {
		center: new google.maps.LatLng(-33.8688, 151.2195),
		//zoom: 13
	};

	map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);

	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(40.4774, -74.2591),
		new google.maps.LatLng(40.9176, -73.7003));
	map.fitBounds(defaultBounds);
		
	var options = {
		bounds: defaultBounds,
		componentRestrictions: "us"
	};
	
	for (var i = 0; i < 3; i++){
		inputArray[i] = "search"+i;
		autocompleteArray[i] = new google.maps.places.Autocomplete($(inputArray[i]));
		autocompleteArray[i].bindTo('bounds', map);
		directionsDisplay[i] = new google.maps.DirectionsRenderer({"draggable":true, suppressMarkers: true});
		directionsDisplay[i].setMap(map);
		//directionsDisplay[i].setPanel($("directions-panel"));
		infowindow[i] = new google.maps.InfoWindow();
		marker[i] = new google.maps.Marker({
			map: map,
			anchorPoint: new google.maps.Point(0, -29)
		});
	};
	
	google.maps.event.addListener(autocompleteArray[0], 'place_changed', function() {
		calcSearchBox(0);
	});
	google.maps.event.addListener(autocompleteArray[1], 'place_changed', function() {
		calcSearchBox(1);
	});
	google.maps.event.addListener(autocompleteArray[2], 'place_changed', function() {
		calcSearchBox(2);
	});
/*
	google.maps.event.addListener(autocompleteArray[3], 'place_changed', function() {
		calcSearchBox(3);
	});*/
}

var calcSearchBox = function(x){
	
	infowindow[x].close();
	marker[x].setVisible(false);
	var place = autocompleteArray[x].getPlace();
	if (place.length == 0){
		return;
	}
	currentPlace[x] = place;
	if (!place.geometry) {
		window.alert("Autocomplete's returned place contains no geometry");
		return;
	}

	marker[x].setIcon({
		url: place.icon,
		size: new google.maps.Size(71, 71),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(17, 34),
		scaledSize: new google.maps.Size(35, 35)
	});
	marker[x].setPosition(place.geometry.location);
	marker[x].setVisible(true);

	var address = ''; 
	if (place.address_components) {
		address = [
		(place.address_components[0] && place.address_components[0].short_name || ''),
		(place.address_components[1] && place.address_components[1].short_name || ''),
		(place.address_components[2] && place.address_components[2].short_name || '')
		].join(' ');
	}
	infowindow[x].setContent('<div><strong>' + place.name + '</strong><br>' + address);
	infowindow[x].open(map, marker[x]);

	bounds = new google.maps.LatLngBounds();	
	for (var i in currentPlace){
		console.log(currentPlace);
		bounds.extend(currentPlace[i].geometry.location);
	};
	map.fitBounds(bounds);

}

function calcRoute(){
	var start = 0;
	var end = 0;
	var mode = "mode0"
	//var selectedMode = $("mode").value;

	for (var i = 0; i < 2; i++){
		if ($(inputArray[i]).value != ""){
			start = $(inputArray[i]).value;
			mode = selectedMode[i] = "mode"+i;
		}
		if ($(inputArray[i+1]).value != null){
			end = $(inputArray[i+1]).value; 
		} 
		
		request[i] = { 
			origin:start,
			destination:end,
			travelMode: google.maps.TravelMode[$(mode).value]
		};
	};
	
	directionsService.route(request[0], function(response, status){
		if (status == google.maps.DirectionsStatus.OK){
		directionsDisplay[0].setOptions({ preserveViewport:true});
		directionsDisplay[0].setDirections(response);
	}});
	directionsService.route(request[1], function(response, status){
		if (status == google.maps.DirectionsStatus.OK){
			directionsDisplay[1].setOptions({ preserveViewport:true});
			directionsDisplay[1].setDirections(response);
	}});
	/*
	directionsService.route(request[2], function(response, status){
		if (status == google.maps.DirectionsStatus.OK){
			directionsDisplay[2].setDirections(response);
	}});*/
	
	map.fitBounds(bounds);
}


var routeButton = function callcalcRoute(){
	calcRoute();
}
window.onload = function(){
	 $("route").onclick = routeButton;
};

google.maps.event.addDomListener(window, 'load', initialize);

