//array of all places
var locations = [
  {
    name: "British Museum",
    lat: 51.519459,
    lng: -0.126931,
    id: "4ac518d2f964a5203da720e3"
  },
  {
    name: "Madame Tussauds",
    lat:  51.5229,
    lng: -0.1548,
    id: "4ac518cef964a520fca520e3"
  },
  {
    name: "Buckingham Palace",
    lat: 51.501476,
    lng: 	-0.140634,
    id: "4abe4502f964a520558c20e3"
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
  this.id = data.id;

  //creates marker for this place
  this.marker = new google.maps.Marker({
    position:  {lat:this.lat(), lng:this.lng()},
    map: map,
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
  self.ajaxurl = 'https://api.foursquare.com/v2/venues/'+this.id+'?client_id=COIOBSSXMC4DBNB22N0WZ1WC3W0PXOFMC1NJW5PN1BL0FINU&client_secret=QKFUWS0PWNBAKMHNDGTPYUT0CAQIM2TJGJIHWSMH4Q5YORRH&v=20140806';

  /**
  * Listens for click then calls object`s click function
  * @desc Runs when list item is clicked
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
    }, 750)
  };

  //creates array with all places
  self.data.forEach(function(place){
    self.places().push(new Place(place));
  });

  self.ajaxtest = function(){
    console.log('gothca');
  }
  //adds click listener to each marker
  var infowindow = new google.maps.InfoWindow();
  self.places().forEach(function(place){
      google.maps.event.addListener(place.marker, 'click', function() {
      infowindow.open(map, this);
      self.ajaxtest();
      console.log()
    });
  });




};//ViewModel() ends
