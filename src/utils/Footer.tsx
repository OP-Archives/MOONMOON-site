const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const hash = (__GIT_HASH__ as string) || 'unknown';
  return (
    <footer className="flex flex-col justify-center items-center">
      <div className="mt-1">
        <span className="text-muted-dim text-xs">{`${import.meta.env.VITE_CHANNEL} © ${CURRENT_YEAR}`}</span>
      </div>
      <a
        href="https://twitter.com/overpowered"
        rel="noopener noreferrer"
        target="_blank"
        className="hover:opacity-50 transition-opacity flex items-center justify-center"
      >
        <span className="text-muted text-xs">made by OP with 💜</span>
      </a>
      <a
        href={`${import.meta.env.VITE_GITHUB}/commit/${hash}`}
        rel="noopener noreferrer"
        target="_blank"
        className="hover:opacity-50 transition-opacity flex items-center justify-center mb-1"
      >
        <span className="text-muted text-xs">{`Build Version: ${hash}`}</span>
      </a>
    </footer>
  );
}
