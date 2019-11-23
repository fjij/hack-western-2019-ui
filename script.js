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
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
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
  video.parentNode.removeChild(video)
  neutralAvg /= 10;
  var mood = neutralAvg
  happyAvg /= 10;
  if(happyAvg>mood)
  {
    mood = happyAvg
    moodString = "Happy";
  }
  sadAvg /= 10;
  if(sadAvg>mood)
  {
    mood = sadAvg
    moodString = "Sad";
  }
  angryAvg /= 10;
  if(angryAvg>mood)
  {
    mood = angryAvg
    moodString = "Angry";
  }
  surprisedAvg /= 10;
  if(surprisedAvg>mood)
  {
    mood = surprisedAvg
    moodString = "Surprised";
  }
  disgustedAvg /= 10; 
  if(disgustedAvg>mood)
  {
    mood = disgustedAvg
    moodString = "Disgusted";
  }
  fearfulAvg /= 10;
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
  CallApi(moodString)
  CallNextSong(moodString)
}


function recordVideo() {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  intervalSet = setInterval(async () => {
    count++;
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
    
    if(count == 10)
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
    console.log(xmlHttp.responseText)
    //return xmlHttp.responseText;
}


function CallNextSong(expression)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", "https://fjij.api.stdlib.com/hack-western-2019@dev/spotify/?expression="+expression,false);
    xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xmlHttp.send( null );
    console.log(xmlHttp.responseText)
    //return xmlHttp.responseText;
}