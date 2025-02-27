import { metadatafile } from "./server.js";

// Select Casual Index
export const select = (array) => {
  try {
    if (!Array.isArray(array) || array.length == 0)
      console.log("Invalid Input.");

    const index = Math.floor(Math.random() * array.length);
    return array[index];
  } catch (error) {
    console.log(error);
  }
};

// Convert (Sec Into Min)
export const convert = (sec) => {
  try {
    if (isNaN(sec) || sec < 0) return "00:00";
    const min = Math.floor(sec / 60);
    const remainSec = Math.floor(sec % 60);
    const formatMin = min.toString().padStart(2, "0");
    const formatSec = remainSec.toString().padStart(2, "0");
    return `${formatMin}:${formatSec}`;
  } catch (error) {
    console.log(error);
  }
};

// Convert (Sec Into H-M-S)
export const updateSec = (sec) => {
  try {
    if (isNaN(sec) || sec < 0) return "0";
    if (sec >= 3600) {
      const hrs = Math.floor(sec / 3600);
      return `${hrs} Hour${hrs > 1 ? "s" : ""}`;
    } else if (sec >= 60) {
      const min = Math.floor(sec / 60);
      return `${min} Minute${min > 1 ? "s" : ""}`;
    } else {
      return `${sec} Second${sec !== 1 ? "s" : ""}`;
    }
  } catch (error) {
    console.log(error);
  }
};

// Default Variable
let file = null;
const forAudio = new Audio();

// Get-Data (LocalStorage)
const audioPath = localStorage.getItem("audio-path");
const titles = JSON.parse(localStorage.getItem("titles"));

// Default Selectors
const forSound = document.querySelectorAll("#sound-box");
const forInfoBox = document.querySelectorAll("#info-box");
const forProgress = document.querySelectorAll("#progress");
const forCoverBox = document.querySelectorAll("#cover-box");
const forProgBox = document.querySelectorAll("#progress-box");
const forContInfo = document.querySelectorAll("#content-info");
const forNextBtns = document.querySelectorAll("[aria-label='next']");
const forShuBtns = document.querySelectorAll("[aria-label='shuffle']");
const forReptBtns = document.querySelectorAll("[aria-label='repeat']");
const forPrevBtns = document.querySelectorAll("[aria-label='previous']");
const forDownBtns = document.querySelectorAll("[aria-label='download']");
const forPlayBtns = document.querySelectorAll("[aria-label='play-pause']");

// Selectors Location (folder.html)
const forSept = document.querySelector("#separator");
const forUpNxt = document.querySelector("#queue-list");
const forPlyAll = document.querySelector("[aria-label='play-all']");

// Audio-File Play
export const audioInit = async (audio, path) => {
  try {
    if (!audio && !path) return; // Default

    file = audio; // Update

    const source = audioPath + audio + ".mp3";

    if (forAudio.src !== source) {
      forAudio.src = source;
      forAudio.preload = "auto";
      forAudio.load(); // Load
    }

    await forAudio.play(); // Play

    // Button Update (Play-Pause)
    forPlayBtns.forEach((button) => {
      button.firstElementChild.classList.add("hidden");
      button.lastElementChild.classList.remove("hidden");
    });

    const metadata = await metadatafile(source); // Fetch Metadata

    const comment =
      typeof metadata.comment === "object"
        ? Object.values(metadata.comment)[0]
        : metadata.comment;

    const lyrics = String(comment || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0); // Lyrics Array

    // Update Info
    forInfoBox.forEach((tag) => {
      tag.firstElementChild.textContent = metadata.title;
      tag.lastElementChild.textContent = metadata.artist;
    });

    // Update Picture
    forContInfo.forEach((tag) => {
      tag.firstElementChild.setAttribute("src", metadata.picture);
    });

    // Update Extended Info
    forCoverBox.forEach((tag) => {
      tag.firstElementChild.setAttribute("src", metadata.picture);

      const frag = document.createDocumentFragment();

      lyrics.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        frag.appendChild(li);
      });

      tag.lastElementChild.innerHTML = "";
      tag.lastElementChild.appendChild(frag); // Update Lyrics
    });

    // Location (folder.html)
    if (location.pathname === "/folder.html") {
      forSept.firstElementChild.textContent = metadata.title;
      forSept.lastElementChild.textContent = metadata.artist;

      await upcoming(audio); // Show Upcoming
    }
  } catch (error) {
    console.log(error);
  }
};

