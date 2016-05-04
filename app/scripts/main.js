$(document).ready(function(){
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
/*
  global map
*/
var map;


/**
*  All place`s object
*  @param: dataArray - json
*  Object for every place
*
*/
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
  self.image = ko.observable();
  self.desc = ko.observable();

};

/**
* View model
*/
var MyViewModel = function() {
  var self = this;
  self.places = ko.observable([]);
  self.search = ko.observable('');
  self.infoWin = ko.observable(new google.maps.InfoWindow());

  //adds Place into observable array
  data.locations.forEach(function(loc){
    self.places().push(new Place(loc));
  });

  //Filters locations based on search input
  self.searchInput = ko.computed(function() {
    var filter = this.search().toLowerCase();

    if (!filter) {

        if(self.places()[0].marker){//resets all markers to be visible, if search input has been cleared
          self.places().forEach(function(place){
            place.marker.setVisible(true);
          });
        }

        return self.places();
    } else {
      return ko.utils.arrayFilter(self.places(), function(item) {

        var found = item.name().toLowerCase().indexOf(filter) !== -1 ;
        if (found) {

          //If result is true, show correct marker based off users search
          item.marker.setVisible(true);
        } else {

          //hide markers that do not show users search results
          item.marker.setVisible(false);
        }
        return found;
      });
    }
  }, self);

  self.locClick = function(e){

    //Sets animation when location is cliked
    if (e.marker.getAnimation() !== null) {
      e.marker.setAnimation(null);
    } else {
      e.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    setTimeout(function(){e.marker.setAnimation(null);}, 750);

    //opens info about selected location
    openMoreInfo();
  };

  /**
  *  Ajax request function
  *  This function runs when marker is clicked, it retrieves data from foursquare
  *  @param marker - google map marker
  *
  */
  self.getInfo = function(marker){

    var client_id = data.auth.client_id;
    var client_secret = data.auth.client_secret;
    var url = 'https://api.foursquare.com/v2/venues/'+ marker.id +'?client_id='+ client_id +'&client_secret='+  client_secret +"&v=20160501";

    $.ajax({
      dataType: "json",
      url: url,
      cache: true,
       success: function(data){

      var content = self.processInfo(data);
      self.infoWin().setContent(content);
      self.infoWin().open(map, marker);
        console.log(data.response.venue);
      },
      error: function(){
        var content = "fuck me";
      self.infoWin().setContent(content);
      self.infoWin().open(map, marker);
      }
    });
  };// getInfo() ends

  self.processInfo = function(data){
    var content = '<div class="infowindow">';
    var photo = data.response.venue.bestPhoto.prefix +"150"+data.response.venue.bestPhoto.suffix;
    content += '<img class="iw-img" src='+photo+'>';
    content +=  '<p class="iw-rat" style="background: #'+ data.response.venue.ratingColor +'; color: white">Rating: '+data.response.venue.rating+'</p>';
    var name = data.response.venue.name;
    content += '<h3 class="iw-name">'+ name +'</h3>';
    if(data.response.venue.description){
      var desc = data.response.venue.description;
      var trimDesc = desc.substring(0, 100);
      content += '<p class="iw-desc">'+ trimDesc +'...</p>';
    }

    content += '</div>';
    return content
  };// processInfo ends


}; // MyViewModel ends

/**
* Custom binding for google map
* Creates map, marker and infowindow for each place
*
*/
ko.bindingHandlers.googlemap = {
  init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

    //Binding with map element in index.html
    var mapEl = valueAccessor();

    //Settings for map
    var mapOptions = {
      zoom: 11,
      center: new google.maps.LatLng(mapEl.centerLat, mapEl.centerLon),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
      }
    };

    // Creates map and adds to map div
    map = new google.maps.Map(element, mapOptions);

    window.mapBounds = new google.maps.LatLngBounds();

  },// init ends
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext){
    var mapEl = valueAccessor();
    // console.log(element);
    // console.log(valueAccessor());
    // console.log(allBindings());
    // console.log(viewModel);
    // console.log(bindingContext);

    // Creates marker for each place
    mapEl.places().forEach(function(place){
      var latLng = new google.maps.LatLng(place.position());

      place.marker = new google.maps.Marker({
        position: latLng,
        map: map,
        animation: google.maps.Animation.DROP,
        id: place.id()
      });

      place.marker.addListener('click', function(){
        //sets marker to be in center of window when clicked
      //  map.setCenter(this.getPosition());

        /**
        *  When clicked retrieve and display data
        *  Takes marker as an argument
        */
        viewModel.getInfo(this);
        openMoreInfo();
      });

      var bounds = window.mapBounds;
      bounds.extend(new google.maps.LatLng(place.position()));
      // fit the map to the new marker
      map.fitBounds(bounds);
      // center the map
      map.setCenter(bounds.getCenter());

    });//foreach ends


    window.addEventListener('resize', function(e) {
    // Make sure the map bounds get updated on page resize
     map.fitBounds(mapBounds);
   });

  }// update  ends

};

  ko.applyBindings(new MyViewModel());

  /**
  * SIDE MENU
  *
  */

  var offCanvas = function(){
    var $button = document.getElementById('off-btn');
    var $body = document.getElementById('off-body');
    var $nav = document.getElementById('off-nav');

    $button.addEventListener('click', function(e){
      $nav.classList.toggle('off-shift');
      $body.classList.toggle('off-shift');
    }, false);
  };
  offCanvas();


  var moreInfo = function(){
    var $button = document.getElementById('close-info');
    var $info = document.getElementById('more-info');

    $('#close-info').click(function(){
      $('#more-info').removeClass('slide-out');
    });

  }
  moreInfo();

  var openMoreInfo = function(){
    //open more-info window
    if(!$('#more-info').hasClass('slide-out')){
      $('#more-info').addClass('slide-out');
    }
  };

});
