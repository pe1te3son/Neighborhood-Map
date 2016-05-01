//array of all places
var data = {
  "auth": {
    "client_id": "COIOBSSXMC4DBNB22N0WZ1WC3W0PXOFMC1NJW5PN1BL0FINU",
    "client_secret": "QKFUWS0PWNBAKMHNDGTPYUT0CAQIM2TJGJIHWSMH4Q5YORRH"
  },
  "locations": [
    {
      "name": "British Museum",
      "lat": 51.519459,
      "lng": -0.126931,
      "id": "4ac518d2f964a5203da720e3"
    },
    {
      "name": "Madame Tussauds",
      "lat":  51.5229,
      "lng": -0.1548,
      "id": "4ac518cef964a520fca520e3"
    },
    {
      "name": "Buckingham Palace",
      "lat": 51.501476,
      "lng": 	-0.140634,
      "id": "4abe4502f964a520558c20e3"
    }
  ]
};

var map;


var Place = function(dataArray){
  var self = this;
  self.lat = ko.observable(dataArray.lat);
  self.lng = ko.observable(dataArray.lng);
  self.name = ko.observable(dataArray.name);
  self.id = ko.observable(dataArray.id);
  self.client_id = data.auth.client_id;
  self.client_secret = data.auth.client_secret;
  self.position = ko.computed(function(){
    return {lat: self.lat(), lng: self.lng()};
  });
  self.ajaxurl = function(){
    var url = 'https://api.foursquare.com/v2/venues/'+ self.id() +'?client_id='+ self.client_id +'&client_secret='+ self.client_secret +"&v=20160501";
    return url;
  }



  self.ajaxInfo = function(){
    var string = "hey";
    $.ajax({
      dataType: "json",
      url: self.ajaxurl(),
      success: function(data){

        string = data.response;
        console.log(string);
      },
      error: function(){

      }
    });
    return string;
  };//ajaxInfo() ends
};


var MyViewModel = function() {
    var self = this;
    self.places = ko.observable([]);

    data.locations.forEach(function(loc){
      self.places().push(new Place(loc));
    });


}


ko.bindingHandlers.googlemap = {
  init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    var value = valueAccessor();

    // console.log(element);
    // console.log(valueAccessor);
    // console.log(allBindings);
    // console.log(viewModel);
    // console.log(bindingContext);

    var mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(value.centerLat, value.centerLon),
        mapTypeId: google.maps.MapTypeId.ROADMAP
        },
      map = new google.maps.Map(element, mapOptions);

    var infowindow = new google.maps.InfoWindow();

    for(var i=0; i<value.places().length; i++){
      var latLng = new google.maps.LatLng(value.places()[i].position());
      value.places()[i].marker = new google.maps.Marker({
        position: latLng,
        map: map,
        info: value.places()[i].ajaxInfo()
      });

      value.places()[i].marker.addListener('click', function(){

        infowindow.setContent(this.info);
        infowindow.open(map, this);
      });
    }//for loop



  },

  update: function(){

  }


};


ko.applyBindings(new MyViewModel());
