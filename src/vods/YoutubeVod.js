import { useEffect, useRef, useState } from "react";
import { Box, useMediaQuery, Divider } from "@mui/material";
import Loading from "../utils/Loading";
import { useLocation, useParams } from "react-router-dom";
import NotFound from "../utils/NotFound";
import Chat from "./Chat";
import { toSeconds, convertTimestamp } from "../utils/helpers";
import BaseVod from "./BaseVod";
import archiveClient from "./client";

const channel = process.env.REACT_APP_CHANNEL;

export default function YoutubeVod(props) {
  const { type } = props;
  const location = useLocation();
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const { vodId } = useParams();
  const [vod, setVod] = useState(undefined);
  const [youtube, setYoutube] = useState(undefined);
  const [part, setPart] = useState(undefined);
  const [delay, setDelay] = useState(undefined);
  const [userChatDelay, setUserChatDelay] = useState(0);
  const [playerState, setPlayerState] = useState(-1);
  const playerRef = useRef(null);

  useEffect(() => {
    document.title = `${vodId} - ${channel}`;
    const fetchVod = async () => {
      await archiveClient
        .service("vods")
        .get(vodId)
        .then((response) => {
          setVod(response);
          if (!type) {
            const useType = response.youtube.some((youtube) => youtube.type === "live") ? "live" : "vod";
            setYoutube(response.youtube.filter((data) => data.type === useType));
          } else {
            setYoutube(response.youtube.filter((data) => data.type === type));
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVod();
    return;
  }, [vodId, type]);

  useEffect(() => {
    if (!youtube) return;

    const search = new URLSearchParams(location.search);
    let timestamp = search.get("t") !== null ? convertTimestamp(search.get("t")) : 0;
    let tmpPart = search.get("part") !== null ? parseInt(search.get("part")) : 1;
    if (timestamp > 0) {
      for (let data of youtube) {
        if (data.duration > timestamp) {
          tmpPart = data?.part || youtube.indexOf(data) + 1;
          break;
        }
        timestamp -= data.duration;
      }
    }
    setPart({ part: tmpPart, timestamp: timestamp });
    return;
  }, [location.search, youtube]);

  useEffect(() => {
    if (!youtube || !vod) return;
    const vodDuration = toSeconds(vod.duration);
    let totalYoutubeDuration = 0;
    for (let data of youtube) {
      if (!data.duration) {
        totalYoutubeDuration += process.env.REACT_APP_DEFAULT_DELAY;
        continue;
      }
      totalYoutubeDuration += data.duration;
    }
    const tmpDelay = vodDuration - totalYoutubeDuration < 0 ? 0 : vodDuration - totalYoutubeDuration;
    setDelay(tmpDelay);
    return;
  }, [youtube, vod]);

  const handlePartChange = (evt) => {
    const tmpPart = evt.target.value + 1;
    setPart({ part: tmpPart, duration: 0 });
  };

  useEffect(() => {
    if (delay === undefined) return;
    console.info(`Chat Delay: ${userChatDelay + delay} seconds`);
  }, [userChatDelay, delay]);

  if (vod === undefined || part === undefined || delay === undefined) return <Loading />;

  if (youtube.length === 0) return <NotFound channel={channel} />;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: isPortrait ? "column" : "row", height: "100%", width: "100%" }}>
        <BaseVod
          {...props}
          handlePartChange={handlePartChange}
          youtube={youtube}
          isYoutubeVod={true}
          playerRef={playerRef}
          part={part}
          setPart={setPart}
          vod={vod}
          delay={delay}
          setPlayerState={setPlayerState}
        />
        {isPortrait && <Divider />}
        <Chat
          isPortrait={isPortrait}
          vodId={vodId}
          playerRef={playerRef}
          delay={delay}
          userChatDelay={userChatDelay}
          youtube={youtube}
          part={part}
          setPart={setPart}
          setUserChatDelay={setUserChatDelay}
          isYoutubeVod={true}
          playerState={playerState}
        />
      </Box>
    </Box>
  );
}
