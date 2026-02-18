import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Box, Typography, Tooltip, Divider, Collapse, styled, IconButton, Button, tooltipClasses } from "@mui/material";
import SimpleBar from "simplebar-react";
import Loading from "../utils/Loading";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { collapseClasses } from "@mui/material/Collapse";
import Twemoji from "react-twemoji";
import Settings from "./Settings";
import { toHHMMSS } from "../utils/helpers";
import SettingsIcon from "@mui/icons-material/Settings";

const BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net";
const BASE_FFZ_EMOTE_CDN = "https://cdn.frankerfacez.com/emote";
//Needs CORS for mobile devices.
const BASE_BTTV_EMOTE_CDN = "https://emotes.overpowered.tv/bttv";
const BASE_7TV_EMOTE_CDN = "https://cdn.7tv.app/emote";
const BASE_FFZ_EMOTE_API = "https://api.frankerfacez.com/v1";
const BASE_BTTV_EMOTE_API = "https://api.betterttv.net/3";
const BASE_7TV_EMOTE_API = "https://7tv.io/v3";

let cachedBadges = new Map();

export default function Chat(props) {
  const { isPortrait, vodId, playerRef, playing, VODS_API_BASE, twitchId, channel, userChatDelay, delay, youtube, part, games } = props;
  const [showChat, setShowChat] = useState(true);
  const [shownMessages, setShownMessages] = useState([]);
  const [emotes, setEmotes] = useState({ ffz_emotes: [], bttv_emotes: [], "7tv_emotes": [] });
  const messageCountRef = useRef(0);
  const badgesCountRef = useRef(0);
  const comments = useRef([]);
  const badges = useRef();
  const cursor = useRef();
  const loopRef = useRef();
  const playRef = useRef();
  const chatRef = useRef();
  const stoppedAtIndex = useRef(0);
  const newMessages = useRef([]);
  const [scrolling, setScrolling] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (chatRef && chatRef.current) {
      const ref = chatRef.current;
      const handleScroll = (e) => {
        e.stopPropagation();
        const atBottom = ref.scrollHeight - ref.clientHeight - ref.scrollTop <= 128;
        setScrolling(!atBottom);
      };

      ref.addEventListener("scroll", handleScroll);

      return () => ref.removeEventListener("scroll", handleScroll);
    }
  }, [chatRef]);

  useEffect(() => {
    const loadBadges = () => {
      fetch(`${VODS_API_BASE}/v2/badges`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) return;
          badges.current = data;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadEmotes = async () => {
      await Promise.all([loadArchiveEmotes(), load7TVGlobalEmotes()]);
    };

    const loadArchiveEmotes = async () => {
      await fetch(`${VODS_API_BASE}/emotes?vod_id=${vodId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.data.length === 0) {
            fallbackLoadEmotes();
            return;
          }
          setEmotes(response.data[0]);
        })
        .catch((e) => {
          console.error(e);
          fallbackLoadEmotes();
        });
    };

    const fallbackLoadEmotes = async () => {
      await Promise.all([loadBTTVChannelEmotes(), loadBTTVGlobalEmotes(), load7TVEmotes(), loadFFZEmotes()]);
    };

    const loadBTTVGlobalEmotes = async () => {
      await fetch(`${BASE_BTTV_EMOTE_API}/cached/emotes/global`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status >= 400) return;
          setEmotes((emotes) => ({ ...emotes, bttv_emotes: emotes.bttv_emotes.concat(data)  }));
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadBTTVChannelEmotes = async () => {
      await fetch(`${BASE_BTTV_EMOTE_API}/cached/users/twitch/${twitchId}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status >= 400) return;
          setEmotes((emotes) => ({ ...emotes, bttv_emotes: emotes.bttv_emotes.concat(data.sharedEmotes.concat(data.channelEmotes)) }));
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadFFZEmotes = async () => {
      await fetch(`${BASE_FFZ_EMOTE_API}/room/id/${twitchId}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status >= 400) return;
          setEmotes((emotes) => ({ ...emotes, ffz_emotes: data.sets[data.room.set].emoticons }));
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const load7TVEmotes = async () => {
      await fetch(`${BASE_7TV_EMOTE_API}/users/twitch/${twitchId}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status_code >= 400) return;
          setEmotes((emotes) => ({ ...emotes, "7tv_emotes": data.emote_set.emotes }));
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const load7TVGlobalEmotes = async () => {
      await fetch(`${BASE_7TV_EMOTE_API}/emote-sets/global`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setEmotes((emotes) => ({ ...emotes, "7tv_emotes": emotes["7tv_emotes"].concat(data.emotes) }));
        })
        .catch((e) => {
          console.error(e);
        });
    };

    loadEmotes();
    loadBadges();
  }, [vodId, VODS_API_BASE, twitchId, channel]);

  // Pre-process emote/badge mappings during component initialization
  const emoteLookup = useMemo(() => {
    if (!emotes) return;
    const lookup = new Map();
    const { ffz_emotes, bttv_emotes, "7tv_emotes": sevenTVEmotes } = emotes;

    // Build lookup for all emotes (O(1) lookups)
    ffz_emotes.forEach((emote) => lookup.set(emote.code, { id: emote.id, code: emote.code, provider: "FFZ" }));
    bttv_emotes.forEach((emote) => lookup.set(emote.code, { id: emote.id, code: emote.code, provider: "BTTV" }));
    sevenTVEmotes.forEach((emote) => lookup.set(emote.code, { id: emote.id, code: emote.code, provider: "7TV" }));

    return lookup;
  }, [emotes]);

  const getCurrentTime = useCallback(() => {
    if (!playerRef.current) return 0;
    let time = 0;
    if (youtube) {
      for (let i = 0; i < youtube.length; i++) {
        let video = youtube[i];
        if (i + 1 >= part.part) break;
        time += video.duration;
      }
      time += playerRef.current.getCurrentTime() ?? 0;
    } else if (games) {
      time += parseFloat(games[part.part - 1].start_time);
      time += playerRef.current.getCurrentTime() ?? 0;
    } else {
      time += playerRef.current.currentTime();
    }
    time += delay;
    time += userChatDelay;
    return time;
  }, [playerRef, youtube, delay, part, userChatDelay, games]);

  const getEmoteImageUrl = (emote, type, size = 1) => {
    switch (type) {
      case "FFZ":
        return `${BASE_FFZ_EMOTE_CDN}/${emote.id}/${size}`;
      case "BTTV":
        return `${BASE_BTTV_EMOTE_CDN}/${emote.id}/${size === 4 ? 3 : size}x`;
      case "7TV":
        return `${BASE_7TV_EMOTE_CDN}/${emote.id}/${size}x.webp`;
      default:
        return `${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/${size}.0`;
    }
  };

  const getEmoteImageSrcSet = (emote, type) => {
    switch (type) {
      case "FFZ":
        return `${BASE_FFZ_EMOTE_CDN}/${emote.id}/1 1x, ${BASE_FFZ_EMOTE_CDN}/${emote.id}/2 2x, ${BASE_FFZ_EMOTE_CDN}/${emote.id}/4 4x`;
      case "BTTV":
        return `${BASE_BTTV_EMOTE_CDN}/${emote.id}/1x 1x, ${BASE_BTTV_EMOTE_CDN}/${emote.id}/2x 2x, ${BASE_BTTV_EMOTE_CDN}/${emote.id}/3x 3x`;
      case "7TV":
        return `${BASE_7TV_EMOTE_CDN}/${emote.id}/1x.webp 1x, ${BASE_7TV_EMOTE_CDN}/${emote.id}/2x.webp 2x, ${BASE_7TV_EMOTE_CDN}/${emote.id}/3x.webp 3x, ${BASE_7TV_EMOTE_CDN}/${emote.id}/4x.webp 4x`;
      default:
        return `${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/1.0 1x, ${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/2.0 2x, ${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/3.0 4x`;
    }
  };

  const renderEmoteTooltip = useCallback((emote, word) => {
    const emoteType = emote.provider;

    return (
      <MessageTooltip
        key={messageCountRef.current++}
        title={
          <Box sx={{ maxWidth: "30rem", textAlign: "center" }}>
            <img
              crossOrigin="anonymous"
              style={{
                marginBottom: "0.3rem",
                border: "none",
                maxWidth: "100%",
                verticalAlign: "top",
              }}
              src={getEmoteImageUrl(emote, emoteType, 4)}
              alt={word}
            />
            <Typography display="block" variant="caption">{`Emote: ${emote.name || emote.code}`}</Typography>
            <Typography display="block" variant="caption">{`${emoteType} Emotes`}</Typography>
          </Box>
        }
      >
        <Box sx={{ display: "inline" }}>
          <img
            crossOrigin="anonymous"
            style={{
              verticalAlign: "middle",
              border: "none",
              maxWidth: "100%",
            }}
            src={getEmoteImageUrl(emote, emoteType)}
            srcSet={getEmoteImageSrcSet(emote, emoteType)}
            alt={word}
          />{" "}
        </Box>
      </MessageTooltip>
    );
  }, []);

  const transformMessage = useCallback(
    (fragments) => {
      if (!fragments) return;

      const textFragments = [];
      for (const fragment of fragments) {
        // Handle emote/emoticon fragments directly
        if (fragment.emote || fragment.emoticon) {
          const emoteID = fragment.emote ? fragment.emote.emoteID : fragment.emoticon.emoticon_id;
          textFragments.push(renderEmoteTooltip({ id: emoteID, code: fragment.text, provider: "Twitch" }, fragment.text));
        } else {
          const words = fragment.text.split(" ");
          for (let word of words) {
            const emote = emoteLookup.get(word);
            if (emote) {
              textFragments.push(renderEmoteTooltip(emote, word));
            } else {
              textFragments.push(
                <Twemoji key={messageCountRef.current++} noWrapper options={{ className: "twemoji" }}>
                  <Typography variant="body1" display="inline">{`${word} `}</Typography>
                </Twemoji>,
              );
            }
          }
        }
      }

      return <Box sx={{ display: "inline" }}>{textFragments}</Box>;
    },
    [emoteLookup, renderEmoteTooltip],
  );

  const buildComments = useCallback(() => {
    if (!playerRef.current || !comments.current || comments.current.length === 0 || !cursor.current || stoppedAtIndex.current === null) return;
    if (youtube || games ? playerRef.current.getPlayerState() !== 1 : playerRef.current.paused()) return;

    const time = getCurrentTime();
    let lastIndex = comments.current.length - 1;
    for (let i = stoppedAtIndex.current.valueOf(); i < comments.current.length; i++) {
      if (comments.current[i].content_offset_seconds > time) {
        lastIndex = i;
        break;
      }
    }

    // Early exit if no new messages
    if (stoppedAtIndex.current === lastIndex && stoppedAtIndex.current !== 0) return;

    const fetchNextComments = () => {
      fetch(`${VODS_API_BASE}/v1/vods/${vodId}/comments?cursor=${cursor.current}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          stoppedAtIndex.current = 0;
          comments.current = response.comments;
          cursor.current = response.cursor;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const transformBadges = (textBadges) => {
      if (!badges.current) return;

      const badgeWrapper = [];
      const { channel: channelBadges, global: globalBadges } = badges.current;

      for (const textBadge of textBadges) {
        const badgeId = textBadge._id ?? textBadge.setID;
        const version = textBadge.version;

        const cachedKey = `${badgeId}-${version}`;
        if (cachedBadges.has(cachedKey)) {
          const cachedBadge = cachedBadges.get(cachedKey);
          const { badgeVersion } = cachedBadge;

          badgeWrapper.push(
            <MessageTooltip
              key={badgesCountRef.current++}
              title={
                <Box sx={{ maxWidth: "30rem", textAlign: "center" }}>
                  <img
                    crossOrigin="anonymous"
                    style={{
                      marginBottom: "0.3rem",
                      border: "none",
                      maxWidth: "100%",
                      verticalAlign: "top",
                    }}
                    src={badgeVersion.image_url_4x}
                    alt=""
                  />
                  <Typography display="block" variant="caption">{`${badgeId}`}</Typography>
                </Box>
              }
            >
              <img
                crossOrigin="anonymous"
                style={{
                  display: "inline-block",
                  minWidth: "1rem",
                  height: "1rem",
                  margin: "0 .2rem .1rem 0",
                  backgroundPosition: "50%",
                  verticalAlign: "middle",
                }}
                srcSet={`${badgeVersion.image_url_1x} 1x, ${badgeVersion.image_url_2x} 2x, ${badgeVersion.image_url_4x} 4x`}
                src={badgeVersion.image_url_1x}
                alt=""
              />
            </MessageTooltip>,
          );
          continue;
        }

        const badge = channelBadges?.find((b) => b.set_id === badgeId) || globalBadges?.find((b) => b.set_id === badgeId);
        if (!badge) continue;

        const badgeVersion = badge.versions.find((v) => v.id === version);
        if (!badgeVersion) continue;

        cachedBadges.set(cachedKey, { badgeVersion });

        badgeWrapper.push(
          <MessageTooltip
            key={badgesCountRef.current++}
            title={
              <Box sx={{ maxWidth: "30rem", textAlign: "center" }}>
                <img
                  crossOrigin="anonymous"
                  style={{
                    marginBottom: "0.3rem",
                    border: "none",
                    maxWidth: "100%",
                    verticalAlign: "top",
                  }}
                  src={badgeVersion.image_url_4x}
                  alt=""
                />
                <Typography display="block" variant="caption">{`${badgeId}`}</Typography>
              </Box>
            }
          >
            <img
              crossOrigin="anonymous"
              style={{
                display: "inline-block",
                minWidth: "1rem",
                height: "1rem",
                margin: "0 .2rem .1rem 0",
                backgroundPosition: "50%",
                verticalAlign: "middle",
              }}
              srcSet={`${badgeVersion.image_url_1x} 1x, ${badgeVersion.image_url_2x} 2x, ${badgeVersion.image_url_4x} 4x`}
              src={badgeVersion.image_url_1x}
              alt=""
            />
          </MessageTooltip>,
        );
      }

      return <Box sx={{ display: "inline" }}>{badgeWrapper}</Box>;
    };

    // Create only new messages, not all messages
    const newMessages = [];
    for (let i = stoppedAtIndex.current.valueOf(); i < lastIndex; i++) {
      const comment = comments.current[i];
      if (!comment.message) continue;
      newMessages.push(
        <Box key={comment.id} sx={{ width: "100%" }}>
          <Box
            sx={{
              alignItems: "flex-start",
              display: "flex",
              flexWrap: "nowrap",
              width: "100%",
              pl: 0.5,
              pt: 0.5,
              pr: 0.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              {showTimestamp && (
                <Box sx={{ display: "inline", pl: 1, pr: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    {toHHMMSS(comment.content_offset_seconds)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ flexGrow: 1 }}>
                {comment.user_badges && transformBadges(comment.user_badges)}
                <Box sx={{ textDecoration: "none", display: "inline" }}>
                  <span style={{ color: comment.user_color, fontWeight: 600 }}>{comment.display_name}</span>
                </Box>
                <Box sx={{ display: "inline" }}>
                  <span>: </span>
                  {transformMessage(comment.message)}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>,
      );
    }

    // Only update state if there are new messages
    if (newMessages.length > 0) {
      setShownMessages((shownMessages) => {
        const concatMessages = shownMessages.concat(newMessages);
        // Keep only the last 200 messages to prevent memory issues
        if (concatMessages.length > 200) {
          concatMessages.splice(0, concatMessages.length - 200);
        }
        return concatMessages;
      });
      stoppedAtIndex.current = lastIndex;
      if (comments.current.length - 1 === lastIndex) fetchNextComments();
    }
  }, [getCurrentTime, playerRef, vodId, VODS_API_BASE, youtube, games, showTimestamp, transformMessage]);

  const loop = useCallback(() => {
    if (loopRef.current !== null) clearInterval(loopRef.current);
    buildComments();
    loopRef.current = setInterval(buildComments, 500);
  }, [buildComments]);

  useEffect(() => {
    if (!playing.playing || stoppedAtIndex.current === undefined) return;
    const fetchComments = (offset = 0) => {
      fetch(`${VODS_API_BASE}/v1/vods/${vodId}/comments?content_offset_seconds=${offset}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          comments.current = response.comments;
          cursor.current = response.cursor;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const time = getCurrentTime();

    if (comments.current && comments.current.length > 0) {
      const lastComment = comments.current[comments.current.length - 1];
      const firstComment = comments.current[0];

      if (time - lastComment.content_offset_seconds <= 30 && time > firstComment.content_offset_seconds) {
        if (comments.current[stoppedAtIndex.current].content_offset_seconds - time >= 4) {
          stoppedAtIndex.current = 0;
          setShownMessages([]);
        }
        loop();
        return;
      }
    }
    if (playRef.current) clearTimeout(playRef.current);
    playRef.current = setTimeout(() => {
      stopLoop();
      stoppedAtIndex.current = 0;
      comments.current = [];
      cursor.current = null;
      setShownMessages([]);
      fetchComments(time);
      loop();
    }, 300);
    return () => {
      stopLoop();
    };
  }, [playing, vodId, getCurrentTime, loop, VODS_API_BASE]);

  const stopLoop = () => {
    if (loopRef.current !== null) clearInterval(loopRef.current);
  };

  useEffect(() => {
    if (!chatRef.current || shownMessages.length === 0) return;

    let messageHeight = 0;
    for (let message of newMessages.current) {
      if (!message.props.ref.current) continue;
      messageHeight += message.props.ref.current.scrollHeight;
    }
    const height = chatRef.current.scrollHeight - chatRef.current.clientHeight - chatRef.current.scrollTop - messageHeight;
    const atBottom = height < 128;
    if (atBottom) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [shownMessages]);

  const scrollToBottom = () => {
    setScrolling(false);
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  const handleExpandClick = () => {
    setShowChat(!showChat);
  };

  return (
    <Box
      sx={{
        height: "100%",
        background: "#131314",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {showChat ? (
        <>
          <Box sx={{ display: "grid", alignItems: "center", p: 1 }}>
            {!isPortrait && (
              <Box
                sx={{
                  justifySelf: "left",
                  gridColumnStart: 1,
                  gridRowStart: 1,
                }}
              >
                <Tooltip title="Collapse">
                  <ExpandMore expand={showChat} onClick={handleExpandClick} aria-expanded={showChat}>
                    <ExpandMoreIcon />
                  </ExpandMore>
                </Tooltip>
              </Box>
            )}
            <Box
              sx={{
                justifySelf: "center",
                gridColumnStart: 1,
                gridRowStart: 1,
              }}
            >
              <Typography variant="body1">Chat Replay</Typography>
            </Box>
            <Box sx={{ justifySelf: "end", gridColumnStart: 1, gridRowStart: 1 }}>
              <IconButton title="Settings" onClick={() => setShowModal(true)} color="primary">
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider />
          <CustomCollapse in={showChat} timeout="auto" unmountOnExit sx={{ minWidth: "340px" }}>
            {comments.length === 0 ? (
              <Loading />
            ) : (
              <>
                <SimpleBar scrollableNodeProps={{ ref: chatRef }} style={{ height: "100%", overflowX: "hidden" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        minHeight: 0,
                        alignItems: "flex-end",
                      }}
                    >
                      {shownMessages}
                    </Box>
                  </Box>
                </SimpleBar>
                {scrolling && (
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        background: "rgba(0,0,0,.6)",
                        minHeight: 0,
                        borderRadius: 1,
                        mb: 1,
                        bottom: 0,
                        position: "absolute",
                      }}
                    >
                      <Button size="small" onClick={scrollToBottom}>
                        Chat Paused
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </CustomCollapse>
        </>
      ) : (
        !isPortrait && (
          <Box sx={{ position: "absolute", right: 0 }}>
            <Tooltip title="Expand">
              <ExpandMore expand={showChat} onClick={handleExpandClick} aria-expanded={showChat}>
                <ExpandMoreIcon />
              </ExpandMore>
            </Tooltip>
          </Box>
        )
      )}
      <Settings
        userChatDelay={userChatDelay}
        setUserChatDelay={props.setUserChatDelay}
        showModal={showModal}
        setShowModal={setShowModal}
        showTimestamp={showTimestamp}
        setShowTimestamp={setShowTimestamp}
      />
    </Box>
  );
}

const CustomCollapse = styled(({ _, ...props }) => <Collapse {...props} />)({
  [`& .${collapseClasses.wrapper}`]: {
    height: "100%",
  },
});

const ExpandMore = styled(({ expand, ...props }, ref) => <IconButton {...props} />)`
  margin-left: auto;
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  ${(props) =>
    props.expand
      ? `
          transform: rotate(-90deg);
        `
      : `
          transform: rotate(90deg);
        `}
`;

const MessageTooltip = styled(({ className, ...props }) => <Tooltip {...props} PopperProps={{ disablePortal: true }} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#fff",
    color: "rgba(0, 0, 0, 0.87)",
  },
}));
