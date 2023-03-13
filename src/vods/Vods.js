import React, { useEffect } from "react";
import { Box, Pagination, Grid, useMediaQuery, Typography, PaginationItem, TextField, InputAdornment } from "@mui/material";
import SimpleBar from "simplebar-react";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import Vod from "./Vod";
import Search from "./Search";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Vods(props) {
  const navigate = useNavigate();
  const { VODS_API_BASE, channel } = props;
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [vods, setVods] = React.useState([]);
  const [totalVods, setTotalVods] = React.useState(null);
  const page = parseInt(query.get("page") || "1", 10);
  const limit = isMobile ? 10 : 20;

  useEffect(() => {
    setVods(null);
    document.title = `VODS - ${channel}`;
    const fetchVods = async () => {
      await fetch(`${VODS_API_BASE}/vods?$limit=${limit}&$skip=${(page - 1) * limit}&$sort[createdAt]=-1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setVods(response.data);
          setTotalVods(response.total);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [VODS_API_BASE, channel, limit, page]);

  const handleSubmit = (e) => {
    const value = e.target.value;
    if (e.which === 13 && !isNaN(value) && value > 0) {
      navigate(`${location.pathname}?page=${value}`);
    }
  };

  const totalPages = Math.ceil(totalVods / limit);

  return (
    <SimpleBar style={{ minHeight: 0, height: "100%" }}>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {totalVods && (
            <Typography variant="h4" color="primary" sx={{ textTransform: "uppercase", fontWeight: "550" }}>
              {`${totalVods} Vods Archived`}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center", alignItems: "center" }}>
          <Box sx={{ width: isMobile ? "100%" : "50%" }}>
            <Search VODS_API_BASE={VODS_API_BASE} />
          </Box>
        </Box>
        {vods ? (
          <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
            {vods.map((vod, _) => (
              <Vod gridSize={2.1} key={vod.id} vod={vod} isMobile={isMobile} />
            ))}
          </Grid>
        ) : (
          <Loading />
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2, alignItems: "center", flexDirection: isMobile ? "column" : "row" }}>
        {totalPages !== null && (
          <>
            <Pagination
              shape="rounded"
              variant="outlined"
              count={totalPages}
              disabled={totalPages <= 1}
              color="primary"
              page={page}
              renderItem={(item) => <PaginationItem component={Link} to={`${location.pathname}${item.page === 1 ? "" : `?page=${item.page}`}`} {...item} />}
            />
            <TextField
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputProps={{
                startAdornment: <InputAdornment position="start">Page</InputAdornment>,
              }}
              sx={{
                width: "100px",
                m: 1,
              }}
              size="small"
              type="text"
              onKeyDown={handleSubmit}
            />
          </>
        )}
      </Box>
      <Footer />
    </SimpleBar>
  );
}
