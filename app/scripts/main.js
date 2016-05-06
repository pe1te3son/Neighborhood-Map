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
    },
    {
      "name": "Stratford picture house",
      "lat": 51.54303859900249,
      "lng": 0.001206887404320114,
      "id": "4b310ca6f964a52002ff24e3"
    },
    {
      "name": "Hyde park",
      "lat": 51.507460346127864,
      "lng": 	-0.16213417053222656,
      "id": "4ac518d2f964a52026a720e3"
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
  self.id = ko.observable(dataArray.id);
  self.position = ko.computed(function(){
    return {lat: self.lat(), lng: self.lng()};
  });
  self.name = ko.observable(dataArray.name);
  self.photoLink = ko.observable();
  self.address = ko.observable();
  self.ratingColor = ko.observable();
  self.rating = ko.observable();
  self.desc = ko.observable();
  self.facebook = ko.observable();
  self.twitter = ko.observable();
  self.phone = ko.observable();
  self.phoneTel = ko.observable();
  self.statusL = ko.observable();


};

/**
* View model
*/
var MyViewModel = function() {
  var self = this;
  self.places = ko.observableArray();
  self.search = ko.observable('');
  self.displayInfo = ko.observable('');
  self.infoWin = ko.observable(new google.maps.InfoWindow());
  self.currentPlace = ko.observable();
  self.checkIfexist = ko.observable();
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
  self.locClick = function(place){

    //Sets animation when location is cliked
    if (place.marker.getAnimation() !== null) {
      place.marker.setAnimation(null);
    } else {
      place.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    // Animation reset
    setTimeout(function(){place.marker.setAnimation(null);}, 1500);

    // Sets selected location`s marker to the center of map
    map.setCenter(place.marker.getPosition());

    // Calls for data to display
    self.getInfo(place.marker);


    //opens info about selected location
    self.openMoreInfo();
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
    var place = marker.parent;
    var client_id = data.auth.client_id;
    var client_secret = data.auth.client_secret;
    var url = 'https://api.foursquare.com/v2/venues/'+ place.id() +'?client_id='+ client_id +'&client_secret='+  client_secret +"&v=20160501";
    console.log(url);
    $.ajax({
      dataType: "json",
      url: url,
      cache: true,
       success: function(data){

      self.processInfo(data, place);
      self.infoWin().setContent('<h4 style="border-bottom: 1px solid; margin: 0 ">'+place.name()+'</h4>');
      self.infoWin().open(map, place.marker);
        console.log(data.response.venue);
      },
      error: function(){
        var markerContent = "fuck me";
      self.infoWin().setContent(markerContent);
      self.infoWin().open(map, place.marker);
      }
    });
  };// getInfo() ends

  self.processInfo = function(data, place){
    var venue = data.response.venue;

    // Photo
    if(venue.bestPhoto){

      place.photoLink(venue.bestPhoto.prefix +"400x300"+venue.bestPhoto.suffix);
    }

    // Name of the location
    if(venue.name){
      place.name(venue.name);
    }

    // Address
    if(venue.location.formattedAddress){
      place.address(venue.location.formattedAddress);
    }

    //Ratings
    if(venue.rating && venue.ratingColor){
      var color = 'background: #'+ venue.ratingColor;
      place.ratingColor(color);
      place.rating(venue.rating);
    }

    // Description
    if(venue.description){
      place.desc(data.response.venue.description);
    }

    if(venue.contact.facebook){
      place.facebook('http://facebook.com/'+venue.contact.facebook);
      place.facebookExists = ko.observable(true);
    }else{
      place.facebookExists = ko.observable(false);
    }

    if(venue.contact.twitter){
      place.twitter(venue.contact.twitter);
      place.twitterExists = ko.observable(true);
    }else{
      place.twitterExists = ko.observable(false);
    }

    if(venue.contact.phone){
      place.phone(venue.contact.phone);
      place.phoneTel('tel:'+venue.contact.phone);
      place.phoneExists = ko.observable(true);
    }else{
      place.phoneExists = ko.observable(false);
    }

    //sets current place to be displayed
    self.currentPlace(place);


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
        parent: place
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
