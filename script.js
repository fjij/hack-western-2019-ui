const canvas = document.createElement('canvas');

var intervalSet;
var count = 0;
var video;

var neutralAvg = 0;
var happyAvg = 0;
var sadAvg = 0;
var angryAvg = 0;
var surprisedAvg = 0;
var disgustedAvg = 0;
var fearfulAvg = 0;

var frameCount = 0;
var mood = 0;

var local_device_id = "";

var song_id;

var playing = true;

function setLocalDeviceID(device_id) {
	local_device_id = device_id;
}

function togglePlayPause() {
	if (playing) {
		pause();
	} else {
		resume(local_device_id);
	}
	playing = !playing;
}

function startRecord()
{
    video = document.getElementById('video')
    video.addEventListener('play', recordVideo);
    video.addEventListener('pause',() => {
      clearInterval(intervalSet)
    })
    Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
  ]).then(startVideo)
}


function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}
var moodString = "Neutral";
function onRecordEnd(expressionsList) {
	var tracks = video.srcObject.getTracks();
	tracks.map(t => t.stop())
  neutralAvg /= 5;
  neutralAvg /= 2.5;
  var mood = neutralAvg
  happyAvg /= 5;
  if(happyAvg>mood)
  {
    mood = happyAvg
    moodString = "Happy";
  }
  sadAvg /= 5;
  if(sadAvg>mood)
  {
    mood = sadAvg
    moodString = "Sad";
  }
  angryAvg /= 5;
  if(angryAvg>mood)
  {
    mood = angryAvg
    moodString = "Angry";
  }
  surprisedAvg /= 5;
  if(surprisedAvg>mood)
  {
    mood = surprisedAvg
    moodString = "Surprised";
  }
  disgustedAvg /= 5;
  if(disgustedAvg>mood)
  {
    mood = disgustedAvg
    moodString = "Disgusted";
  }
  fearfulAvg /= 5;
  if(fearfulAvg>mood)
  {
    mood = fearfulAvg
    moodString = "Fearful";
  }
  //console.log("Neutral Emotion Average:"+neutralAvg)
  //console.log("Happy Emotion Average:"+happyAvg)
  //console.log("Sad Emotion Average:"+sadAvg)
  //console.log("Angry Emotion Average:"+angryAvg)
  //console.log("Surprised Emotion Average:"+surprisedAvg)
  //console.log("Disgusted Emotion Average:"+disgustedAvg)
  //console.log("Fearful Emotion Average:"+fearfulAvg)
  //console.log("Big Mood:"+moodString)
  console.log(moodString);
  /*var api = JSON.parse(CallApi(moodString));
  var song =
  console.log(api);
  console.log(song);*/
  	document.getElementsByClassName("navbar-brand")[0].innerHTML = moodString.toLowerCase();
	removePanel(() => {
		generateOutput();
		populateOutput(JSON.parse(CallApi(moodString)));
		populateOutput(JSON.parse(CallApi(moodString)));
		loadPlayer(JSON.parse(CallNextSong(moodString)));
	})
}

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
		populateOutput(JSON.parse(CallApi(moodString)));
        // you're at the bottom of the page
    }
};

function makeDivClass(className) {
	var node = document.createElement("div");
	node.className = className;
	return node;
}

