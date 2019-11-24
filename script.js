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

function startRecord()
{
    video = document.getElementById('video')
    video.addEventListener('play', recordVideo);
    video.addEventListener('pause',() => {
      clearInterval(intervalSet)
    })
    Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
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
  var api = JSON.parse(CallApi(moodString));
  var song = JSON.parse(CallNextSong(moodString));
  console.log(api);
  console.log(song);
	removePanel(() => populateOutput(api, song))
}

function makeDivClass(className) {
	var node = document.createElement("div");
	node.className = className;
	return node;
}

function populateOutput(api, song) {

	var output = makeDivClass("output slide-in")
	var album = makeDivClass("album py-5 bg-light")
	output.appendChild(album);
	var container = makeDivClass("container")
	album.appendChild(container);


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

    var cardText = document.createElement("p");
		cardBody.appendChild(cardText);
		cardText.className = "card-text";
		var textNode = document.createTextNode(x.Title)
    cardText.appendChild(textNode);
    cardText.style.textAlign = "center";

    var cardLongText = document.createElement("p");
    cardBody.appendChild(cardLongText);
    cardLongText.className = "card-long-text";
    var longTextNode = document.createTextNode(x.Summary)
		cardLongText.appendChild(longTextNode);
	})


	var musicRow = makeDivClass("row")
	container.appendChild(musicRow);
  musicRow.style.margin = "0 0 2% 0";


	var col = makeDivClass("col-md-12")
	musicRow.appendChild(col)
	var card = makeDivClass("card mb-12 box-shadow")
	col.appendChild(card)
	var cardBody = makeDivClass("card-body")
	card.appendChild(cardBody)

  var cardText = document.createElement("p");
	cardBody.appendChild(cardText);
	cardText.className = "card-text";
	var textNode = document.createTextNode(song.Song)
	cardText.appendChild(textNode);
  cardText.style.margin = "0 auto 2% auto";
  cardText.style.textAlign = "center";

	var cardImage = document.createElement("img");
	cardBody.appendChild(cardImage);
	cardImage.className = "card-img";
	cardImage.setAttribute("src", song.Image_url)
  cardImage.style.width = "50%";
  cardImage.style.display = "block";
  cardImage.style.margin = "auto";


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

	document.getElementById('output').appendChild(output);
}

function removePanel(onComplete) {
	var element = document.getElementById("panel")
	element.classList.add('slide-out');
	element.addEventListener("animationend", () => {element.parentNode.removeChild(element); onComplete()});
}

function recordVideo() {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  intervalSet = setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    //faceapi.draw.drawDetections(canvas, resizedDetections)
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
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

	  count++;
    if(count == 5)
    {
      clearInterval(intervalSet)
      onRecordEnd(detections)
    }
  }, 500)
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
