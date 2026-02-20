import { useEffect } from "react";
import canAutoPlay from "can-autoplay";
import Youtube from "react-youtube";

export default function YoutubeGames(props) {
  const { games, playerRef, part, setPart, setPlayerState } = props;

  useEffect(() => {
    if (!playerRef.current) return;

    playerRef.current.loadVideoById(games[part.part - 1].video_id, part.timestamp);
  }, [part, playerRef, games]);

  const onReady = (evt) => {
    playerRef.current = evt.target;

    canAutoPlay.video().then(({ result }) => {
      if (!result) playerRef.current.mute();
    });

    playerRef.current.loadVideoById(games[part.part - 1].video_id, part.timestamp);
  };

  const onEnd = () => {
    const nextPart = part.part + 1;
    if (nextPart > games.length) return;
    setPart({ part: nextPart, duration: 0 });
  };

  const onError = (evt) => {
    if (evt.data !== 150) console.error(evt.data);
    //dmca error
  };

  const handleStateChange = (evt) => {
    // event.data: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
    if (evt.data !== undefined) {
      setPlayerState(evt.data);
    }
  };

  return (
    <Youtube
      className="youtube-player"
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
