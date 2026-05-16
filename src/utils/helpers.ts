export const toHMS = (secs: number | string) => {
  const sec_num = parseInt(String(secs), 10);
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor(sec_num / 60) % 60;
  const seconds = sec_num % 60;
  return `${hours}h${minutes}m${seconds}s`;
};

export const toHHMMSS = (secs: number | string) => {
  const s = parseInt(String(secs), 10);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mStr = m < 10 ? `0${m}` : m;
  const sStr = sec < 10 ? `0${sec}` : sec;
  return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
};

export const getImage = (link: string | undefined, width = 40, height = 53) => {
  if (!link) return 'https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg';
  return link.replace('{width}x{height}', `${width}x${height}`);
};
