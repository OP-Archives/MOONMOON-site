import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Box, Typography, Tooltip, Divider, Collapse, styled, IconButton, Button, CircularProgress, tooltipClasses } from "@mui/material";
import SimpleBar from "simplebar-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { collapseClasses } from "@mui/material/Collapse";
import Twemoji from "react-twemoji";
import Settings from "./Settings";
import { toHHMMSS } from "../utils/helpers";
import SettingsIcon from "@mui/icons-material/Settings";

//ENV
const twitchId = process.env.REACT_APP_TWITCH_ID,
  ARCHIVE_API_BASE = process.env.REACT_APP_ARCHIVE_API_BASE;

// CDN URLs for emotes and badges
const BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net";
const BASE_FFZ_EMOTE_CDN = "https://cdn.frankerfacez.com/emote";
const BASE_BTTV_EMOTE_CDN = "https://emotes.overpowered.tv/bttv";
const BASE_7TV_EMOTE_CDN = "https://cdn.7tv.app/emote";
const BASE_FFZ_EMOTE_API = "https://api.frankerfacez.com/v1";
const BASE_BTTV_EMOTE_API = "https://api.betterttv.net/3";
const BASE_7TV_EMOTE_API = "https://7tv.io/v3";

// Cache for badges
let cachedBadges = new Map();

