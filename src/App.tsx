import type { ComponentType, ReactNode } from 'react'
import {
  Navigate,
  Outlet,
  ScrollRestoration,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router-dom'
import { NavBar } from '@/components/layout/nav-bar'
import { Footer } from '@/components/layout/footer'
import { NavigationProgress } from '@/components/layout/navigation-progress'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getPostBySlug } from '@/lib/blog'
import HomePage from '@/pages/home-page'
import NotFound from '@/pages/not-found'

function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

/**
 * Every page sits inside this layout. ScrollRestoration opens a new page at its top and returns
 * Back and Forward to where the reader was.
 */
function RootLayout() {
  return (
    <>
      <NavigationProgress />
      <ScrollRestoration />
      <SiteShell>
        <Outlet />
      </SiteShell>
    </>
  )
}

/** Shown on the first visit while the opening page's code downloads; there is no page to keep. */
function FirstLoad() {
  return (
    <SiteShell>
      <PagePlaceholder className="mx-auto max-w-4xl px-4 pt-6 md:pt-10" />
    </SiteShell>
  )
}

/**
 * Loads a page's code before the navigation to it completes, so the page being left stays on
 * screen until the new one can be shown whole.
 */
function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

/**
 * Waits for the post's own code as well, so the post arrives in one step. Never fails: a missing
 * post renders the not-found page, and a failed download leaves the page to try again itself.
 */
async function loadPostCode({ params }: LoaderFunctionArgs): Promise<null> {
  await (params.slug ? getPostBySlug(params.slug) : undefined)?.preload()
  return null
}

export const routes: RouteObject[] = [
  {
    Component: RootLayout,
    HydrateFallback: FirstLoad,
    children: [
      { index: true, Component: HomePage },
      { path: 'about', lazy: page(() => import('@/pages/about-page')) },
      { path: 'projects', lazy: page(() => import('@/pages/projects-page')) },
      {
        path: 'projects/guitar/chord-library',
        lazy: page(() => import('@/components/guitar/chord-library-page')),
      },
      {
        path: 'projects/minimalist-ski-art',
        lazy: page(() => import('@/components/ski-art/ski-art-page')),
      },
      {
        path: 'projects/guitar/lick-library',
        lazy: page(() => import('@/components/licks/lick-library-page')),
      },
      { path: 'blog', lazy: page(() => import('@/pages/blog-index')) },
      {
        path: 'blog/:slug',
        loader: loadPostCode,
        lazy: page(() => import('@/pages/blog-post')),
      },
      { path: 'series/:slug', lazy: page(() => import('@/pages/series-page')) },
      { path: 'index.html', element: <Navigate to="/" replace /> },
      { path: '*', Component: NotFound },
    ],
  },
]
