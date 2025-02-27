import * as metadata from "https://cdn.jsdelivr.net/npm/music-metadata-browser/+esm";

// Fetch Audio-File
export const fetchAudio = async (path) => {
  try {
    if (!path) return; // Default

    const request = await fetch(`http://127.0.0.1:5500/${path}`); // Fetch Path

    if (!request.ok) console.log(request.statusText); // Check Status

    const response = await request.text(); // Update Response

    const div = document.createElement("div"); // Create Temp Div
    div.innerHTML = response;

    const anchors = div.querySelectorAll("a"); // Extract Anchors

    // Extract (.mp3) Audio-File
    const audios = Array.from(anchors)
      .map((anchor) => anchor.href)
      .filter((href) => href.endsWith(".mp3"))
      .map((href) => href.split("/").at(-1));

    return audios; // Return Audio-File
  } catch (error) {
    console.log(error); // Default
  }
};

// Fetch Video-File
export const fetchVideo = async (path) => {
  try {
    if (!path) return; // Default

    const request = await fetch(`http://127.0.0.1:5500/${path}`); // Fetch Path

    if (!request.ok) console.log(request.statusText); // Check Status

    const response = await request.text(); // Update Response

    const div = document.createElement("div"); // Create Temp Div
    div.innerHTML = response;

    const anchors = div.querySelectorAll("a"); // Extract Anchors

    // Extract (.mp4) Video-File
    const videos = Array.from(anchors)
      .map((anchor) => anchor.href)
      .filter((href) => href.endsWith(".mp4"))
      .map((href) => href.split("/").at(-1));

    return videos; // Return Video-File
  } catch (error) {
    console.log(error); // Default
  }
};

// Fetch Audio-File Metadata
export const metadatafile = async (path) => {
  try {
    if (!path) return; // Default

    const request = await fetch(`http://127.0.0.1:5500/${path}`); // Fetch Path

    if (!request.ok) console.log(request.statusText); // Check Status

    const response = await request.blob(); // Update Response
    const filedata = await metadata.parseBlob(response); // Read Blob Data

    let source = null; // Default

    // Picture Into Base64 (optimized)
    if (filedata.common.picture && filedata.common.picture.length > 0) {
      const picture = filedata.common.picture[0];

      // Convert Picture Into Base64 (No Deep Recursion)
      const binary = new Uint8Array(picture.data);
      let binaryString = "";
      for (let i = 0; i < binary.length; i++) {
        binaryString += String.fromCharCode(binary[i]);
      }

      const base64String = btoa(binaryString);
      source = `data:${picture.format};base64,${base64String}`; // Picture Data
    }

    // Return Audio-File Metadata
    return {
      title: filedata.common.title || "Unknown",
      album: filedata.common.album || "Unknown",
      artist: filedata.common.artist || "Unknown",
      composer: filedata.common.composer || "Unknown",
      year: filedata.common.year || "Unknown",
      genre: filedata.common.genre || ["Unknown"],
      language: filedata.common.language || ["Unknown"],
      duration: filedata.format.duration || "Unknown",
      track: filedata.common.track ? filedata.common.track.no : "Unknown",
      disk: filedata.common.disk ? filedata.common.disk.no : "Unknown",
      lyrics: filedata.common.lyrics || "Not Available",
      comment: filedata.common.comment || "Not Available",
      picture: filedata.common.picture ? source : "/public/img.jpg",
      format: filedata.format,
    };
  } catch (error) {
    console.log(error);
  }
};

// Fetch File-Data
export const fetchFile = async (path) => {
  try {
    if (!path) return; // Default

    const request = await fetch(`http://127.0.0.1:5500/${path}`); // Fetch Path

    if (!request.ok) console.log(request.statusText); // Check Status

    const response = await request.json(); // Update Response

    return response; // Return File
  } catch (error) {
    console.log(error); // Default
  }
};
