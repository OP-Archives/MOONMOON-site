import { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { Box, Modal, Typography, TextField, InputAdornment, FormGroup, FormControlLabel, Checkbox, Button, Slider } from "@mui/material";

export default function ChatSettingsModal(props) {
  const { userChatDelay, setUserChatDelay, showModal, setShowModal, showTimestamp, setShowTimestamp, chatWidth, setChatWidth } = props;
  const [filterWords, setFilterWords] = useState([]);

  const delayChange = useMemo(
    () =>
      debounce((evt) => {
        if (evt.target.value.length === 0) return;
        const value = Number(evt.target.value);
        if (isNaN(value)) return;
        setUserChatDelay(value);
      }, 300),
    [setUserChatDelay],
  );

  const debouncedSaveSetting = useMemo(
    () =>
      debounce((key, value) => {
        const savedSettings = localStorage.getItem("chatSettings");
        let settings = {};
        if (savedSettings) {
          try {
            settings = JSON.parse(savedSettings);
          } catch (e) {
            console.error("Failed to parse chat settings from localStorage", e);
          }
        }
        settings[key] = value;
        localStorage.setItem("chatSettings", JSON.stringify(settings));
      }, 500),
    [],
  );

  const handleAddWord = () => {
    const input = document.getElementById("filter-word-input");
    const word = input.value.trim();
    if (word && !filterWords.includes(word)) {
      setFilterWords([...filterWords, word]);
      debouncedSaveSetting("filterWords", [...filterWords, word]);
      input.value = "";
    }
  };

  const handleRemoveWord = (wordToRemove) => {
    setFilterWords(filterWords.filter((word) => word !== wordToRemove));
    debouncedSaveSetting("filterWords", filterWords.filter((word) => word !== wordToRemove));
  };

  return (
    <Modal open={showModal} onClose={() => setShowModal(false)}>
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 350, bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography variant="h6">Chat Settings</Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="start">secs</InputAdornment>,
                },
              }}
              fullWidth
              label="Chat Delay"
              size="small"
              onChange={delayChange}
              defaultValue={userChatDelay}
              onFocus={(evt) => evt.target.select()}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Chat Width
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Slider
                disabled={window.innerWidth - 400 <= 150}
                value={chatWidth}
                onChange={(e, newValue) => {
                  setChatWidth(newValue);
                  debouncedSaveSetting("chatWidth", newValue);
                }}
                min={150}
                max={Math.min(window.innerWidth - 400, 800)}
                step={10}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
                sx={{ width: "100%" }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Filter Words
            </Typography>
            <Box sx={{ display: "flex", mb: 1 }}>
              <TextField id="filter-word-input" fullWidth label="Add word to filter" size="small" onKeyDown={(e) => e.key === "Enter" && handleAddWord()} />
              <Button variant="outlined" sx={{ ml: 1 }} onClick={handleAddWord}>
                Add
              </Button>
            </Box>
            <Box sx={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #ccc", p: 1, borderRadius: 1 }}>
              {filterWords.length > 0 ? (
                filterWords.map((word, index) => (
                  <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="body2">{word}</Typography>
                    <Button size="small" color="error" onClick={() => handleRemoveWord(word)}>
                      Remove
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No filter words added
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showTimestamp}
                onChange={() => {
                  setShowTimestamp(!showTimestamp);
                  debouncedSaveSetting("showTimestamp", !showTimestamp);
                }}
              />
            }
            label="Show Timestamps"
          />
        </FormGroup>
      </Box>
    </Modal>
  );
}