export default function Chat(props) {
  const { isPortrait, vodId, playerRef, userChatDelay, delay, youtube, part, games, isYoutubeVod, playerState } = props;

  // State management
  const [showChat, setShowChat] = useState(true);
  const [shownMessages, setShownMessages] = useState([]);
  const [emotes, setEmotes] = useState({ ffz_emotes: [], bttv_emotes: [], "7tv_emotes": [] });
  const [scrolling, setScrolling] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isAtBottomRef = useRef(true);

  // Refs for various data and timers
  const comments = useRef([]);
  const badges = useRef();
  const cursor = useRef();
  const loopRef = useRef();
  const playRef = useRef();
  const chatRef = useRef();
  const stoppedAtIndex = useRef(0);
  const newMessages = useRef();

  // === EFFECT HOOKS ===
  useEffect(() => {
    const loadBadges = () => {
      fetch(`${ARCHIVE_API_BASE}/v2/badges`, {
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
      await fetch(`${ARCHIVE_API_BASE}/emotes?vod_id=${vodId}`, {
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
          setEmotes((emotes) => ({ ...emotes, bttv_emotes: emotes.bttv_emotes.concat(data) }));
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
  }, [vodId]);

  // === MEMOIZED VALUES ===
  const emoteLookup = useMemo(() => {
    if (!emotes) return;
    const lookup = new Map();
    const { ffz_emotes, bttv_emotes, "7tv_emotes": sevenTVEmotes } = emotes;

    // Build lookup for all emotes (O(1) lookups)
    ffz_emotes.forEach((emote) => lookup.set(emote.code || emote.name, { ...emote, provider: "FFZ" }));
    bttv_emotes.forEach((emote) => lookup.set(emote.code || emote.name, { ...emote, provider: "BTTV" }));
    sevenTVEmotes.forEach((emote) => lookup.set(emote.code || emote.name, { ...emote, provider: "7TV" }));

    return lookup;
  }, [emotes]);

  // === CALLBACK FUNCTIONS ===
  const getCurrentTime = useCallback(() => {
    if (!playerRef.current) return 0;
    let time = 0;
    if (youtube && isYoutubeVod) {
      for (let i = 0; i < youtube.length; i++) {
        let video = youtube[i];
        if (i + 1 >= part.part) break;
        time += video.duration;
      }
      time += playerRef.current.getCurrentTime() ?? 0;
    } else if (games && isYoutubeVod) {
      time += parseFloat(games[part.part - 1].start_time);
      time += playerRef.current.getCurrentTime() ?? 0;
    } else {
      time += playerRef.current.currentTime();
    }
    time += delay ?? 0;
    time += userChatDelay ?? 0;
    return time;
  }, [playerRef, youtube, delay, part, userChatDelay, games, isYoutubeVod]);

  const isPlaying = useCallback(() => {
    if (!playerRef.current) return false;
    return isYoutubeVod ? playerRef.current.getPlayerState() === 1 : playerRef.current.paused() === false;
  }, [isYoutubeVod, playerRef]);

  const getEmoteImageUrl = useCallback((emote, type, size = 1) => {
    switch (type) {
      case "FFZ":
        return `${BASE_FFZ_EMOTE_CDN}/${emote.id}/${size}`;
      case "BTTV":
        return `${BASE_BTTV_EMOTE_CDN}/${emote.id}/${size === 4 ? 2 : size}x`;
      case "7TV":
        return `${BASE_7TV_EMOTE_CDN}/${emote.id}/${size}x.webp`;
      default:
        return `${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/${size}.0`;
    }
  }, []);

  const getEmoteImageSrcSet = useCallback((emote, type) => {
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
  }, []);

  // Checks if 7tv emote is zero width
  const SEVENTV_isZeroWidth = useCallback((emote) => {
    const ZERO_WIDTH = 1 << 8;
    return (emote.flags && ZERO_WIDTH) !== 0;
  }, []);

  const renderEmoteTooltip = useCallback(
    (emote, word, key) => {
      const emoteType = emote.provider;

      return (
        <MessageTooltip
          key={key}
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
                src={getEmoteImageUrl(emote, emoteType, 2)}
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
    },
    [getEmoteImageUrl, getEmoteImageSrcSet],
  );

  const renderZeroWidthEmote = useCallback(
    (emote, word, key) => {
      const emoteType = emote.provider;

      return (
        <span>
          <img
            key={key}
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              verticalAlign: "middle",
              maxWidth: "100%",
              border: "none",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            src={getEmoteImageUrl(emote, emoteType)}
            srcSet={getEmoteImageSrcSet(emote, emoteType)}
            alt={word}
          />
        </span>
      );
    },
    [getEmoteImageUrl, getEmoteImageSrcSet],
  );

  const transformMessage = useCallback(
    (fragments, keyPrefix) => {
      if (!fragments) return;

      const textFragments = [];
      for (const fragment of fragments) {
        // Handle emote/emoticon fragments directly
        if (fragment.emote || fragment.emoticon) {
          const emoteID = fragment.emote ? fragment.emote.emoteID : fragment.emoticon.emoticon_id;
          textFragments.push(
            renderEmoteTooltip({ id: emoteID, code: fragment.text, provider: "Twitch" }, fragment.text, `${keyPrefix}-emote-${fragment.text}-${Math.random().toString(36).slice(2, 11)}`),
          );
        } else {
          const words = fragment.text.split(" ");
          let lastNormalEmote = null;
          let lastNormalEmoteIndex = -1;
          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const emote = emoteLookup.get(word);
            if (emote) {
              if (emote.provider === "7TV") {
                const isZeroWidth = SEVENTV_isZeroWidth(emote);

                // If Zero Width Emote
                if (isZeroWidth && lastNormalEmote) {
                  // Create a container that holds both the normal emote and zero-width emote
                  const zeroWidthEmote = renderZeroWidthEmote(emote, word, `${keyPrefix}-emote-${word}-${i}-${Math.random().toString(36).slice(2, 11)}`);

                  // Create a wrapper that contains both emotes - zero-width emote first, then normal emote
                  // This ensures the zero-width emote is positioned correctly relative to the normal emote
                  const emoteContainer = (
                    <Box key={`${keyPrefix}-emote-container-${word}-${i}-${Math.random().toString(36).slice(2, 11)}`} sx={{ display: "inline", position: "relative", verticalAlign: "middle" }}>
                      {zeroWidthEmote}
                      {lastNormalEmote}
                    </Box>
                  );

                  // Replace the previous normal emote with the container
                  textFragments[lastNormalEmoteIndex] = emoteContainer;
                  lastNormalEmote = null;
                  lastNormalEmoteIndex = -1;
                } else {
                  const normalEmote = renderEmoteTooltip(emote, word, `${keyPrefix}-emote-${word}-${i}-${Math.random().toString(36).slice(2, 11)}`);
                  lastNormalEmote = normalEmote;
                  lastNormalEmoteIndex = textFragments.length;
                  textFragments.push(normalEmote);
                }
              } else {
                const normalEmote = renderEmoteTooltip(emote, word, `${keyPrefix}-emote-${word}-${i}-${Math.random().toString(36).slice(2, 11)}`);
                lastNormalEmote = normalEmote;
                lastNormalEmoteIndex = textFragments.length;
                textFragments.push(normalEmote);
              }
            } else {
              lastNormalEmote = null;
              lastNormalEmoteIndex = -1;
              textFragments.push(
                <Twemoji key={`${keyPrefix}-twemoji-${word}-${i}-${Math.random().toString(36).slice(2, 11)}`} noWrapper options={{ className: "twemoji" }}>
                  <Typography variant="body1" display="inline">{`${word} `}</Typography>
                </Twemoji>,
              );
            }
          }
        }
      }

      return <Box sx={{ display: "inline" }}>{textFragments}</Box>;
    },
    [emoteLookup, renderEmoteTooltip, SEVENTV_isZeroWidth, renderZeroWidthEmote],
  );

  const buildComments = useCallback(() => {
    if (!playerRef.current || !comments.current || comments.current.length === 0 || !cursor.current || stoppedAtIndex.current === null) return;
    if (!isPlaying()) return;

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
      fetch(`${ARCHIVE_API_BASE}/v1/vods/${vodId}/comments?cursor=${cursor.current}`, {
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

    const transformBadges = (textBadges, keyPrefix) => {
      if (!badges.current) return;

      const badgeWrapper = [];
      const { channel: channelBadges, global: globalBadges } = badges.current;

      for (let i = 0; i < textBadges.length; i++) {
        const textBadge = textBadges[i];
        const badgeId = textBadge._id ?? textBadge.setID;
        const version = textBadge.version;

        const cachedKey = `${badgeId}-${version}`;
        if (cachedBadges.has(cachedKey)) {
          const cachedBadge = cachedBadges.get(cachedKey);
          const { badgeVersion } = cachedBadge;

          badgeWrapper.push(
            <MessageTooltip
              key={`${keyPrefix}-badge-${badgeId}-${version}`}
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
            key={`${keyPrefix}-badge-${badgeId}-${version}`}
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

    newMessages.current = [];
    // Create only new messages, not all messages
    for (let i = stoppedAtIndex.current.valueOf(); i < lastIndex; i++) {
      const comment = comments.current[i];
      if (!comment.message) continue;
      newMessages.current.push(
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
                {comment.user_badges && transformBadges(comment.user_badges, `comment-${comment.id}`)}
                <Box sx={{ textDecoration: "none", display: "inline" }}>
                  <span style={{ color: comment.user_color, fontWeight: 600 }}>{comment.display_name}</span>
                </Box>
                <Box sx={{ display: "inline" }}>
                  <span>: </span>
                  {transformMessage(comment.message, `comment-${comment.id}`)}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>,
      );
    }

    // Only update state if there are new messages
    if (newMessages.current.length > 0) {
      setShownMessages((shownMessages) => {
        const concatMessages = shownMessages.concat(newMessages.current);
        // Keep only the last 200 messages to prevent memory issues
        if (concatMessages.length > 200) {
          concatMessages.splice(0, concatMessages.length - 200);
        }
        return concatMessages;
      });
      stoppedAtIndex.current = lastIndex;
      if (comments.current.length - 1 === lastIndex) fetchNextComments();
    }
  }, [getCurrentTime, playerRef, vodId, showTimestamp, transformMessage, isPlaying]);

  useEffect(() => {
    if (!isAtBottomRef.current || shownMessages.length === 0) return;
    // Auto-scroll to bottom if user is at the bottom
    scrollToBottom();
  }, [shownMessages]);

  const loop = useCallback(() => {
    if (loopRef.current !== null) clearInterval(loopRef.current);
    buildComments();
    loopRef.current = setInterval(buildComments, 1000);
  }, [buildComments]);

  // Handle scroll events to detect when user scrolls up
  const handleScroll = useCallback(() => {
    if (!chatRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;

    // Check if user is at the bottom (within 350px tolerance)
    const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) < 350;

    // Update ref to track scroll position
    isAtBottomRef.current = isAtBottom;

    // If user scrolls up, pause auto-scrolling
    if (!isAtBottom) {
      setScrolling(true);
    } else {
      // If user scrolls all the way down, resume auto-scrolling
      setScrolling(false);
    }
  }, []);

  // === MAIN EFFECT HOOK ===
  useEffect(() => {
    if (playRef.current) clearTimeout(playRef.current);
    //Player not initalized yet
    if (playerState === -1 || !playerRef.current) return;

    // Handle player play/pause state changes
    const handlePlayerStateChange = () => {
      // If player is playing, fetch comments and start building
      if (playerState === 1) {
        const time = getCurrentTime();
        // Only fetch comments if we don't have any or if we're seeking out of range
        if (!comments.current || comments.current.length === 0 || time < comments.current[0].content_offset_seconds || time > comments.current[comments.current.length - 1].content_offset_seconds) {
          playRef.current = setTimeout(() => {
            stopLoop();
            stoppedAtIndex.current = 0;
            comments.current = [];
            cursor.current = null;
            setShownMessages([]);
            fetchComments(time);
            loop();
          }, 300);
        } else {
          // Player is playing and we have comments in range
          loop();
        }
      } else {
        // Player is paused, stop the loop
        stopLoop();
      }
    };

    const fetchComments = (offset = 0) => {
      fetch(`${ARCHIVE_API_BASE}/v1/vods/${vodId}/comments?content_offset_seconds=${Math.floor(offset)}`, {
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

    handlePlayerStateChange();

    const currentChatRef = chatRef.current;

    return () => {
      stopLoop();
      // Clean up scroll event listener with proper ref handling
      if (currentChatRef) {
        currentChatRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [vodId, playerRef, playerState, getCurrentTime, handleScroll, loop, isPlaying]);

  const stopLoop = () => {
    if (loopRef.current !== null) clearInterval(loopRef.current);
  };

  const scrollToBottom = () => {
    if (!chatRef.current) return;
    setScrolling(false);
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
    // Add a small delay to ensure all content is rendered
    setTimeout(() => {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);
    setTimeout(() => {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 300);
  };

  const handleExpandClick = () => {
    setShowChat(!showChat);
  };

  // === RENDERING ===
  return (
    <Box
      sx={{
        height: "100%",
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
          <CustomCollapse in={showChat} timeout="auto" unmountOnExit sx={{ minWidth: { xs: "unset", sm: "250px", md: "300px", lg: "340px" } }}>
            {comments.current && comments.current.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%", flexDirection: "column" }}>
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <CircularProgress sx={{ mt: 2 }} size="2rem" />
                </Box>
              </Box>
            ) : (
              <>
                <SimpleBar scrollableNodeProps={{ ref: chatRef, onScroll: handleScroll }} style={{ height: "100%", overflowX: "hidden" }}>
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

// === STYLED COMPONENTS ===
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
