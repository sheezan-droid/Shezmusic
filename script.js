const songList = document.getElementById("songList");

const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const search = document.getElementById("search");

let currentSong = 0;

// ---------- Load Songs ----------

function loadSongs(filter=""){

    songList.innerHTML="";

    songs.forEach((song,index)=>{

        if(
            song.title.toLowerCase().includes(filter.toLowerCase()) ||
            song.artist.toLowerCase().includes(filter.toLowerCase())
        ){

            songList.innerHTML += `
            <div class="song-card" onclick="playSong(${index})">
                <img src="${song.cover}">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
            `;

        }

    });

}

loadSongs();

// ---------- Play Song ----------

function playSong(index){

    currentSong=index;

    audio.src=songs[index].file;

    cover.src=songs[index].cover;

    title.innerHTML=songs[index].title;

    artist.innerHTML=songs[index].artist;

    audio.play();

    playBtn.innerHTML='<i class="fa-solid fa-pause"></i>';

    cover.style.animation="spin 8s linear infinite";

    highlightSong();

}

// ---------- Highlight Current Song ----------

function highlightSong(){

    const cards=document.querySelectorAll(".song-card");

    cards.forEach(card=>card.style.border="none");

    if(cards[currentSong]){
        cards[currentSong].style.border="3px solid #1DB954";
    }

}

// ---------- Play Pause ----------

playBtn.onclick=function(){

    if(audio.src==="") return;

    if(audio.paused){

        audio.play();

        playBtn.innerHTML='<i class="fa-solid fa-pause"></i>';

        cover.style.animation="spin 8s linear infinite";

    }

    else{

        audio.pause();

        playBtn.innerHTML='<i class="fa-solid fa-play"></i>';

        cover.style.animation="none";

    }

};

// ---------- Next ----------

nextBtn.onclick=function(){

    currentSong++;

    if(currentSong>=songs.length){

        currentSong=0;

    }

    playSong(currentSong);

};

// ---------- Previous ----------

prevBtn.onclick=function(){

    currentSong--;

    if(currentSong<0){

        currentSong=songs.length-1;

    }

    playSong(currentSong);

};

// ---------- Progress ----------

audio.addEventListener("timeupdate",()=>{

    if(!isNaN(audio.duration)){

        progress.max=audio.duration;

        progress.value=audio.currentTime;

        currentTime.innerHTML=format(audio.currentTime);

        duration.innerHTML=format(audio.duration);

    }

});

// ---------- Seek ----------

progress.addEventListener("input",()=>{

    audio.currentTime=progress.value;

});

// ---------- Song End ----------

audio.onended=function(){

    nextBtn.click();

};

// ---------- Format Time ----------

function format(time){

    if(isNaN(time)) return "0:00";

    let min=Math.floor(time/60);

    let sec=Math.floor(time%60);

    if(sec<10){

        sec="0"+sec;

    }

    return min+":"+sec;

}

// ---------- Search ----------

search.addEventListener("keyup",()=>{

    loadSongs(search.value);

});

// ---------- Keyboard Shortcuts ----------

document.addEventListener("keydown",(e)=>{

    if(e.code==="Space"){

        e.preventDefault();

        playBtn.click();

    }

    if(e.code==="ArrowRight"){

        nextBtn.click();

    }

    if(e.code==="ArrowLeft"){

        prevBtn.click();

    }

});