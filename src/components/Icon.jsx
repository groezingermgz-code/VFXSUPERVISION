import React from 'react';

const paths = {
  home: (
    <>
      <path d="M3 10l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14" />
      <path d="M3 9h4M3 13h4M17 9h4M17 13h4" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <path d="M7 7l2-3h6l2 3" />
    </>
  ),
  notes: (
    <>
      <path d="M7 3h8l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M9 12h8M9 16h8M9 8h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.07-.99l2.02-1.57-2-3.46-2.44.73a7.04 7.04 0 0 0-1.72-1l-.36-2.52h-4l-.36 2.52c-.62.25-1.2.58-1.72 1l-2.44-.73-2 3.46 2.02 1.57c-.05.33-.07.66-.07.99s.02.66.07.99L2.91 14.56l2 3.46 2.44-.73c.52.42 1.1.75 1.72 1l.36 2.52h4l.36-2.52c.62-.25 1.2-.58 1.72-1l2.44.73 2-3.46-2.02-1.57c.05-.33.07-.66.07-.99z" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6v-2h8v2" />
      <rect x="6" y="6" width="12" height="14" rx="2" />
      <path d="M10 10v6M14 10v6" />
    </>
  ),
  chevronDown: (
    <>
      <polyline points="6 9 12 15 18 9" />
    </>
  ),
  chevronRight: (
    <>
      <polyline points="9 6 15 12 9 18" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 10v6" />
      <circle cx="12" cy="7.5" r="1" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </>
  ),
  zap: (
    <>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </>
  ),
  angle: (
    <>
      <line x1="4" y1="20" x2="20" y2="20" />
      <line x1="4" y1="20" x2="16" y2="8" />
      <path d="M10 20 A6 6 0 0 1 8.3 15.7" />
    </>
  ),
  message: (
    <>
      <circle cx="12" cy="11" r="7" />
      <polyline points="14.5 17.5 16 22 12 19" />
    </>
  ),
  key: (
    <>
      <circle cx="7" cy="12" r="3" />
      <path d="M10 12h9" />
      <path d="M19 12v2" />
      <path d="M17 12v2" />
    </>
  ),
  lens: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="9" cy="9" r="1.5" />
    </>
  ),
  telescope: (
    <>
      <circle cx="18" cy="6" r="2" />
      <line x1="3" y1="11" x2="16" y2="6" />
    </>
  ),
};

const Icon = ({ name, size = 20, strokeWidth = 1.8, className = '' }) => {
  const content = paths[name];
  if (!content) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {content}
    </svg>
  );
};

export default Icon;