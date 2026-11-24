/**
 * Pages that are neither posts nor series, with the title each one shows in its tab. The pages
 * set the title themselves, and the build writes it into each page's HTML for a direct load.
 */
export const SITE_PAGES = {
  blog: { path: '/blog', title: 'Blog' },
  projects: { path: '/projects', title: 'Projects' },
  about: { path: '/about', title: 'About' },
  chordLibrary: { path: '/projects/guitar/chord-library', title: 'Chord Library' },
  skiArt: { path: '/projects/minimalist-ski-art', title: 'Minimalist Ski Art' },
  lickLibrary: { path: '/projects/guitar/lick-library', title: 'Lick Library' },
} as const satisfies Record<string, { path: string; title: string }>