function loadPlayer(song) {
		var card = makeDivClass("card mb-12 box-shadow music")
		document.getElementsByTagName('body')[0].appendChild(card)
		var cardBody = makeDivClass("card-body")
		card.appendChild(cardBody)

		var cardImage = document.createElement("img");
		cardBody.appendChild(cardImage);
		cardImage.className = "card-img";
		cardImage.setAttribute("src", song.Image_url)
		cardImage.setAttribute("onclick", "togglePlayPause()")
		play(local_device_id, song.id);

		var cardText =  makeDivClass("card-text")
		cardBody.appendChild(cardText);
		hnode = document.createElement("h4");
		pnode = document.createElement("p");
		cardText.appendChild (hnode);
		cardText.appendChild(pnode)
		hnode.appendChild(document.createTextNode(song.Song));
		pnode.appendChild(document.createTextNode(song.Artists.join(", ")));
}
function generateOutput() {
		var output = makeDivClass("output slide-in")
		var album = makeDivClass("album py-5 bg-light")
		output.appendChild(album);
		var container = makeDivClass("container output-container")
		album.appendChild(container);
		document.getElementById('output').appendChild(output);
}
function populateOutput(api) {
	var container = document.getElementsByClassName("output-container")[0];
	var movieRow = makeDivClass("row")
	container.appendChild(movieRow);
	api.movie.forEach(x => {

    var col = makeDivClass("col-md-4")
		movieRow.appendChild(col)
		var card = makeDivClass("card mb-4 box-shadow")
		col.appendChild(card)
		var cardBody = makeDivClass("card-body")
		card.appendChild(cardBody)
		var cardImage = document.createElement("img");
		cardBody.appendChild(cardImage);
		cardImage.className = "card-img";
		cardImage.setAttribute("src", x.Poster)
    cardImage.style.marginBottom = "5%";
	var cardLink = document.createElement("a");
		cardBody.appendChild(cardLink)
		cardLink.setAttribute("href", getYouTubeURL(x.Title + " trailer"));
		cardLink.setAttribute("target", "_blank");
    var cardText = document.createElement("h4");
		cardLink.appendChild(cardText);
		cardText.className = "card-text";
		var textNode = document.createTextNode(x.Title)
    cardText.appendChild(textNode);
    cardText.style.textAlign = "center";

    var cardLongText = document.createElement("p");
    cardBody.appendChild(cardLongText);
    cardLongText.className = "card-long-text";
    var longTextNode = document.createTextNode(x.Summary)
    cardLongText.appendChild(longTextNode);
    
    var plusButton = document.createElement("button");
    cardBody.appendChild(plusButton);
    plusButton.className = "fa fa-plus";
    plusButton.id = "plusBtn"
    plusButton.addEventListener("click", function(){
      addToList(x);
    });
	})

  function addToList(x)
  {
    console.log(x)
    var container = document.getElementsByClassName("navbar-brand")[0];
		var cardImage = document.createElement("img");
		container.appendChild(cardImage);
		cardImage.className = "card-img fav scrolling-wrapper-flexbox card";
		cardImage.setAttribute("src", x.Poster)
  }

	/*var musicRow = makeDivClass("row")
	container.appendChild(musicRow);
  musicRow.style.margin = "0 0 2% 0";
  	var col = makeDivClass("col-md-12")
  	musicRow.appendChild(col)*/

	var gifRow = makeDivClass("row")
	container.appendChild(gifRow);
	api.giphy.forEach(x => {
		var col = makeDivClass("col-md-4")
		gifRow.appendChild(col)
		var card = makeDivClass("card mb-4 box-shadow")
		col.appendChild(card)
		var cardBody = makeDivClass("card-body")
		card.appendChild(cardBody)
		var cardImage = document.createElement("img");
		cardBody.appendChild(cardImage);
		cardImage.className = "card-img";
		cardImage.setAttribute("src", x)
	})

	/*
	api.movie.forEach(x => {
		var node = document.createElement("LI");
		var textNode = document.createTextNode(x.Title);
		node.appendChild(textNode);
		divNode.appendChild(node);
	})

	var node = document.createElement("LI");
	var textNode = document.createTextNode(song.Song + " - ".concat(song.Artists));
	node.appendChild(textNode);
	divNode.appendChild(node);*/
}

function removePanel(onComplete) {
	var element = document.getElementById("panel")
	element.classList.add('slide-out');
	element.addEventListener("animationend", () => {element.parentNode.removeChild(element); onComplete()});
}

function countDown()
{
  var timeleft = 10;
				var downloadTimer = setInterval(function(){
				document.getElementById("countdown").innerHTML = timeleft + " seconds remaining";
				timeleft -= 1;
				if(timeleft <= 0){
					clearInterval(downloadTimer);
					document.getElementById("countdown").innerHTML = "Finished"
				}
				}, 1000);
}

function recordVideo() {
  const canvas = faceapi.createCanvasFromMedia(video)
  var videoDiv = document.getElementById("video");
  videoDiv.appendChild(canvas);
  //document.body.(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  intervalSet = setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //canvas.getElementById("countdown")
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    //console.log(resizedDetections[0]['expressions'])
    if(detections.length>0)
    {
      neutralAvg += detections[0]['expressions']['neutral'];
      happyAvg += detections[0]['expressions']['happy'];
      sadAvg += detections[0]['expressions']['sad'];
      angryAvg += detections[0]['expressions']['angry'];
      surprisedAvg += detections[0]['expressions']['surprised'];
      disgustedAvg += detections[0]['expressions']['disgusted'];
      fearfulAvg += detections[0]['expressions']['fearful'];
    }
    //countDown();
	  count++;
    if(count == 5)
    {
      clearInterval(intervalSet)
      onRecordEnd(detections)
    }
  }, 200)
}

function CallApi(expression)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", "https://fjij.api.stdlib.com/hack-western-2019@dev/mood_recommendations/?expression="+expression,false);
    xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xmlHttp.send( null );
    return xmlHttp.responseText;
}


function CallNextSong(expression)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", "https://fjij.api.stdlib.com/hack-western-2019@dev/spotify/?expression="+expression,false);
    xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function getYouTubeURL(title)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", "https://fjij.api.stdlib.com/hack-western-2019@dev/youtube/?title="+title,false);
    xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xmlHttp.send( null );
    return xmlHttp.responseText.replace("\"", "");
}
