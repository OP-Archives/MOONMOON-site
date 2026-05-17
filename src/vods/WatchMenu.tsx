import Film from 'lucide-react/dist/esm/icons/film.mjs';
import Play from 'lucide-react/dist/esm/icons/play.mjs';
import { useState, useEffect, useRef } from 'react';
import { YouTubeIcon } from '../assets/icons';
import { type VodData } from '../utils/archive-client';
import CustomLink from '../utils/CustomLink';

interface WatchMenuProps {
  vod: VodData;
}

const prefetchPlayerChunk = () => {
  import('@op-archives/vod-components').catch(() => {});
};

export default function WatchMenu({ vod }: WatchMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorEl) return;

    const handleOutsideInteraction = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        setAnchorEl(null);
        return;
      }

      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }

      if (e.type !== 'keydown') {
        setAnchorEl(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('wheel', handleOutsideInteraction, { capture: true, passive: true });
    document.addEventListener('touchmove', handleOutsideInteraction, { capture: true, passive: true });
    document.addEventListener('keydown', handleOutsideInteraction);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('wheel', handleOutsideInteraction, { capture: true });
      document.removeEventListener('touchmove', handleOutsideInteraction, { capture: true });
      document.removeEventListener('keydown', handleOutsideInteraction);
    };
  }, [anchorEl]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
      });
      setAnchorEl(event.currentTarget);
    }
  };

  return (
    <>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleClick}
        onMouseEnter={prefetchPlayerChunk}
        className="border border-primary text-primary font-semibold flex items-center gap-1 px-3 py-1 rounded hover:bg-primary/10 transition-colors cursor-pointer"
      >
        <Play size={16} /> Watch
      </button>
      {anchorEl && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-dark-light border border-border rounded shadow-xl w-max"
          style={{ left: coords.left, top: coords.top }}
        >
          <div className="p-1">
            <CustomLink
              href={`/youtube/${vod.id}`}
              onClick={() => setAnchorEl(null)}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded hover:bg-dark-hover transition-colors text-white ${vod.vod_uploads.length === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <YouTubeIcon size={20} /> Youtube
            </CustomLink>
            <CustomLink
              href={`/manual/${vod.id}`}
              onClick={() => setAnchorEl(null)}
              className="flex items-center gap-2 px-3 py-2 w-full text-left rounded hover:bg-dark-hover transition-colors text-white"
            >
              <Film size={20} /> Manual
            </CustomLink>
            {vod.games.length !== 0 && (
              <CustomLink
                href={`/games/${vod.id}`}
                onClick={() => setAnchorEl(null)}
                className="flex items-center gap-2 px-3 py-2 w-full text-left rounded hover:bg-dark-hover transition-colors text-white"
              >
                <YouTubeIcon className="w-5 h-5" /> Youtube (Only Games)
              </CustomLink>
            )}
          </div>
        </div>
      )}
    </>
  );
}
