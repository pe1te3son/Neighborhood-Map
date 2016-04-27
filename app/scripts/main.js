var locations = [
  {
    name: "British Museum",
    lat: 51.519459,
    lng: -0.126931
  },
  {
    name: "Madame Tussauds",
    lat:  51.5229,
    lng: -0.1548
  },
  {
    name: "Buckingham Palace",
    lat: 51.501476,
    lng: 	-0.140634
  }
];

var map;

var initMap = function(){

  var mapOptions = {
    center: { lat: locations[0].lat,  lng: locations[0].lng},
    zoom: 11
  }
  //loads a map
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  //view model binding
  ko.applyBindings( new ViewModel(locations));
};//mapInit() ends


//place object
var Place = function(data){
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.name = ko.observable(data.name);

  //creates marker for this place
  this.marker = new google.maps.Marker({
    position:  {lat:this.lat(), lng:this.lng()},
    map: map,
    draggable: true,
    title: this.name(),
    animation: google.maps.Animation.DROP
  });

  //listens for click on marker
  google.maps.event.addListener(this.marker, 'click', function() {
    map.setZoom(15);
    map.setCenter(this.getPosition());

    if (this.getAnimation() !== null) {
      this.setAnimation(null);
    } else {
      this.setAnimation(google.maps.Animation.BOUNCE);
    }

  });

  //runs animation on click
  this.itemClick = function() {
    if (this.marker.getAnimation() !== null) {
      this.marker.setAnimation(null);
    } else {
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  };

};

var ViewModel = function(data){
  var self = this;
  self.data = data;
  self.places = ko.observableArray();//holds all places

  //listens for click then calls object`s click function
  self.itemClick = function(el){
    //el = element clicked on
    el.itemClick();

    // center the map when location on the list is clicked
    map.setCenter({lat: el.lat(), lng: el.lng()});
    map.setZoom(15);
  };

  //creates array with all places
  self.data.forEach(function(place){
    self.places().push(new Place(place));
  });





};
