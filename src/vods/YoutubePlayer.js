import { useEffect, useRef } from "react";
import canAutoPlay from "can-autoplay";
import Youtube from "react-youtube";

export default function YoutubePlayer(props) {
  const { youtube, playerRef, part, setPart, setCurrentTime, delay, setPlayerState, games } = props;
  const timeUpdateRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) return;

    if (games) {
      playerRef.current.loadVideoById(games[part.part - 1].video_id, part.timestamp);
    } else {
      const index = youtube.findIndex((data) => data.part === part.part);
      playerRef.current.loadVideoById(youtube[index !== -1 ? index : part.part - 1].id, part.timestamp);
    }
  }, [part, playerRef, youtube, games]);

  const timeUpdate = () => {
    if (!playerRef.current) return;
    if (playerRef.current.getPlayerState() !== 1) return;
    let currentTime = 0;
    for (let video of youtube) {
      if (video.part >= part.part) break;
      currentTime += video.duration;
    }
    currentTime += playerRef.current.getCurrentTime() ?? 0;
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

  const onReady = (evt) => {
    const player = evt.target;
    playerRef.current = player;

    canAutoPlay.video().then(({ result }) => {
      if (!result) player.mute();
    });

    if (games) {
      playerRef.current.loadVideoById(games[part.part - 1].video_id, part.timestamp);
    } else {
      const index = youtube.findIndex((data) => data.part === part.part);
      player.loadVideoById(youtube[index !== -1 ? index : 0].id, part.timestamp);
    }
  };

  const onPlay = () => {
    if (games) return;
    timeUpdate();
    loopTimeUpdate();
  };

  const onPause = () => {
    if (games) return;
    clearTimeUpdate();
  };

  const onEnd = () => {
    const nextPart = part.part + 1;

    if (games) {
      if (nextPart > games.length) return;
      setPart({ part: nextPart, duration: 0 });
    } else {
      if (nextPart > youtube.length) return;
      setPart({ part: nextPart, duration: 0 });
    }
  };

  const onError = (evt) => {
    if (evt.data !== 150) console.error(evt.data);
    //dmca error
  };

  const clearTimeUpdate = () => {
    if (timeUpdateRef.current !== null) clearTimeout(timeUpdateRef.current);
  };

  const handleStateChange = (evt) => {
    // event.data: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
    if (evt.data !== undefined) {
      setPlayerState(evt.data);
    }
  };

  return (
    <Youtube
      className="player"
      opts={{
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: process.env.REACT_APP_DOMAIN,
        },
      }}
      onReady={onReady}
      onPlay={onPlay}
      onPause={onPause}
      onEnd={onEnd}
      onError={onError}
      onStateChange={handleStateChange}
    />
  );
}