// Upcoming Functionality
const upcoming = async (audio) => {
  try {
    const audios = titles.map((title) => `${title}.mp3`);
    const index = titles.indexOf(audio) + 1;

    if (index >= titles.length) return; // Default

    const filedata = await Promise.all(
      audios.slice(index).map((audio) => metadatafile(audioPath + audio))
    ); // Fetch Metadata

    const template = forUpNxt.firstElementChild.cloneNode(true); // Save Template
    forUpNxt.replaceChildren(); // Delete Children

    const frag = document.createDocumentFragment();

    filedata.forEach((data) => {
      const temp = template.cloneNode(true); // Cloning Enable
      temp.classList.remove("hidden");
      temp.children[0].src = data.picture;
      temp.children[1].children[0].textContent = data.title;
      temp.children[1].children[1].textContent = data.artist;
      frag.appendChild(temp);
    });

    forUpNxt.appendChild(frag); // Append Frag
  } catch (error) {
    console.log(error);
  }
};

try {
  if (location.pathname === "/index.html" || "/folder.html") {
    // Button Update (Play-Pause)
    forAudio.addEventListener("ended", () => {
      forPlayBtns.forEach((button) => {
        button.lastElementChild.classList.add("hidden");
        button.firstElementChild.classList.remove("hidden");
      });
    });

    // Progress Functionality (Status)
    forAudio.addEventListener("timeupdate", () => {
      const percent = (forAudio.currentTime / forAudio.duration) * 100;
      forProgBox.forEach((tag) => {
        tag.firstElementChild.textContent = convert(forAudio.currentTime);
        tag.lastElementChild.textContent = convert(forAudio.duration);
      });

      forProgress.forEach((tag) => {
        tag.firstElementChild.style.left = percent + "%";
        tag.lastElementChild.style.width = percent + "%";
      });
    });

    // Progress Functionality (Touch)
    forProgress.forEach((tag) => {
      tag.addEventListener("click", (event) => {
        if (!forAudio.src) return; // Default

        const range = event.currentTarget.getBoundingClientRect(); // Touch Position
        const click = event.clientX - range.left;
        const percent = Math.min(100, Math.max(0, (click / range.width) * 100)); // Ensure 0 - 100

        forAudio.currentTime = (percent / 100) * forAudio.duration;

        tag.firstElementChild.style.left = percent + "%";
        tag.lastElementChild.style.width = percent + "%";
      });
    });

    // Button Update (Play-Pause)
    forPlayBtns.forEach((button) => {
      button.addEventListener("click", () => {
        if (!forAudio.src) return; // Default
        else if (forAudio.paused) {
          forAudio.play();
          button.firstElementChild.classList.add("hidden");
          button.lastElementChild.classList.remove("hidden");
        } else {
          forAudio.pause();
          button.lastElementChild.classList.add("hidden");
          button.firstElementChild.classList.remove("hidden");
        }
      });
    });

    // Button Update (Previous)
    forPrevBtns.forEach((button) => {
      button.addEventListener("click", async () => {
        if (!forAudio.src) return; // Default

        const index = titles.indexOf(file) - 1;
        if (index >= 0) await audioInit(titles[index], audioPath);
      });
    });

    // Button Update (Next)
    forNextBtns.forEach((button) => {
      button.addEventListener("click", async () => {
        if (!forAudio.src) return; // Default

        const index = titles.indexOf(file) + 1;
        if (index < titles.length) await audioInit(titles[index], audioPath);
      });
    });

    // Button Update (Shuffle)
    forShuBtns.forEach((button) => {
      button.addEventListener("click", async () => {
        if (!forAudio.src) return; // Default

        await audioInit(select(titles), audioPath);
      });
    });

    // Button Update (Repeat)
    forReptBtns.forEach((button) => {
      button.dataset.repeat = "false"; // Default

      button.addEventListener("click", () => {
        if (!forAudio.src) return; // Default

        const isRepeating = button.dataset.repeat === "true";

        if (isRepeating) {
          button.dataset.repeat = "false";
          forAudio.removeEventListener("ended", audioRepeat);
          button.firstElementChild.setAttribute("color", "#ffffff"); // Inactive
        } else {
          button.dataset.repeat = "true";
          forAudio.addEventListener("ended", audioRepeat);
          button.firstElementChild.setAttribute("color", "#ed254e"); // Active
        }
      });

      const audioRepeat = () => {
        forAudio.play();
        forPlayBtns.forEach((button) => {
          button.firstElementChild.classList.add("hidden");
          button.lastElementChild.classList.remove("hidden");
        });
      };
    });

    // Button Update (Download)
    forDownBtns.forEach((button) => {
      button.addEventListener("click", () => {
        if (!forAudio.src) return; // Default

        const link = document.createElement("a");
        link.href = forAudio.src;
        link.download = `Gabriel Music 320kbps - ${file}`;
        link.click();
      });
    });

    // Button Update (Sound)
    forSound.forEach((tag) => {
      tag.firstElementChild.addEventListener("click", () => {
        tag.firstElementChild.firstElementChild.classList.toggle("hidden");
        tag.firstElementChild.lastElementChild.classList.toggle("hidden");

        if (forAudio.volume > 0) {
          forAudio.volume = 0;
          tag.lastElementChild.firstElementChild.style.left = "0%";
          tag.lastElementChild.lastElementChild.style.width = "0%";
        } else {
          forAudio.volume = 1;
          tag.lastElementChild.firstElementChild.style.left = "100%";
          tag.lastElementChild.lastElementChild.style.width = "100%";
        }
      });
    });

    // Sound Functionality (Touch)
    forSound.forEach((tag) => {
      tag.lastElementChild.addEventListener("click", (event) => {
        const range = event.currentTarget.getBoundingClientRect(); // Touch Position
        const click = event.clientX - range.left;
        const percent = Math.min(100, Math.max(0, (click / range.width) * 100)); // Ensure 0 - 100

        forAudio.volume = percent / 100;

        tag.lastElementChild.firstElementChild.style.left = percent + "%";
        tag.lastElementChild.lastElementChild.style.width = percent + "%";

        if (percent === 0) {
          tag.firstElementChild.firstElementChild.classList.add("hidden");
          tag.firstElementChild.lastElementChild.classList.remove("hidden");
        } else {
          tag.firstElementChild.lastElementChild.classList.add("hidden");
          tag.firstElementChild.firstElementChild.classList.remove("hidden");
        }
      });
    });

    if (location.pathname === "/folder.html") {
      let isPlaying = false; // Default

      // Button Update (Play-All)
      forPlyAll.addEventListener("click", async () => {
        if (isPlaying) {
          isPlaying = false; // Deactivate
          forPlyAll.lastElementChild.classList.add("hidden");
          forPlyAll.firstElementChild.classList.remove("hidden");
          return;
        } else {
          isPlaying = true; // Activate
          await fullPlay();
          forPlyAll.firstElementChild.classList.add("hidden");
          forPlyAll.lastElementChild.classList.remove("hidden");
        }
      });

      // Play-All Functionality
      const fullPlay = async (index = 0) => {
        if (file) index = titles.indexOf(file) + 1; // Update
        if (!isPlaying || index >= titles.length) {
          isPlaying = false; // Deactivate
          forPlyAll.lastElementChild.classList.add("hidden");
          forPlyAll.firstElementChild.classList.remove("hidden");
          return;
        }

        audioInit(titles[index], audioPath);
        forAudio.onended = () => {
          if (isPlaying) fullPlay(index + 1);
        };
      };
    }
  }
} catch (error) {
  console.log(error);
}
