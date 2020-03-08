// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require turbolinks
//= require_tree .
var map;
var markers = [];
var markerDetails = [];
var labels = ['1','2','3','4','5','6','7','8','9','10'];
var i = 0;
var dateTimeString;
var resultsDiv = document.getElementById("results-div");
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 51.509, lng: -0.118},
		zoom: 13,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false
		});
	map.addListener('click', function(e) {
		if (i < 10) {
		if (e.latLng.lat() < 51.37 || e.latLng.lat() > 51.67 || e.latLng.lng() < -0.48 || e.latLng.lng() > 0.26) {
			resultsDiv.innerHTML = "Marker must be inside London";
		} else {
			resultsDiv.innerHTML = "";
		var markerLatLng = {lat: e.latLng.lat(), lng: e.latLng.lng()};
		var marker = new google.maps.Marker({
	 		position: markerLatLng,
			map: map,
			label: labels[i]
	});
	markers.push(marker);
	var theMarker = new Object();
	theMarker.latitude = e.latLng.lat();
	theMarker.longitude = e.latLng.lng();
	theMarker.label = labels[i];
	theMarker.isLast = false;
	theMarker.to_s = function(count) {
		if (this.isLast) {
			return "latitude" + count + "=" + this.latitude + "&longitude" + count + "=" + this.longitude + "&label" + count + "=" + this.label;
		} else {
			return "latitude" + count + "=" + this.latitude + "&longitude" + count + "=" + this.longitude + "&label" + count + "=" + this.label + "&";
		}
	}
	markerDetails.push(theMarker);
	i++;
	document.getElementById("timelabel"+ i).style.display = '';
	document.getElementById("time" + i).style.display = '';
	}
	}
});
};
// Passes the values of the time spent at x boxes so they can be used as a parameter, regexp checks legitimate fomat
function getDestinationTimes() {
	var destinationString = "";
	for(a = 1; a <= i; a++) {
		var destination = document.getElementById("time" + a).value
		if (destination && (destination.match(/^\d{2}$/) || destination.match(/^\d$/))) {
			destinationString += "timeAt" + a + "=" + document.getElementById("time" + a).value + "&";
		}
	}
	return destinationString;
}
// Creates a request to the server which passes parameters from the datetime string and destination time string and puts all the marker objects to_string
function getResults() {
	var queryString = "";
	for(b = 0; b < markerDetails.length; b++) {
		if (b == markerDetails.length - 1) {
			markerDetails[b].isLast = true;
		} else {
			markerDetails[b].isLast = false;
		}
		queryString += markerDetails[b].to_s(b + 1);
	}
	if (i < 1) {
	resultsDiv.innerHTML = "Add at least one marker before getting results";
	} else {
	if (evalDateTime()) {
		var request = new XMLHttpRequest();
		request.onload = function() {
			response = JSON.parse(request.responseText);
			var resultContent = '';
			for (var x = 0; x < response.length; x++) {
				resultContent += '<div class = "topresult">Arrive at: ' + displayResults(response[x].arrive_at) + '</div>';
				resultContent += '<div class = "midresult">Destination ' + response[x].label + '</div>';
				resultContent += '<div class = "bottomresult">Leave at: ' + displayResults(response[x].leave_at) + '</div>';
			}
			document.getElementById("results-div").innerHTML = resultContent;
		}
		request.open("GET", "main/getResults?" + "date_time=" + dateTimeString + "&" + getDestinationTimes() + queryString, true)
		request.send(null);
	}
	}
}
// Once the request has been made, displays the arrive at and leave at times in desired format 
function displayResults(result) {
	resultArray = result.match(/.{11}(.{8}).{10}/);
	return resultArray[1];
}
function removeMarker() {
	var getMarker = markers.length - 1;
	if (getMarker >= 0) {
		markers[getMarker].setMap(null);
		markers.splice(getMarker, 1);
		markerDetails.splice(getMarker, 1);
		document.getElementById("timelabel" + i).style.display = 'none';
		document.getElementById("time" + i).style.display = 'none';
		i--;
	};
}
// Checks if the Date and Time fields have been filled in correctly and sets the variable that will pass the date_time parameter
function evalDateTime() {
	var resultsDiv = document.getElementById("results-div");
	var errorText = "";
	var validDatetime = true;
	dateTimeString = "";
	var timeString;
	var dateString;
	var timeArray = document.getElementById("time").value.match(/(\d{2}):(\d{2})/);
		if (!timeArray) {
			resultsDiv.innerHTML = "Please format time in 24 hour format";
			return false;
		}
		if (timeArray[1] < 0 || timeArray[1] > 23) {
			errorText += "<br>Invalid hour of time";
			validDatetime = false;
		}  
		if (timeArray[2] < 0 || timeArray[2] > 59) {
			errorText += "<br>Invalid minute of time";
			validDatetime = false;
		}
		timeString = timeArray[1] + ":" + timeArray[2] + ":00"
	var dateArray = document.getElementById('date').value.match(/(\d{2})\/(\d{2})\/(\d{4})/)
		if (!dateArray) {
			resultsDiv.innerHTML = "Please format the date correctly";
			return false;
		}
		if ((dateArray[1] > 31 && dateArray[2] == 1) || (dateArray[1] > 29 && dateArray[2] == 2) || (dateArray[1] > 31 && dateArray[2] == 3) || (dateArray[1] > 30 && dateArray[2] == 4) || (dateArray[1] > 31 && dateArray[2] == 5) || (dateArray[1] > 30 && dateArray[2] == 6) || (dateArray[1] > 31 && dateArray[2] == 7) || (dateArray[1] > 31 && dateArray[2] == 8) || (dateArray[1] > 30 && dateArray[2] == 9) || (dateArray[1] > 31 && dateArray[2] == 10) || (dateArray[1] > 30 && dateArray[2] == 11) || (dateArray[1] > 31 && dateArray[2] == 12)) {
			errorText += "<br>Too many days given in this month";
			validDatetime = false;
		}
		if (dateArray[2] > 12) {
			errorText += "<br>Invalid month of date";
			validDatetime = false;
		}
		if (dateArray[3] < 2020) {
			errorText += "<br>Invalid year of date";
			validDatetime = false;
		}
		dateString = dateArray[3] + "-" + dateArray[2] + "-" + dateArray[1]
		dateTimeString = dateString + "T" + timeString;
		if (!validDatetime) {
			resultsDiv.innerHTML = errorText;
		} 
		return validDatetime;
}
 
document.getElementById("evaltime").addEventListener("click", getResults);
document.getElementById("deletelast").addEventListener("click", removeMarker);
var toHide = document.getElementsByClassName("timeform")
for (a = 0; a < toHide.length; a++) {
	toHide[a].style.display = 'none';
}