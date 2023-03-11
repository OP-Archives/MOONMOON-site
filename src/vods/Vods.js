import React, { useEffect } from "react";
import { Box, Pagination, Grid, useMediaQuery, Typography } from "@mui/material";
import SimpleBar from "simplebar-react";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import Vod from "./Vod";
import Search from "./Search";

export default function Vods(props) {
  const { VODS_API_BASE, channel } = props;
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [vods, setVods] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(null);
  const [totalVods, setTotalVods] = React.useState(null);
  const limit = isMobile ? 10 : 20;

  useEffect(() => {
    document.title = `VODS - ${channel}`;
    const fetchVods = async () => {
      await fetch(`${VODS_API_BASE}/vods?$limit=${limit}&$sort[createdAt]=-1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setPage(1);
          setVods(response.data);
          setTotalVods(response.total);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [VODS_API_BASE, channel, limit]);

  const handlePageChange = (_, value) => {
    if (page === value) return;
    setLoading(true);
    setPage(value);

    fetch(`${VODS_API_BASE}/vods?$limit=${limit}&$skip=${(value - 1) * limit}&$sort[createdAt]=-1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.data.length === 0) return;
        setVods(response.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  if (loading) return <Loading />;

  const totalPages = Math.ceil(totalVods / limit);

  return (
    <SimpleBar style={{ minHeight: 0, height: "100%" }}>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h4" color="primary" sx={{ textTransform: "uppercase", fontWeight: "550" }}>
            {`${totalVods} Vods Archived`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center", alignItems: "center" }}>
          <Box sx={{ width: isMobile ? "100%" : "50%" }}>
            <Search VODS_API_BASE={VODS_API_BASE} />
          </Box>
        </Box>
        <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
          {vods.map((vod, _) => (
            <Vod gridSize={2.1} key={vod.id} vod={vod} isMobile={isMobile} />
          ))}
        </Grid>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
        {totalPages !== null && <Pagination count={totalPages} disabled={totalPages <= 1} color="primary" page={page} onChange={handlePageChange} />}
      </Box>
      <Footer />
    </SimpleBar>
  );
}
