import { fetchAudio, fetchFile, metadatafile } from "./server.js";
import { audioInit } from "./utils.js";

// Default Variables
const dataPath = "/database/data/";
const audioPath = "/database/audio/";
const videoPath = "/database/video/";

// Set-Data (LocalStorage)
localStorage.setItem("data-path", dataPath);
localStorage.setItem("audio-path", audioPath);
localStorage.setItem("video-path", videoPath);

// Default Selectors
const forSong = document.querySelector("#content-box ul");
const forArtist = document.querySelector("#round-box ul");

// Audio-File Display (Main)
const fileShow = async () => {
  try {
    const audios = await fetchAudio(audioPath); // Fetch Audio-File
    const titles = audios.map((audio) => decodeURI(audio.replace(".mp3", "")));

    localStorage.setItem("titles", JSON.stringify(titles)); // Default

    const metadata = await Promise.all(
      audios.map((audio) => metadatafile(audioPath + audio))
    ); // Fetch Metadata

    const frag = document.createDocumentFragment();

    metadata.slice(0, metadata.length / 2).forEach((data) => {
      const temp = forSong.firstElementChild.cloneNode(true); // Cloning Enable
      temp.children[0].src = data.picture;
      temp.children[1].textContent = data.title;
      frag.appendChild(temp);
    });

    forSong.appendChild(frag); // Append Frag
    forSong.firstElementChild.classList.add("hidden"); // Hide Temp
  } catch (error) {
    console.log(error);
  }
};

// Fol Display (Artist + Playlist)
const folShow = async (file, template) => {
  try {
    if (!file && !template) return; // Default
    const filedata = await fetchFile(dataPath + file); // Fetch File-Data
    const keys = Object.keys(filedata); // Collect Keys

    const frag = document.createDocumentFragment();

    keys.slice(0, 20).forEach((key) => {
      const temp = forArtist.firstElementChild.cloneNode(true); // Cloning Enable
      temp.children[0].src = filedata[key].picture;
      temp.children[1].textContent = key;
      frag.appendChild(temp);
    });

    forArtist.appendChild(frag); // Append Frag
    forArtist.firstElementChild.classList.add("hidden"); // Hide Temp

    return filedata; // Return File-Data
  } catch (error) {
    console.log(error);
  }
};

// Redirect (folder.html)
const folRed = (object, template, status) => {
  try {
    if (!object && !template && !status) return; // Default

    template.addEventListener("click", (event) => {
      const li = event.target.closest("li");
      if (li && li.children.length > 1) {
        const fol = li.children[1].textContent.trim();
        if (!fol) return; // Default

        localStorage.setItem("fol", fol);
        localStorage.setItem("status", status);
        localStorage.setItem("fol-data", JSON.stringify(object));
        window.location.href = "/folder.html"; // Redirect
      }
    });
  } catch (error) {
    console.log(error);
  }
};

async function main() {
  try {
    const artists = await folShow("artists.json", forArtist);
    await fileShow();

    // Touch Audio-File Play
    forSong.addEventListener("click", async (event) => {
      const li = event.target.closest("li");
      if (li && li.children.length > 1) {
        const audio = li.children[1].textContent.trim();
        if (audio) await audioInit(audio, audioPath);
      }
    });

    folRed(artists, forArtist, "Verified Artist"); // Expand Fol
  } catch (error) {
    console.log(error);
  }
}

main();
