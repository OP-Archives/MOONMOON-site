import { useMemo, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { Box, Modal, Typography, TextField, InputAdornment, FormGroup, FormControlLabel, Checkbox, Button } from "@mui/material";

export default function Settings(props) {
  const { userChatDelay, setUserChatDelay, showModal, setShowModal, showTimestamp, setShowTimestamp } = props;
  const [filterWords, setFilterWords] = useState([]);

  const delayChange = useMemo(
    () =>
      debounce((evt) => {
        if (evt.target.value.length === 0) return;
        const value = Number(evt.target.value);
        if (isNaN(value)) return;
        setUserChatDelay(value);
      }, 300),
    [setUserChatDelay]
  );

  // Load all settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("chatSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.filterWords) {
          setFilterWords(settings.filterWords);
        }
        if (settings.showTimestamp !== undefined) {
          setShowTimestamp(settings.showTimestamp);
        }
      } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
      }
    }
  }, [setShowTimestamp]);

  // Save all settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      filterWords,
      showTimestamp
    };
    localStorage.setItem("chatSettings", JSON.stringify(settings));
  }, [filterWords, showTimestamp]);

  const handleAddWord = () => {
    const input = document.getElementById("filter-word-input");
    const word = input.value.trim();
    if (word && !filterWords.includes(word)) {
      setFilterWords([...filterWords, word]);
      input.value = "";
    }
  };

  const handleRemoveWord = (wordToRemove) => {
    setFilterWords(filterWords.filter(word => word !== wordToRemove));
  };

  return (
    <Modal open={showModal} onClose={() => setShowModal(false)}>
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 350, bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography variant="h6">Playback Settings</Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputProps={{
                endAdornment: <InputAdornment position="start">secs</InputAdornment>,
              }}
              fullWidth
              label="Chat Delay"
              size="small"
              type="number"
              onChange={delayChange}
              defaultValue={userChatDelay}
              onFocus={(evt) => evt.target.select()}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter Words</Typography>
            <Box sx={{ display: "flex", mb: 1 }}>
              <TextField
                id="filter-word-input"
                fullWidth
                label="Add word to filter"
                size="small"
                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
              />
              <Button variant="outlined" sx={{ ml: 1 }} onClick={handleAddWord}>Add</Button>
            </Box>
            <Box sx={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #ccc", p: 1, borderRadius: 1 }}>
              {filterWords.length > 0 ? (
                filterWords.map((word, index) => (
                  <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="body2">{word}</Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveWord(word)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">No filter words added</Typography>
              )}
            </Box>
          </Box>
        </Box>

        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel control={<Checkbox checked={showTimestamp} onChange={() => setShowTimestamp(!showTimestamp)} />} label="Show Timestamps" />
        </FormGroup>
      </Box>
    </Modal>
  );
}
