import { useRef, useEffect, useState } from "react";
import canAutoPlay from "can-autoplay";
import { Button, Box, Alert, Paper } from "@mui/material";
import VideoJS from "./VideoJS";
import "videojs-hotkeys";
import { toSeconds, sleep } from "../utils/helpers";

export default function Player(props) {
  const { playerRef, setCurrentTime, type, vod, timestamp, delay, setDelay, setPlayerState } = props;
  const timeUpdateRef = useRef(null);
  const [source, setSource] = useState(undefined);
  const [fileError, setFileError] = useState(undefined);
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: false,
    fluid: false,
    poster: vod.thumbnail_url,
  };

  const onReady = (player) => {
    playerRef.current = player;

    player.hotkeys({
      alwaysCaptureHotkeys: true,
      volumeStep: 0.1,
      seekStep: 5,
      enableModifiersForNumbers: false,
      enableMute: true,
      enableFullscreen: true,
    });

    canAutoPlay.video().then(({ result }) => {
      if (!result) playerRef.current.muted(true);
    });

    player.on("play", () => {
      setPlayerState(1);
      timeUpdate();
      loopTimeUpdate();
    });

    player.on("pause", () => {
      setPlayerState(2);
      clearTimeUpdate();
    });

    player.on("end", () => {
      setPlayerState(0);
      clearTimeUpdate();
    });

    player.on("waiting", () => {
      setPlayerState(3);
    });

    player.on("playing", () => {
      setPlayerState(1);
    });
  };

  const timeUpdate = () => {
    if (!playerRef.current) return;
    if (playerRef.current.paused()) return;
    let currentTime = 0;
    currentTime += playerRef.current.currentTime() ?? 0;
    currentTime += delay ?? 0;
    setCurrentTime(currentTime);
  };

  const loopTimeUpdate = () => {
    if (timeUpdateRef.current !== null) clearTimeout(timeUpdateRef.current);
    timeUpdateRef.current = setTimeout(() => {
      timeUpdate();
      loopTimeUpdate();
    }, 1000);
  };

  const clearTimeUpdate = () => {
    if (timeUpdateRef.current !== null) clearTimeout(timeUpdateRef.current);
  };

  const fileChange = (evt) => {
    setFileError(false);
    const file = evt.target.files[0];
    if (file.type.split("/")[0] !== "video") {
      return setFileError("It has to be a valid video file!");
    }

    setSource({ src: URL.createObjectURL(file), type: file.type });
  };

  useEffect(() => {
    if (!source || !playerRef.current) return;
    playerRef.current.src(source);

    const set = async () => {
      let playerDuration = playerRef.current.duration();
      while (isNaN(playerDuration) || playerDuration === 0) {
        playerDuration = playerRef.current.duration();
        await sleep(100);
      }
      const vodDuration = toSeconds(vod.duration);
      const tmpDelay = vodDuration - playerDuration < 0 ? 0 : vodDuration - playerDuration;
      setDelay(tmpDelay);
    };

    set();
  }, [source, playerRef, vod, setDelay]);

  useEffect(() => {
    if (!playerRef.current || timestamp <= 0 || !source) return;
    playerRef.current.currentTime(timestamp);
  }, [timestamp, playerRef, source]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      {type === "manual" && !source && (
        <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column" }}>
          {fileError && <Alert severity="error">{fileError}</Alert>}
          <Box sx={{ mt: 1 }}>
            <Button variant="contained" component="label">
              Select Video
              <input type="file" hidden onChange={fileChange} accept="video/*,.mkv" />
            </Button>
          </Box>
        </Paper>
      )}
      <Box sx={{ visibility: !source ? "hidden" : "visible", height: "100%", width: "100%", outline: "none" }}>
        <VideoJS options={videoJsOptions} onReady={onReady} />
      </Box>
    </Box>
  );
}
