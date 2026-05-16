import { useState, useEffect, useRef } from 'react';
import { type VodData, type ChapterItem } from '../utils/archive-client';
import CustomLink from '../utils/CustomLink';
import { toHMS, toHHMMSS, getImage } from '../utils/helpers';

interface ChaptersProps {
  vod: VodData;
}

const EMPTY_CHAPTERS: ChapterItem[] = [];

export default function Chapters({ vod }: ChaptersProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    maxWidth?: number;
  }>({});

  const DEFAULT_VOD = vod?.vod_uploads.length > 0 ? `/youtube/${vod.id}` : `/manual/${vod.id}`;
  const [expanded, setExpanded] = useState(false);
  const chaptersArray = vod.chapters || EMPTY_CHAPTERS;
  const visibleChapters = expanded ? chaptersArray : chaptersArray.slice(0, 15);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorEl) {
      setExpanded(false);
      return;
    }

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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuMaxHeight = 400;
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < menuMaxHeight && rect.top > spaceBelow) {
        setCoords({
          bottom: window.innerHeight - rect.top + 8,
          left: rect.left,
          maxWidth: window.innerWidth - rect.left - 16,
        });
      } else {
        setCoords({
          top: rect.bottom + 8,
          left: rect.left,
          maxWidth: window.innerWidth - rect.left - 16,
        });
      }
      setAnchorEl(e.currentTarget);
    }
  };

  return (
    <div className="relative">
      <button onMouseDown={(e) => e.stopPropagation()} onClick={handleClick} className="block cursor-pointer">
        <img
          alt=""
          src={getImage(vod.chapters?.[0]?.image)}
          width={40}
          height={53}
          className="w-[40px] h-[53px] object-cover"
          loading="lazy"
          decoding="async"
        />
      </button>
      {anchorEl && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-dark-light border border-gray-700 rounded shadow-xl max-h-[400px] overflow-y-auto"
          style={{
            ...(coords.top !== undefined ? { top: coords.top } : {}),
            ...(coords.bottom !== undefined ? { bottom: coords.bottom } : {}),
            ...(coords.left !== undefined ? { left: coords.left } : {}),
            ...(coords.right !== undefined ? { right: coords.right } : {}),
            width: 'max-content',
            maxWidth: coords.maxWidth ? `min(350px, ${coords.maxWidth}px)` : 'min(350px, calc(100vw - 2rem))',
          }}
        >
          {visibleChapters.map((data) => (
            <CustomLink
              key={`${vod.id}${data?.game_id}${data?.start}`}
              href={`${DEFAULT_VOD}?t=${toHMS(data?.start as number)}`}
              onClick={handleClose}
              className="flex items-start px-3 py-2 hover:bg-dark-hover transition-colors border-b border-gray-800 last:border-0"
            >
              <div className="mr-2 shrink-0">
                <img
                  alt=""
                  src={getImage(data.image)}
                  width={40}
                  height={53}
                  className="w-[40px] h-[53px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-blue-500 text-sm whitespace-normal break-words leading-snug">{data.name}</span>
                {data.end !== undefined && data.duration !== undefined && (
                  <span className="text-gray-400 text-xs mt-0.5">{toHHMMSS(data.duration)}</span>
                )}
              </div>
            </CustomLink>
          ))}

          {!expanded && chaptersArray.length > 15 && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-center py-2 text-xs text-blue-400 font-semibold bg-dark hover:bg-dark-hover transition-colors cursor-pointer block"
            >
              {`Show ${chaptersArray.length - 15} More Chapters...`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
