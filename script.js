
console.log("hello, Durgapada Karan here");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from folder and update UI
async function getSongs(folder) {
    currFolder = folder;
    const response = await fetch(`http://127.0.0.1:3000/${folder}/`).then(res => res.text());
    const div = document.createElement("div");
    div.innerHTML = response;
    // console.log(response)
    const as = div.getElementsByTagName("a");
    songs = [];

    for (let element of as) {
        // Only process if it's a song file
        if (element.href.endsWith(".m4a") || element.href.endsWith(".mp3")) {
            // Get the filename from the link text, which is more reliable
            const songName = element.textContent.trim();
            if (songName) {
                songs.push(songName);
            }
        }
    }

    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%5C", "")}</div>
                <div>Durgapada</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }


    // console.log("Songs found:", songs);


    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            const track = li.querySelector(".info div").textContent.trim();
            playMusic(track);
        });
    });
    return songs;
}

// Play selected music track
function playMusic(track, pause = false) {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    const response = await fetch(`http://127.0.0.1:3000/songs/`).then(res => res.text());
    const div = document.createElement("div");
    div.innerHTML = response;
    const anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        const cleanHref = e.href.replace(/%5Csongs%5C/g, "songs/");
        if (cleanHref.includes("/songs")) {
            let folder = cleanHref.split("/").slice(-2)[0]
            let response = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`).then(res => res.json());
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#141834" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="cover image">
                        <H3>${response.title}</H3>
                        <P>${response.description}</P>                   
                    </div>`
        }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })

}

// Main function to initialize app
async function main() {
    await getSongs("songs/mfs");
    playMusic(songs[0], true);

    // Display albums
    displayAlbums();

    // Seekbar event
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Play/Pause event
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Update time and seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Close menu
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous song
    previous.addEventListener("click", () => {
        currentSong.pause();
        const index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    // Next song
    next.addEventListener("click", () => {
        currentSong.pause();
        const index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src =
                document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}

main();

