import { useEffect, useRef, useState } from "react";
import { Box, useMediaQuery, Divider } from "@mui/material";
import Loading from "../utils/Loading";
import { useLocation, useParams } from "react-router-dom";
import Chat from "./Chat";
import { convertTimestamp } from "../utils/helpers";
import archiveClient from "./client";
import BaseVod from "./BaseVod";

const channel = process.env.REACT_APP_CHANNEL;

export default function CustomVod(props) {
  const location = useLocation();
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const { vodId } = useParams();
  const [vod, setVod] = useState(undefined);
  const search = new URLSearchParams(location.search);
  const [timestamp, setTimestamp] = useState(search.get("t") !== null ? convertTimestamp(search.get("t")) : 0);
  const [delay, setDelay] = useState(0);
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
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVod();
    return;
  }, [vodId]);

  useEffect(() => {
    console.info(`Chat Delay: ${userChatDelay + delay} seconds`);
    return;
  }, [userChatDelay, delay]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (timestamp > 0) {
      playerRef.current.currentTime(timestamp);
    }
  }, [timestamp, playerRef]);

  if (vod === undefined) return <Loading />;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: isPortrait ? "column" : "row", height: "100%", width: "100%" }}>
        <Box sx={{ display: "flex", height: isPortrait ? "auto" : "100%", width: "100%" }}>
          <BaseVod {...props} playerRef={playerRef} vod={vod} delay={delay} timestamp={timestamp} setTimestamp={setTimestamp} setDelay={setDelay} setPlayerState={setPlayerState} />
        </Box>
        {isPortrait && <Divider />}
        <Chat
          isPortrait={isPortrait}
          vodId={vodId}
          playerRef={playerRef}
          delay={delay}
          userChatDelay={userChatDelay}
          setUserChatDelay={setUserChatDelay}
          isYoutubeVod={false}
          playerState={playerState}
        />
      </Box>
    </Box>
  );
}
