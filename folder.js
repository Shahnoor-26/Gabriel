import { metadatafile } from "./server.js";
import { audioInit, convert, updateSec } from "./utils.js";

// Get-Data (LocalStorage)
const fol = localStorage.getItem("fol");
const status = localStorage.getItem("status");
const dataPath = localStorage.getItem("data-path");
const audioPath = localStorage.getItem("audio-path");
const videoPath = localStorage.getItem("video-path");
const folData = JSON.parse(localStorage.getItem("fol-data"));

// Default Selectors
const forVid = document.querySelector("#vid-nav");
const folPic = document.querySelector("#fol-nav");
const folDesc = document.querySelector("#fol-desc");
const folBout = document.querySelector("#fol-about");
const forSong = document.querySelector("#list-body");
const forQUl = document.querySelector("#queue-list");

// Display Audio-File (Fol)
const fileShow = async () => {
  try {
    const titles = Object.values(folData[fol].songs);
    const audios = titles.map((title) => title + ".mp3");

    localStorage.setItem("titles", JSON.stringify(titles)); // Update

    const metadata = await Promise.all(
      audios.map((audio) => metadatafile(audioPath + audio))
    ); // Fetch Metadata

    let count = null;
    let length = null;

    const frag = document.createDocumentFragment();

    metadata.forEach((data, index) => {
      const temp = forSong.firstElementChild.cloneNode(true); // Cloning Enable
      temp.children[0].textContent = index + 1;
      temp.children[1].src = data.picture;
      temp.children[2].textContent = data.title;
      temp.children[3].textContent = data.artist;
      temp.children[4].textContent = convert(data.duration);
      frag.appendChild(temp);

      count = index + 1; // Update
      length += data.duration; // Update
    });

    length = updateSec(length); // Convert

    folPic.firstElementChild.setAttribute("src", folData[fol].picture);

    folDesc.children[0].textContent = status;
    folDesc.children[1].textContent = fol;
    folDesc.children[2].textContent = `Gabriel · ${count} Songs · About ${length}`;

    forVid.firstElementChild.textContent = fol;

    folBout.children[0].textContent = status;
    folBout.children[1].textContent = `About ${fol}`;
    folBout.children[2].textContent = folData[fol].description;

    forSong.appendChild(frag); // Append Frag
    forSong.firstElementChild.classList.add("hidden"); // Hide Temp
  } catch (error) {
    console.log(error);
  }
};

async function main() {
  try {
    await fileShow();

    // Touch Audio-File Play (Fol)
    forSong.addEventListener("click", async (event) => {
      const li = event.target.closest("li");
      if (li && li.children.length > 1) {
        const audio = li.children[2].textContent.trim();
        if (audio) await audioInit(audio, audioPath);
      }
    });

    // Touch Audio-File Play (Queue)
    forQUl.addEventListener("click", async (event) => {
      const li = event.target.closest("li");
      if (li && li.children.length > 1) {
        const audio = li.children[1].children[0].textContent.trim();
        if (audio) await audioInit(audio, audioPath);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

main();
