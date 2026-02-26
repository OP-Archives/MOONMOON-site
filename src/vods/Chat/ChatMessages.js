import { Box, Button, CircularProgress } from "@mui/material";
import SimpleBar from "simplebar-react";

export default function ChatMessages(props) {
  const { comments, shownMessages, scrolling, scrollToBottom, chatRef, handleScroll } = props;

  if (comments && comments.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%", flexDirection: "column" }}>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress sx={{ mt: 2 }} size="2rem" />
        </Box>
      </Box>
    );
  }

  return (
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
  );
}
