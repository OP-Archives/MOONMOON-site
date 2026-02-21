import { useEffect, useState, useRef } from "react";
import { Box, useMediaQuery, Divider } from "@mui/material";
import Loading from "../utils/Loading";
import { useLocation, useParams } from "react-router-dom";
import NotFound from "../utils/NotFound";
import Chat from "./Chat";
import archiveClient from "./client";
import BaseVod from "./BaseVod";

const channel = process.env.REACT_APP_CHANNEL;

export default function Games(props) {
  const location = useLocation();
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const { vodId } = useParams();
  const [vod, setVod] = useState(undefined);
  const [games, setGames] = useState(undefined);
  const [part, setPart] = useState(undefined);
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
    if (!vod) return;
    setGames(vod.games);
    const search = new URLSearchParams(location.search);
    let tmpPart = search.get("part") !== null ? parseInt(search.get("part")) : 1;
    setPart({ part: tmpPart, timestamp: 0 });
    return;
  }, [vod, location.search]);

  const handlePartChange = (evt) => {
    const tmpPart = evt.target.value + 1;
    setPart({ part: tmpPart, timestamp: 0 });
  };

  useEffect(() => {
    console.info(`Chat Delay: ${userChatDelay} seconds`);
    return;
  }, [userChatDelay]);

  if (vod === undefined || part === undefined) return <Loading />;

  if (games.length === 0) return <NotFound />;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: isPortrait ? "column" : "row", height: "100%", width: "100%" }}>
        <BaseVod {...props} handlePartChange={handlePartChange} games={games} playerRef={playerRef} part={part} setPart={setPart} vod={vod} setPlayerState={setPlayerState} />
        {isPortrait && <Divider />}
        <Chat
          isPortrait={isPortrait}
          vodId={vodId}
          playerRef={playerRef}
          userChatDelay={userChatDelay}
          part={part}
          setPart={setPart}
          games={games}
          setUserChatDelay={setUserChatDelay}
          playerState={playerState}
        />
      </Box>
    </Box>
  );
}
