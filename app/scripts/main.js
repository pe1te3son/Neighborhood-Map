$(document).ready(function(){

  var mapInit = function(){
    var map;
    var mapOptions = {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);


  }//mapInit() ends

  mapInit();
});
