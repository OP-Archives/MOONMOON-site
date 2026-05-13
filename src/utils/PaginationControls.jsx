import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function PaginationControls({ page, totalPages, preserveParams }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const pageInputRef = useRef(null);

  useEffect(() => {
    if (pageInputRef.current) {
      pageInputRef.current.value = String(page);
    }
  }, [page]);

  const buildPageUrl = (pageNum) => {
    const params = new URLSearchParams();
    if (pageNum !== 1) params.set('page', pageNum);
    if (preserveParams) Object.entries(preserveParams).forEach(([k, v]) => params.set(k, v));
    return `${location.pathname}${params.toString() ? `?${params}` : ''}`;
  };

  const handleSubmit = (e) => {
    const value = pageInputRef.current?.value;
    if (e.which === 13 && !isNaN(value) && value > 0) {
      navigate(buildPageUrl(value));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 1,
        mb: 1,
        alignItems: 'center',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {totalPages !== null && totalPages > 0 && (
        <>
          <Pagination
            shape="rounded"
            variant="outlined"
            count={totalPages}
            disabled={totalPages <= 1}
            color="primary"
            page={page}
            renderItem={(item) => <PaginationItem component={Link} to={buildPageUrl(item.page)} {...item} />}
          />
          <TextField
            sx={{ width: '100px', m: 1 }}
            size="small"
            type="text"
            defaultValue={page}
            inputRef={pageInputRef}
            onKeyDown={handleSubmit}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">Page</InputAdornment>,
                htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' },
              },
            }}
          />
        </>
      )}
    </Box>
  );
}
