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
  self.displayInfo = ko.observable('');
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

  /**
  * Triggers when location in slide in menu is being clicked.
  * Takes event as argument, which is in this case Place
  *
  */
  self.locClick = function(e){

    //Sets animation when location is cliked
    if (e.marker.getAnimation() !== null) {
      e.marker.setAnimation(null);
    } else {
      e.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    // Animation reset
    setTimeout(function(){e.marker.setAnimation(null);}, 1500);

    // Sets selected location`s marker to the center of map
    map.setCenter(e.marker.getPosition());
    //opens info about selected location
    self.openMoreInfo();
    // Calls for data to display
    self.getInfo(e.marker);
  };

  // Closes info window
  self.closeMoreInfo = function(){

    $('#more-info').removeClass('slide-out');

  };


  self.openMoreInfo = function(){
    //open more-info window
    if(!$('#more-info').hasClass('slide-out')){
      $('#more-info').addClass('slide-out');
    }
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

      var markerContent = self.processInfo(data);
      self.infoWin().setContent(markerContent);
      self.infoWin().open(map, marker);
        console.log(data.response.venue);
      },
      error: function(){
        var markerContent = "fuck me";
      self.infoWin().setContent(markerContent);
      self.infoWin().open(map, marker);
      }
    });
  };// getInfo() ends

  self.processInfo = function(data){

    // Photo
    var content = '<div class="infowindow">';
    var photo = data.response.venue.bestPhoto.prefix +"400x300"+data.response.venue.bestPhoto.suffix;
    content += '<img src='+photo+' class="iw-img">';

    // Name of the location
    var name = data.response.venue.name;
    content += '<h3 class="iw-name">'+ name +'</h3>';

    // Address
    var address = data.response.venue.location.formattedAddress
    var formattedAddress = '<p class="iw-address">';
    formattedAddress += address[0];
    for(var i=1; i<address.length; i++){
      formattedAddress += ', '+ address[i];
    }
    formattedAddress += '</p>';
    content += formattedAddress;

    //Ratings
    var ratings = '<p class="iw-rat" style="background: #'+ data.response.venue.ratingColor +'; color: white">Rating: '+data.response.venue.rating+' <sup> / 10</sup></p>';
    content +=  ratings;

    // Description
    if(data.response.venue.description){
      var desc = data.response.venue.description;
      content += '<p class="iw-desc">'+ desc +'</p>';
    }

    var contact = '';


    // Opening times
    if(data.response.venue.hours){
      var hours = '';
      if(data.response.venue.hours.isOpen){
        hours = '<p class="iw-times">'+ data.response.venue.hours.status +'</p>';
      }else{
          hours = '<p class="close-color iw-times">'+ data.response.venue.hours.status +'</p>';
      }
      content += hours;
    }


    content += '</div>';
    $('#more-info-window').html('').append(content);

    // Returns selected processed data to marker
    var markerContent = '<h4 style="margin: 0; border-bottom: 1px solid">'+ name +'</h4>';
    return markerContent;

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
        map.setCenter(this.getPosition());

        /**
        *  When clicked retrieve and display data
        *  Takes marker as an argument
        */
        viewModel.getInfo(this);
        viewModel.openMoreInfo();
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
     viewModel.closeMoreInfo();
     viewModel.infoWin().close();
   });

  }// update  ends

};

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

  ko.applyBindings(new MyViewModel());
});
