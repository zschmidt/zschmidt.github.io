var widthHeight = document.getElementById("myCanvas").clientWidth;
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var derivative = false;
var latLng = {};
var scale = .2;
var map;


function round(a)
{
  //returns 'a' rounded to three decimal places
  return ((1000*a)>>0)/1000;
}

function findMinMax(arr, minMax)
{
  for(var i = 0; i<arr.length; i++)
  {
    arr[i] = round(arr[i]*3.28);
    if(arr[i]<minMax.min)
    {
      minMax.min = arr[i];
    }
    if(arr[i]>minMax.max)
    {
      minMax.max = arr[i];
    }
  }
  document.getElementById("elevationStats").innerHTML = "<br><br><strong>Max: </strong>"+minMax.max+" feet<br><br><br><br><br><br><br><strong>Min: </strong>"+minMax.min+" feet<br><br>";
}

function getBoundingBox(boundingBox)
{
  var NE = boundingBox.getNorthEast();
  var north = NE.lat();
  var east = NE.lng();
  var SW = boundingBox.getSouthWest();
  var south = SW.lat();
  var west = SW.lng();

  return {north: Number(north), east: Number(east), south: Number(south), west: Number(west)};

}

function getTimeString(millis)
{
  var date = new Date(0);
  date.setUTCSeconds(millis);
  var retString = date.toTimeString().split(' ')[0];
  retString += (retString.substr(0,2) < 12 ? " AM" : " PM");
  retString = String(Number(retString.substr(0,2)) % 12) + retString.substr(2,retString.length-2);
  return retString;
}

function getForecast(lat, lng)
{
  var forecastApi = "http://api.openweathermap.org/data/2.5/weather?lat="; //44&lon=-123
  var key = "&appid=d2612e03455401d5d5d53a0dde82c630";

  var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(
        "GET",
        forecastApi + lat + "&lon=" + lng + key,
        false
      );
    xmlHttp.send(null);
    var forecast = JSON.parse(xmlHttp.responseText);
    document.getElementById("temperature").innerHTML = round((forecast.main.temp * (9/5)) - 459.67) + " &#8457;";
    document.getElementById("sunrise").innerHTML = getTimeString(forecast.sys.sunrise);
    document.getElementById("sunset").innerHTML = getTimeString(forecast.sys.sunset);
}

function getLatLng()
{
  //Calls mapQuest to get lat/lng for an address
  var mapquestApi = "http://www.mapquestapi.com/geocoding/v1/address?key=KM4sDe5QGtHmGxLIm6LoMhYLQ7AkGrGY&location=";

  if(document.getElementById("long").value != "" && document.getElementById("lat").value != ""){
    setLatLng(Number(document.getElementById("lat").value),
        Number(document.getElementById("long").value));
  }
  else if(document.getElementById("location").value != ""){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(
        "GET",
        mapquestApi + document.getElementById("location").value,
        false
      ); // false for synchronous request
    xmlHttp.send(null);
    //xmlHttp.responseText;
    lat = JSON.parse(xmlHttp.responseText);
    lat = lat.results[0].locations[0].latLng;
    setLatLng(lat.lat, lat.lng);
  }
  else {
    return;
  }
  return latLng;
}

function setLatLng(lat, lng)
{
  latLng.lat = lat;
  latLng.lng = lng;
  setLatLngInputs(lat, lng);
}

function setLatLangFromMap(map)
{
  var tmp = map.getCenter().toString();
  tmp = tmp.split(",");
  setLatLng(tmp[0].substr(1), tmp[1].substr(1,tmp[1].length-2));
}

function setLatLngInputs(lat, lng)
{
  document.getElementById("lat").value = lat;
  document.getElementById("long").value = lng;
}

function clearLatLngInputs()
{
  document.getElementById("lat").value = "";
  document.getElementById("long").value = "";
}

function clearCanvas()
{
  c.width = c.width;
  //alt way
  //ctx.clearRect(0, 0, c.width, c.height);
}


function initMap() {

  //This function is called whenever the pages loads or the buttons are clicked

  latLng = getLatLng();
  var lat = latLng.lat;
  var lng = latLng.lng;

  getForecast(lat, lng);

  //Generates a new google map centered on lat/lng

  if(!(!!map))
  {
    var point = new google.maps.LatLng(lat, lng);
    map = new google.maps.Map(document.getElementById('map'), {
      center: point,
      zoom: 10
    });
  }
  else
  {
    //Perhaps panTo??
    // map.setCenter(new google.maps.LatLng(-34, 151));
    // map.setCenter({lat: -34, lng: 151}); 
  }

  map.addListener('idle', function() {
    var box = getBoundingBox(map.getBounds());
    scale = (box.east-box.west)/4;
    setLatLangFromMap(map);
    latLng = getLatLng();
    lat = latLng.lat;
    lng = latLng.lng;
    drawElevation(lat, lng);
    getForecast(lat, lng);
  });

  map.addListener('dragstart', function() {
    clearCanvas();
  });
  map.addListener('zoom_changed', function() {
    clearCanvas();
  });
}

