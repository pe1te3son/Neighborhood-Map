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

  self.what = function(){
    console.log('waht');
  }


};


var MyViewModel = function() {
    var self = this;
    self.places = ko.observable([]);

    for(var i =0; i<locations.length; i++){
      self.places().push(new Place(locations[i]));

    }

    self.click = function(el){

    };


}


ko.bindingHandlers.googlemap = {
  init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    var value = valueAccessor();
    var bin = allBindings();
    var mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(value.centerLat, value.centerLon),
        mapTypeId: google.maps.MapTypeId.ROADMAP
        },
      map = new google.maps.Map(element, mapOptions);



    for(var i=0; i<value.places().length; i++){
      var latLng = new google.maps.LatLng(value.places()[i].position());
      value.places()[i].marker = new google.maps.Marker({
        position: latLng,
        map: map,
        text: latLng
      });

      var infowindow = new google.maps.InfoWindow({
        content: 'hey'
      });


      value.places()[i].marker.addListener('click', function(){
        //console.log(viewModel)
        viewModel.click(this);
        infowindow.open(map, this);

      });
    }


  },

  update: function(element, valueAccessor, bindingContext){
    var data = bindingContext.$data;



  }
};


ko.applyBindings(new MyViewModel());
