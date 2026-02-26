import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Loading from '../utils/Loading';
import { useLocation, useParams } from 'react-router-dom';
import NotFound from '../utils/NotFound';
import Chat from './Chat';
import { toSeconds, convertTimestamp } from '../utils/helpers';
import BaseVod from './BaseVod';
import archiveClient from './client';
import { getResumePosition, saveResumePosition, clearResumePosition } from '../utils/positionStorage';

const channel = process.env.REACT_APP_CHANNEL;

export default function YoutubeVod(props) {
  const { type } = props;
  const location = useLocation();
  const isPortrait = useMediaQuery('(orientation: portrait)');
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
        .service('vods')
        .get(vodId)
        .then((response) => {
          setVod(response);
          if (!type) {
            const useType = response.youtube.some((youtube) => youtube.type === 'live') ? 'live' : 'vod';
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
    if (!youtube || !vodId) return;

    const search = new URLSearchParams(location.search);
    const timestampParam = search.get('t');
    let timestamp = timestampParam !== null ? convertTimestamp(timestampParam) : 0;
    const partParam = search.get('part');
    let tmpPart = partParam !== null ? parseInt(partParam) : 1;
    if (timestamp > 0) {
      for (const data of youtube) {
        if (data.duration > timestamp) {
          tmpPart = data.part ?? youtube.indexOf(data) + 1;
          break;
        }
        timestamp -= data.duration;
      }
    } else {
      const savedPosition = getResumePosition(vodId);
      if (savedPosition !== null && savedPosition > 0) {
        console.info(`Resuming Playback from ${savedPosition}`);
        timestamp = savedPosition;
      }
    }
    setPart({ part: tmpPart, timestamp });
    return;
  }, [location.search, vodId, youtube]);

  useEffect(() => {
    if (!youtube || !vod) return;
    const vodDuration = toSeconds(vod.duration);
    let totalYoutubeDuration = 0;
    for (const data of youtube) {
      if (!data.duration) {
        totalYoutubeDuration += process.env.REACT_APP_DEFAULT_DELAY ?? 0;
        continue;
      }
      totalYoutubeDuration += data.duration;
    }
    const tmpDelay = Math.max(0, vodDuration - totalYoutubeDuration);
    setDelay(tmpDelay);
    return;
  }, [youtube, vod]);

  // Handle Resume Positions depending on player state.
  useEffect(() => {
    if (playerState === -1 || !vodId || !playerRef.current) return;

    switch (playerState) {
      // Player States: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
      case 0:
        // Clear Resume Position when video has ended.
        clearResumePosition(vodId);
        break;
      case 2:
        const currentTime = playerRef.current?.getCurrentTime();
        if (currentTime !== null && currentTime > 0) {
          saveResumePosition(vodId, currentTime);
        }
        break;
      default:
        break;
    }
    return;
  }, [playerState, vodId, playerRef]);

  const handlePartChange = (evt) => {
    const tmpPart = evt.target.value + 1;
    setPart({ part: tmpPart, duration: 0 });
  };

  useEffect(() => {
    if (delay === undefined) return;
    console.info(`Chat Delay: ${userChatDelay + delay} seconds`);
  }, [userChatDelay, delay]);

  if (vod === undefined || part === undefined || delay === undefined || youtube === undefined) return <Loading />;

  if (youtube.length === 0) return <NotFound channel={channel} />;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: isPortrait ? 'column' : 'row', height: '100%', width: '100%' }}>
        <Box sx={{ display: 'flex', height: isPortrait ? 'auto' : '100%', width: '100%' }}>
          <BaseVod {...props} handlePartChange={handlePartChange} youtube={youtube} isYoutubeVod={true} playerRef={playerRef} part={part} setPart={setPart} vod={vod} setPlayerState={setPlayerState} />
        </Box>
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