var drawElevation = function(lat, lng){
  var minMax = {};
  minMax.min = 99999;
  minMax.max = -9999;

  var tmpArr = [];

  //This was a failed attempt at a loading screen

  // ctx.fillStyle = "rgba(255,255,255,1)";
  // ctx.fillRect(0,0,c.width, c.height);
  // ctx.fillStyle = "rgba(0,0,0,1)";
  // ctx.fillText("Loading", c.width/2, c.height/2);

  getElevations(round(lat - scale), round(lng - scale)).then(function(a){
    tmpArr.push(a);
    getElevations(round(lat - scale), round(lng + scale)).then(function(b){
      tmpArr.push(b);
      getElevations(round(lat + scale), round(lng - scale)).then(function(c){
        tmpArr.push(c);
        getElevations(round(lat + scale), round(lng + scale)).then(function(d){
          tmpArr.push(d);
          elevations = interleave(tmpArr[0], tmpArr[1], tmpArr[2], tmpArr[3]);
          if(derivative)
          {
            var z = [];
            for(var i = 0; i<64; i++)
            {
              z[i] = [];
            }
            for(var i = 0; i<4096; i++)
            {
              z[(i/64)>>0][i%64] = elevations[i];
            }
            elevations = arrDerivative(z);
          }

          findMinMax(elevations, minMax);
          drawPoints(minMax.min, minMax.max, elevations);
        });
      });
    });
  });
}

var getElevations = function(lat, lng){
  var apiLocation = "http://dev.virtualearth.net/REST/v1/Elevation/Bounds?bounds=";
  var queries = "&rows=32&cols=32&heights=sealevel";
  var key = "&key=AgdJmHJNbOApcjOXhgGoeD0OeiaEoxJ-zXbtF60rdVvWnD2GZeH-czRQ9lH03Vil";
  var retData;
  var deferred = $.Deferred();

  if(map.getBounds())
  {
    //console.log("map.getBounds() was true");
    // var NE = map.getBounds().getNorthEast();
    // console.log("These is the NE lat"+ NE.lat());
    // north = NE.lat();
    // console.log("These are the SW "+ map.getBounds().getSouthWest());
  }
  else
  {
    //console.log("map.getBounds() was false");
  }

  


  west = lng - scale;
  north = lat + scale;
  east = lng + scale;
  south = lat - scale;

  // console.log("West: "+west);
  // console.log("North: "+north);
  // console.log("East: "+east);
  // console.log("South: "+south);

  $.ajax({
    type: 'GET',
    async: true,
    url: apiLocation+ south +","+ west + ","+ north + "," + east + queries +key + "&jsonp=?",
    dataType: 'jsonp',
  }).done(function (data) {
    deferred.resolve(data.resourceSets[0].resources[0].elevations);
  }).fail(function (XHR, status, error) {
    console.log(error);
  });

  return deferred;
}

function drawPoints(min, max, elevations)
{
  clearCanvas();
  document.getElementById('elevationLayer').checked = true;
  console.log("Drawing to the canvas");
  var color;
  //Actually interacts with the canvas element
  for(var k = 0; k<elevations.length; k++)
  {
    //stepSize is what defines the color change for change in elevation (255/range)
    var stepSize = 255/(max-Math.abs(min));
    if(elevations[k] == max)
    {
      ctx.fillStyle = "rgba("+255+", "+0+", "+0+", "+0.5+")";
    }
    else if(elevations[k] == min)
    {
      ctx.fillStyle = "rgba("+0+", "+255+", "+0+", "+0.5+")";
    }
    else {
      color = 255 - (stepSize * (elevations[k]-min))>>0;
      ctx.fillStyle = "rgba("+color+", "+color+", "+color+", "+0.3+")";
    }

    //ctx.fillRect((widthHeight/64)*(k%64),widthHeight - widthHeight/64 - (widthHeight/64 * Math.floor(k/64)),widthHeight/64,widthHeight/64);
    ctx.beginPath();
    ctx.arc((widthHeight/64)*(k%64),widthHeight - widthHeight/64 - (widthHeight/64 * Math.floor(k/64)),widthHeight/64, 0, 2 * Math.PI, false);
    ctx.fill();
  }
}


function interleave(a1, a2, a3, a4)
{
  //Todo: Generalize this to be able to take an array (of length x^2)
  var elevations = [];
  for(var i=0; i<32; i++)
  {
    elevations = elevations.concat(a1.splice(0, 32));
    elevations = elevations.concat(a2.splice(0, 32));
  }
  for(var i=0; i<32; i++)
  {
    elevations = elevations.concat(a3.splice(0, 32));
    elevations = elevations.concat(a4.splice(0, 32));
  }
  return elevations;
}

function arrDerivative(arr){
  function cmp(a, y)
  {
    if(a == undefined)
      return y;
    else {
      return Math.abs(a-y);
    }
  }
  var retArr = [];
  arr[-1] = [];
  arr[64] = [];
  for(var j = -1; j < 65; ++j){
      arr[-1][j] = undefined;
      arr[64][j] = undefined;
  }

  for(var i=0; i<64; i++)
  {
    for(var j=0; j<64; j++)
    {
      retArr.push(
        Math.max(
          cmp(arr[i+1][j], arr[i][j]),
          cmp(arr[i+1][j+1], arr[i][j]),
          cmp(arr[i+1][j-1], arr[i][j]),
          cmp(arr[i][j+1], arr[i][j]),
          cmp(arr[i][j-1], arr[i][j]),
          cmp(arr[i-1][j], arr[i][j]),
          cmp(arr[i-1][j+1], arr[i][j]),
          cmp(arr[i-1][j-1], arr[i][j])
        )
      );
    }
  }
  return retArr;
}

document.getElementById("dervBtn").onclick = function(){
  clearCanvas();
  clearLatLngInputs();
  derivative = true;
  initMap();
}
document.getElementById("normBtn").onclick = function(){
  clearCanvas();
  clearLatLngInputs();
  derivative = false;
  initMap();
}
document.getElementById("elevationLayer").onclick = function()
{
  if (document.getElementById('elevationLayer').checked) 
  {
      var box = getBoundingBox(map.getBounds());
      scale = (box.east-box.west)/4;
      drawElevation(latLng.lat, latLng.lng);
  } else {
      clearCanvas();
  }
}



