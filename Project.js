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
	searchBoxMarkers = [];
	searchinfoWindow = [];
	markerD = [];
	selectedMarker = [];
	markerAddress = [];
	inputSelected = false;

	map = new google.maps.Map($('map-canvas'));

	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(40.4774, -74.2591),
		new google.maps.LatLng(40.9176, -73.7003));
	map.fitBounds(defaultBounds);
	
	for (var i = 0; i < 4; i++){
		inputArray[i] = "search"+i;
		autocompleteArray[i] = new google.maps.places.Autocomplete($(inputArray[i]));
		autocompleteArray[i].bindTo('bounds', map);
		directionsDisplay[i] = new google.maps.DirectionsRenderer({"draggable":true, suppressMarkers: true});
		directionsDisplay[i].setMap(map);
		infowindow[i] = new google.maps.InfoWindow();
		marker[i] = new google.maps.Marker({
			map: map,
			anchorPoint: new google.maps.Point(0, -29)
		});
	};
	google.maps.event.addListener(autocompleteArray[0], 'place_changed', function() {
		calcSearch(0);
	});
	google.maps.event.addListener(autocompleteArray[1], 'place_changed', function() {
		calcSearch(1);
	});
	google.maps.event.addListener(autocompleteArray[2], 'place_changed', function() {
		calcSearch(2);
	});
	service = new google.maps.places.PlacesService(map);
}

var calcSearch = function(x){
	
	infowindow[x].close();
	marker[x].setVisible(false);
	var place = autocompleteArray[x].getPlace();

	if (place.length == 0){
		return;
	}
	if (place.name == ""){

		calcRoute();
	}
	currentPlace[x] = place;

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
		bounds.extend(currentPlace[i].geometry.location);
	};
	map.fitBounds(bounds);
	calcRoute();

};

function calcRoute(){
	directionsDisplay[0].setMap(null);
	directionsDisplay[1].setMap(null);
	directionsDisplay[2].setMap(null)
	
	var start = 0;
	var end = 0;
	var mode = "mode0"

	for (var i = 0; i < 2; i++){
		
		if ($(inputArray[i]).value != ""){
			start = $(inputArray[i]).value;
			console.log(start);
			mode = selectedMode[i] = "mode"+i;
		}
		if ($(inputArray[i+1]).value != null){
			end = $(inputArray[i+1]).value; 
			console.log(end);
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
		directionsDisplay[0].setMap(map);
	}});
	directionsService.route(request[1], function(response, status){
		if (status == google.maps.DirectionsStatus.OK){
			directionsDisplay[1].setOptions({ preserveViewport:true});
			directionsDisplay[1].setDirections(response);
			directionsDisplay[1].setMap(map);
	}});
	directionsService.route(request[2], function(response, status){
		if (status == google.maps.DirectionsStatus.OK){
			directionsDisplay[2].setOptions({ preserveViewport:true});
			directionsDisplay[2].setDirections(response);
			directionsDisplay[2].setMap(map);
	}});
}

detourMarkers = [];

var searchButton = function() {
	inputSelected = false;
	$("clear").click;
	for (var i in detourMarkers) {
		detourMarkers[i].setMap(null);
    };
	for (var i in markerAddress) {
		markerAddress[i].setMap(null);
    };
	console.log(detourMarkers);
	detourMarkers = [];
	console.log(detourMarkers);
	query = $("SearchBoxTest").value
	var request = {
		bounds: map.getBounds(),
		query: query,

	};
	service.textSearch(request, callback);

};
function callback(results, status){
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {

			if (i > 9){
				break;
			} else {
				(function(detourMarkers, markerAddress, selectedMarker){

					var place = results[i];
					var markerD = new google.maps.Marker({
						map: map,
						title: place.name,
						position: place.geometry.location,
					});
					searchinfoWindow = new google.maps.InfoWindow();
					google.maps.event.addListener(markerD, 'mouseover', function() {
						markerAddress = [];
						markerAddress.push(place.name);
						markerAddress.push(place.formatted_address);
						markerAddress.push(place);
						$("searchx").value = markerAddress[0] + "\n" + markerAddress[1];
						$("search1").value = markerAddress[1];
						searchinfoWindow.setContent(place.name);
						searchinfoWindow.open(map, markerD);
						//calcRoute();
					});
					
					google.maps.event.addListener(markerD, 'mouseout', function() {
						if(inputSelected = false){
							$("search1").value = "";
						};
						$("searchx").value = "";
						//$("search1").value = "";
						searchinfoWindow.close();
			
					});
					google.maps.event.addListener(markerD, 'click', function() {

						$("clear").onclick = function (){
							for (var i in detourMarkers) {
								detourMarkers[i].setMap(null);
							};
							detourMarkers = [];
							$("search1").value = "";
							calcRoute();
						};
						
						inputSelected = true;		
						marker[1].setVisible(false);
						infowindow[1].close();						
						var place = markerAddress[2];	
						var markerD = new google.maps.Marker({
							map: map,
							//icon: image,
							title: place.name,
							position: place.geometry.location,
						});
						
						searchinfoWindow = new google.maps.InfoWindow();
						console.log(results.name);
						google.maps.event.addListener(markerD, 'mouseover', function() {
							markerAddress = [];
							markerAddress.push(place.name);
							markerAddress.push(place.formatted_address);
							markerAddress.push(place);
							$("searchx").value = markerAddress[0] + "\n" + markerAddress[1];
							console.log(markerAddress);
							searchinfoWindow.setContent(markerAddress[0] + "<br>" + markerAddress[1]);
							searchinfoWindow.open(map, markerD);
						});
						
						google.maps.event.addListener(markerD, 'mouseout', function() {
						$("searchx").value = "";
						searchinfoWindow.close();					
						});
						
						console.log(markerAddress);
						$("search1").value = markerAddress[1];
						for (var i in detourMarkers) {
							detourMarkers[i].setMap(null);
						};
						detourMarkers = [];
						detourMarkers.push(markerD);
						console.log(detourMarkers);	
						calcRoute();						
					});
					
					$("clear").onclick = function (){
						for (var i in detourMarkers) {
							detourMarkers[i].setMap(null);
						};
						detourMarkers = [];
					};

					detourMarkers.push(markerD);
					console.log(detourMarkers);
						
				}(detourMarkers, markerAddress, selectedMarker));

			};
		};
	};
};


var clearButton = function (){
	for (var i in detourMarkers) {
		detourMarkers[i].setMap(null);
	};
	detourMarkers = [];
};
var routeButton = function callcalcRoute(){
	calcRoute();
}
window.onload = function(){
	 $("route").onclick = routeButton;
	 $("search").onclick = searchButton;
	 $("clear").onclick = clearButton;
};

google.maps.event.addDomListener(window, 'load', initialize);

