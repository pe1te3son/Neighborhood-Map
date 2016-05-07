
// Array of all places
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
      "name": "The Cow",
      "lat": 51.519200629510514,
      "lng": -0.1954983152188697,
      "id": "4ac518bdf964a520dfa220e3"
    },
    {
      "name": "London Zoo",
      "lat": 51.535645144168825,
      "lng": -0.15573978424072266,
      "id": "4ac51183f964a52048a020e3"
    },
    {
      "name": "Royal Botanic Gardens",
      "lat": 51.477747968798816,
      "lng": -0.296630859375,
      "id": "4ac518cef964a52002a620e3"
    },
    {
      "name": "The Courtauld Gallery",
      "lat": 51.51157280958188,
      "lng": -0.1176735793118728,
      "id": "4ac518d2f964a5203fa720e3"
    },
    {
      "name": "Royal Observatory",
      "lat": 51.4771332098067,
      "lng": -0.0007510185241699219,
      "id": "4ac518cef964a5203aa620e3"
    },
    {
      "name": "Hyde park",
      "lat": 51.507460346127864,
      "lng": 	-0.16213417053222656,
      "id": "4ac518d2f964a52026a720e3"
    }
  ]
};

var map;

/**
* Initialize the map
* This function is being called asynchronously in index.html as an callback
*/
function initMap(){
  // Settings for map
  var mapOptions = {
    zoom: 11,
    center: new google.maps.LatLng({lat: 51.51, lng: -0.12}),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_CENTER
    }
  };

  // Creates map and adds to map div
  var mapdiv = document.getElementById('map');
  map = new google.maps.Map(mapdiv, mapOptions);

  window.mapBounds = new google.maps.LatLngBounds();



  /**
  * Custom binding for google map
  * Creates map, marker and infowindow for each place
  *
  */
  ko.bindingHandlers.googlemap = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

      // Binding with map element in index.html
      var mapEl = valueAccessor();


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

          viewModel.markerAnimate(this);
          /**
          *  When clicked retrieve and display data
          *  Takes marker as an argument
          */
          viewModel.getInfo(this);
        });

        var bounds = window.mapBounds;
        bounds.extend(new google.maps.LatLng(place.position()));
        // Fit the map to the new marker
        map.fitBounds(bounds);
        // Center the map
        map.setCenter(bounds.getCenter());

      });// foreach ends


      window.addEventListener('resize', function(e) {
      // Make sure the map bounds get updated on page resize
       map.fitBounds(mapBounds);
       viewModel.closeMoreInfo();
       viewModel.infoWin.close();
     });

    }// update  ends

  };

    /**
    * SIDE MENU NAVIGATION
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
}
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
  self.url = ko.observable();
  self.formatedUrl = ko.observable();

};

/**
* View model
*/
var MyViewModel = function() {
  var self = this;
  self.places = ko.observableArray();
  self.search = ko.observable('');
  self.displayInfo = ko.observable('');
  self.infoWin = new google.maps.InfoWindow();
  self.currentPlace = ko.observable();
  self.currentPlaceNotEmpty = ko.observable(false);

  // Adds Place into observable array
  data.locations.forEach(function(loc){
    self.places().push(new Place(loc));
  });

  // Filters locations based on search input
  self.searchInput = ko.computed(function() {
    var filter = this.search().toLowerCase();

    if (!filter) {

        if(self.places()[0].marker){// Resets all markers to be visible, if search input has been cleared
          self.places().forEach(function(place){
            place.marker.setVisible(true);
          });
        }

        return self.places();
    } else {
      return ko.utils.arrayFilter(self.places(), function(item) {

        var found = item.name().toLowerCase().indexOf(filter) !== -1 ;
        if (found) {

          // If result is true, show correct marker based off users search
          item.marker.setVisible(true);
        } else {

          // Hide markers that do not show users search results
          item.marker.setVisible(false);
        }
        return found;
      });
    }
  }, self);

  self.markerAnimate = function(marker){
    // Sets animation when location is cliked
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    // Animation reset
    setTimeout(function(){marker.setAnimation(null);}, 1500);

  };

  /**
  * Triggers when location in slide in menu is being clicked.
  * Takes event as argument, which is in this case Place
  *
  */
  self.locClick = function(place){

    self.markerAnimate(place.marker);

    // Sets selected location`s marker to the center of map
    map.setCenter(place.marker.getPosition());

    // Calls for data to retrieve
    self.getInfo(place.marker);


    // Opens info about selected location
    self.openInfoWindow();
  };

  var infowinEl = $('#more-info');
  var icon = $('#close-info');
  // Closes or opens info window
  self.closeOpenMoreInfo = function(){

      if(infowinEl.hasClass('slide-out') && icon.hasClass('closeOpen')){
        infowinEl.removeClass('slide-out');
        icon.removeClass('closeOpen');
      }else{
        infowinEl.addClass('slide-out');
        icon.addClass('closeOpen');
      }

  };

  // Only opens and keeps info window opened
  self.openInfoWindow = function(){

    if(!infowinEl.hasClass('slide-out') && !icon.hasClass('closeOpen')){
      infowinEl.addClass('slide-out');
      icon.addClass('closeOpen');
    }

  };

  // Closes info window
  self.closeMoreInfo = function(){
    if(infowinEl.hasClass('slide-out') && icon.hasClass('closeOpen')){
      infowinEl.removeClass('slide-out');
      icon.removeClass('closeOpen');
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
    $.ajax({
      dataType: "json",
      url: url,
      cache: true,
       success: function(data){

      self.processInfo(data, place);
      self.infoWin.setContent('<h4 class="marker-info">'+place.name()+'</h4>');
      self.infoWin.open(map, place.marker);
      self.openInfoWindow();
      },
      error: function(){
      var markerContent = '<h2 class="error-msg">Ooops, something went wrong!</h2><p>Please reload a page or check your internet conection</p>';
      self.infoWin.setContent(markerContent);
      self.infoWin.open(map, place.marker);
      }
    });
  };// getInfo() ends

  self.processInfo = function(data, place){
    var venue = data.response.venue;

    // Photo
    if(venue.bestPhoto){

      place.photoLink(venue.bestPhoto.prefix +"400x300"+venue.bestPhoto.suffix);
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

    // Facebook
    if(venue.contact.facebook){
      place.facebook('http://facebook.com/'+venue.contact.facebook);
      place.facebookExists = ko.observable(true);
    }else{
      place.facebookExists = ko.observable(false);
    }

    // Twitter
    if(venue.contact.twitter){
      place.twitter(venue.contact.twitter);
      place.twitterExists = ko.observable(true);
    }else{
      place.twitterExists = ko.observable(false);
    }

    // Phone number
    if(venue.contact.phone){
      place.phone(venue.contact.phone);
      place.phoneTel('tel:'+venue.contact.phone);
      place.phoneExists = ko.observable(true);
    }else{
      place.phoneExists = ko.observable(false);
    }

    // Website url
    if(venue.url){
      var url = venue.url;
      var formatedUrl = url.replace('http://', '');

      place.formatedUrl(formatedUrl);
      place.url(venue.url);
    }

    //sets current place to be displayed
    self.currentPlace(place);
    self.currentPlaceNotEmpty(true);


  };// processInfo ends


}; // MyViewModel ends
