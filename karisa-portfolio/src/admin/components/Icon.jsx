import React from 'react';

/** Every admin glyph, inline, stroked in currentColor. No emoji, no icon font. */
const PATHS = {
  overview: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  inbox: 'M4 13V6a1 1 0 011-1h14a1 1 0 011 1v7M4 13h4l2 3h4l2-3h4M4 13v5a1 1 0 001 1h14a1 1 0 001-1v-5',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 01-.1 1.2l2 1.5-2 3.4-2.3-.9a7 7 0 01-2 1.2l-.4 2.5H9.8l-.4-2.5a7 7 0 01-2-1.2l-2.3.9-2-3.4 2-1.5A7 7 0 015 12a7 7 0 01.1-1.2l-2-1.5 2-3.4 2.3.9a7 7 0 012-1.2l.4-2.5h4.4l.4 2.5a7 7 0 012 1.2l2.3-.9 2 3.4-2 1.5A7 7 0 0119 12z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  signout: 'M15 17l5-5-5-5M20 12H9M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4',
  back: 'M11 19l-7-7 7-7M4 12h16',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  paperclip: 'M21 11.5l-9 9a5.5 5.5 0 01-7.8-7.8l9-9a3.5 3.5 0 015 5l-9 9a1.5 1.5 0 01-2.1-2.1l8.3-8.3',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3',
  check: 'M5 12l5 5L20 7',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  archive: 'M4 4h16v4H4zM6 8v12h12V8M10 12h4',
  tag: 'M20 12l-8 8-9-9V3h8l9 9zM7 7h.01',
  refresh: 'M20 12a8 8 0 01-14.5 4.6M4 12a8 8 0 0114.5-4.6M4 4v5h5M20 20v-5h-5',
};

export default function Icon({ name, className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
