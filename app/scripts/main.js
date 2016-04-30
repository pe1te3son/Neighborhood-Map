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


var Place = function(data){
  var self = this;
  self.lat = ko.observable(data.lat);
  self.lng = ko.observable(data.lng);
  self.name = ko.observable(data.name);
  self.position = ko.computed(function(){
    return {lat: self.lat(), lng: self.lng()};
  });



};


var MyViewModel = function() {
    var self = this;
    self.places = ko.observable([]);

    for(var i =0; i<locations.length; i++){
      self.places().push(new Place(locations[i]));

    }
}


ko.bindingHandlers.googlemap = {
  init: function (element, valueAccessor) {
    var
      value = valueAccessor(),
      mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(value.centerLat, value.centerLon),
        mapTypeId: google.maps.MapTypeId.ROADMAP
        },
      map = new google.maps.Map(element, mapOptions);

    for(var i=0; i<value.places().length; i++){
      var latLng = new google.maps.LatLng(
                      value.places()[i].lat(),
                      value.places()[i].lng()
                    );
      var marker = new google.maps.Marker({
        position: latLng,
        map: map
      });
    }
  },

  update: function(){
    console.log('got it');
  }
};


ko.applyBindings(new MyViewModel());
