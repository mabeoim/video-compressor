import React, { useState, useRef } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import "./App.css";

function App() {
  const [videoSrc, setVideoSrc] = useState("");
  const [file, setUploadedFile] = useState("");
  const [message, setMessage] = useState("Click Start to transcode");
  const logref = useRef(null);
  console.log(logref);
  const ffmpeg = createFFmpeg({
    log: true,
    logger: (data) => {
      if (logref.current)
        logref.current.innerText += "\n" + data.message + "\n";
    },
  });
  const doTranscode = async () => {
    setMessage("Loading ffmpeg-core.js");
    await ffmpeg.load();
    setMessage("Start transcoding");
    ffmpeg.FS("writeFile", file.name, await fetchFile(file));
    await ffmpeg.run(
      "-i",
      file.name,
      "-vcodec",
      "h264",
      "-acodec",
      "mp2",
      "output.mp4"
    );

    ffmpeg.setProgress(({ ratio }) => {
      console.log(ratio);
      /*
       * ratio is a float number between 0 to 1.
       */
    });

    // await ffmpeg.run("-i", "test.avi", "test.mp4");
    setMessage("Complete transcoding");
    const data = ffmpeg.FS("readFile", "output.mp4");
    setVideoSrc(
      URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }))
    );

    downloadFile(data, file.name);
  };

  const handleInputChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  return (
    <div className="App">
      <p />
      <input placeholder="Fil" onChange={handleInputChange} type="file" />
      <video width={800} height={480} src={videoSrc} controls></video>
      <br />
      <button onClick={doTranscode}>Start</button>
      <p>{message}</p>
      <div
        ref={logref}
        id="log"
        style={{ width: 800, height: 400, overflow: "scroll" }}
      >
        Waiting for log
      </div>
    </div>
  );
}

export default App;

function downloadFile(file, fileName) {
  // Create a link and set the URL using `createObjectURL`
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = URL.createObjectURL(
    new Blob([file.buffer], { type: "video/mp4" })
  );

  const s = fileName.split(".");
  const out = s[0] + "_compressed." + s[1];
  link.download = out;

  // It needs to be added to the DOM so it can be clicked
  document.body.appendChild(link);
  link.click();

  // To make this work on Firefox we need to wait
  // a little while before removing it.
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.parentNode.removeChild(link);
  }, 0);
}
