// Video Player:
const vplayer = document.querySelector("vplayer");
// Video:
const video = document.querySelector("video");
// INIT:
const initPlayBtn = document.querySelector("[play]");
const skipBtnL = document.querySelector("[Lskip]");
const skipBtnR = document.querySelector("[Rskip]");
// video-progress:
const videoProgress = document.querySelector("[video-progress]");
// CONTROLES:
const controles = document.querySelector("controles");
const ctrlsPlayBtn = document.querySelector("[playpause]");
const volmuteBtn = document.querySelector("[volmute]");
const volumeInpt = document.querySelector("[volume]");
const crntDur = document.querySelector("[crntdur]");
const fullDur = document.querySelector("[fulldur]");
// speed 
const speedBtn = document.querySelector("[speed]");
// picture in picture
const picInPicBtn = document.querySelector("[picinpic]");
// full screen
const fullscreenBtn = document.querySelector("[fullscreen]");

// where you see funcVE => VE = Visual Effect 
// global variabels;

var p2p = false; // play to Pause
var isInit = false;
var isMuted = false;
var isFullscreen = false;
var speedStates = {average: 1, fast:2 , fastest: 4, slowest: 1/4, slow: 1/2};
var sps = 0; // speed state index
var appearTimeOut;

// setting your fav color from the "clr" attribute if exict otherways set the default blue;
document.documentElement.style.setProperty("--clr", vplayer.getAttribute("clr") || "#2589ff")

// when video loadded
video.onloadeddata = () => {
    if (video.readyState == 4) {
        initPlayBtn.classList.remove("loading");
        initPlayBtn.classList.add("loadDone");
        displayVideoTime(video.duration, fullDur);
    }
}

// tp = (vc/vd) * 100
// vc = (tp/100) * vd
video.ontimeupdate = () => {
    let timeProgress = (video.currentTime / video.duration) * 100
    displayVideoTime(video.currentTime, crntDur);
    sliderTrack(videoProgress, timeProgress);
    videoProgress.value = timeProgress;
    if (video.ended) {
        p2p = false;
        applyVE(initPlayBtn, p2p, "play", "play");
        applyVE(ctrlsPlayBtn, p2p, "play", "play");
    }
}

videoProgress.oninput = () => {
    let jumpedTime = (videoProgress.value / 100) * video.duration;
    video.currentTime = jumpedTime;
    sliderTrack(videoProgress, videoProgress.value);
}

document.onkeydown = e => {
    // e.stopPropagation();
    if (e.key == " " || e.key == "p") {
        playwithVE();
        activateCtrlsVE();
    }
    if (!isInit) return;
    if (e.key == "ArrowLeft") {
        video.currentTime -= skipBtnL.getAttribute("dur");
        skipVE(skipBtnL);
    }
    if (e.key == "ArrowRight") {
        video.currentTime += skipBtnL.getAttribute("dur") * 1;
        skipVE(skipBtnR);
    }
}


initPlayBtn.onclick = () => {
    isInit = true;
    initPlayBtn.classList.remove("actvInitBtns");
    controles.classList.add("activeControles");
    playwithVE();
    vplayer.onmousemove = activateCtrlsVE;
}

video.onclick = () => {
    initPlayBtn.classList.remove("actvInitBtns");
    controles.classList.add("activeControles");
    playwithVE();
};

ctrlsPlayBtn.onclick = playwithVE;
volmuteBtn.onclick = volumewithVE;
sliderTrack(volumeInpt, volumeInpt.value);
video.volume = volumeInpt.value / 100;
volmuteBtn.classList.toggle("mute", video.volume == 0);         
volumeInpt.oninput = () => {
    video.volume = volumeInpt.value / 100;
    volmuteBtn.classList.toggle("mute", video.volume == 0);         
    sliderTrack(volumeInpt, volumeInpt.value);
}

speedBtn.onclick = ()=>{
    sps = sps == Object.keys(speedStates).length-1 ? 0 : sps+1;
    speedBtn.firstChild.classList.remove(speedBtn.firstChild.classList[1]);
    // console.log(Object.keys(speedStates));
    video.playbackRate = speedStates[Object.keys(speedStates)[sps]];
    speedBtn.firstChild.classList.add(`fi-rr-tachometer-${Object.keys(speedStates)[sps]}`);
}

picInPicBtn.onclick = triggerPictureInPicture;
fullscreenBtn.onclick = () => {
    isFullscreen = !isFullscreen;
    applyVE(fullscreenBtn, isFullscreen, "compress", "expand");
    triggerFullscreen();
}

function playwithVE() {
    p2p = !p2p; // switching from play to pause or pause to play
    applyVE(initPlayBtn, p2p, "pause", "play");
    applyVE(ctrlsPlayBtn, p2p, "pause", "play");
    play(video);
}

function volumewithVE() {
    isMuted = !isMuted;
    volmuteBtn.classList.toggle("mute",  isMuted);
    volume(video);
    volumeInpt.value = video.volume * 100;
    sliderTrack(volumeInpt, volumeInpt.value);
}

function skipVE(skipBtn){
    skipBtn.classList.add("actvInitBtns");
    setTimeout(() => {
        skipBtn.classList.remove("actvInitBtns");
    }, 400);
}

// apply visual effect as icons switch: compress
function applyVE(btn, key, i1, i2) {
    btn.firstChild.classList.remove(btn.firstChild.classList[1]);
    // switch the icon using it's class name
    btn.firstChild.classList.add(`fi-sr-${key ? i1 : i2}`);
}

function play(video) {
    video.paused ? video.play() : video.pause();
}

function volume(video) {
    video.volume = isMuted ? 0 : 1;
}

function triggerFullscreen() {
    if (getFullscreenElmnt()) { return document.exitFullscreen() }
    vplayer.requestFullscreen().catch(console.error);
}

function triggerPictureInPicture() {
    if (getPicInPicElmnt()) { return document.exitPictureInPicture() } 
    video.requestPictureInPicture().catch(console.error);
}

function activateCtrlsVE() {
    vplayer.style.cursor = "auto";
    controles.classList.add("activeControles");
    clearTimeout(appearTimeOut);
    appearTimeOut = setTimeout(() => {
        vplayer.style.cursor = "none";
        controles.classList.remove("activeControles");
    }, 2300);
}

function displayVideoTime(t, tDisplay){
    let h = Math.floor(t / 3600).toString().padStart(2,'0');
    let m = Math.floor(t / 60).toString().padStart(2,'0');
    let s = Math.floor(t).toString().padStart(2,'0').slice(0,2);
    tDisplay.textContent = h*1 > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function sliderTrack(input, value) {
    input.style.backgroundSize = `${value}% 100%`;
}

// get the fullscreen element provider from the browser(chrome, firefox, ...)
function getFullscreenElmnt() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullscreenElement || document.msFullscreenElement;
}

// get the picture-in-picture element provider from the browser(chrome, firefox, ...)
function getPicInPicElmnt() {
    return document.pictureInPictureElement || document.webkitPictureInPictureElement || document.mozPictureInPictureElement || document.msPictureInPictureElement;
}