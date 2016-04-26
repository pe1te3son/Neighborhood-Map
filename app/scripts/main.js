var locations = [
  {
    lat: 51.507351,
    lng: -0.127758
  }
];


var initMap = function(){
  var map;
  var mapOptions = {
    center: locations[0],
    zoom: 8
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

ko.applyBindings( new ViewModel());
};//mapInit() ends


//place object
var Place = function(data){
  this.lat = data.lat;
  this.lng = data.lng;
}

var ViewModel = function(){
  var self = this;

  //creates array with all places
  self.allPlaces = ko.observableArray([]);

};
