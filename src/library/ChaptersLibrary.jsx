import { useEffect, useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ClearIcon from '@mui/icons-material/Clear';
import SimpleBar from 'simplebar-react';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import { useLocation, useNavigate } from 'react-router-dom';
import { getChaptersLibrary } from './client';
import Chapter from './Chapter';
import PaginationControls from '../utils/PaginationControls';
import { useDebouncedSetter } from '../utils/debounceHelper';

const SORTS = ['Recently Played', 'Most Played', 'Game Name'];

export default function ChaptersLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [chapters, setChapters] = useState(null);
  const [totalChapters, setTotalChapters] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState(SORTS[0]);
  const apiSort = sort === 'Recently Played' ? 'recent' : sort === 'Game Name' ? 'chapter_name' : 'count';
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const page = parseInt(query.get('page') || '1', 10);
  const limit = isMobile ? 10 : 20;
  const nativeInputRef = useRef(null);

  const fetchChapters = async (term) => {
    setError(null);
    setLoading(true);
    setChapters(null);
    try {
      const params = { page, limit };
      if (term.length > 0) {
        params.chapter_name = term;
      }
      params.sort = apiSort;
      params.order = sort === 'Game Name' ? 'asc' : 'desc';
      const response = await getChaptersLibrary(params);
      setChapters(response.data);
      setTotalChapters(response.meta.total);
    } catch {
      setError('Failed to load Vod Library. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters(searchTerm);
  }, [page, limit, searchTerm, sort]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const changeSort = (evt) => {
    setSort(evt.target.value);
    navigate(`${location.pathname}?page=1`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (nativeInputRef.current) {
      nativeInputRef.current.value = '';
    }
  };

  const totalPages = Math.ceil(totalChapters / limit);

  return (
    <SimpleBar style={{ minHeight: 0, height: '100%' }}>
      <Box sx={{ px: 2, py: 1 }}>
        {error ? (
          <Typography variant="body1" color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        ) : (
          <>
            <Box
              sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexDirection: 'column', alignItems: 'center' }}
            >
              {totalChapters !== null && (
                <Typography variant="h4" color="primary" sx={{ textTransform: 'uppercase', fontWeight: '550' }}>
                  {`${totalChapters} Vod Library`}
                </Typography>
              )}
            </Box>
            <Box sx={{ maxWidth: 1100, margin: '0 auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, pb: 2 }}>
                <Box sx={{ width: 200 }}>
                  <TextField
                    label="Search by Game"
                    type="text"
                    onChange={(e) => handleSearch(e.target.value)}
                    slotProps={{
                      input: {
                        inputRef: nativeInputRef,
                        endAdornment: searchTerm && (
                          <IconButton onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        ),
                      },
                    }}
                  />
                </Box>
                <FormControl sx={{ mt: isMobile ? 1 : 0, minWidth: 120 }}>
                  <InputLabel id="sort-label">Sort</InputLabel>
                  <Select labelId="sort-label" label="Sort" value={sort} onChange={changeSort}>
                    {SORTS.map((data) => (
                      <MenuItem key={data} value={data}>
                        {data}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {loading ? <Loading /> : <></>}
              {chapters && chapters.length > 0 && (
                <Box
                  sx={{
                    mt: 0.5,
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
                    gap: 1.5,
                  }}
                >
                  {chapters.map((chapter) => (
                    <Chapter key={chapter.game_id} chapter={chapter} />
                  ))}
                </Box>
              )}
            </Box>
            <PaginationControls page={page} totalPages={totalPages} />
          </>
        )}
      </Box>
      <Footer />
    </SimpleBar>
  );
}
