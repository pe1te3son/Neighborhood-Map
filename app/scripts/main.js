//array of all places
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

/**
* Map basic settings
* It`s being called in index.html
*
*/
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
    animation: google.maps.Animation.DROP,
  });

};

/**
* View model
* @param array - data - array of all places
* It is called in initMap
*/
var ViewModel = function(data){
  var self = this;
  self.data = data;
  self.places = ko.observableArray();//holds all places

  /**
  * Listens for click then calls object`s click function
  * Runs when list item is clicked
  * Takes no arguments
  * el = element clicked on
  */
  self.itemClick = function(el){

    // center the map when location on the list is clicked
    map.setCenter({lat: el.lat(), lng: el.lng()});

    //sets animation
    if (el.marker.getAnimation() !== null) {
      el.marker.setAnimation(null);
    } else {
      el.marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    //resets animation in 1 second
    setTimeout(function(){
      el.marker.setAnimation(null);
    }, 1000)
  };

  //creates array with all places
  self.data.forEach(function(place){
    self.places().push(new Place(place));
  });

  //adds click listener to each marker
  var infowindow = new google.maps.InfoWindow();
  self.places().forEach(function(place){
      google.maps.event.addListener(place.marker, 'click', function(e) {
      infowindow.open(map, this);
    });
  });




};//ViewModel() ends
