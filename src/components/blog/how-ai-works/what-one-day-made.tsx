import { Link } from 'react-router-dom'
import { TryIt } from '@/components/ai-series/try-it'
import { DAY_COUNTS, MADE_THINGS } from '@/lib/ai-series/making/made'

/** Chapter 10: every interactive part of the series, each linking back to its chapter. */
export function WhatOneDayMade() {
  return (
    <TryIt title="What one day made">
      <div className="space-y-4 text-base">
        <p>
          Everything in this series that you could tap or draw on. All of it was made that day. Tap
          one to go back to it.
        </p>
        <p className="font-bold">{MADE_THINGS.length} things to try.</p>
        <ul className="border-y">
          {MADE_THINGS.map((thing) => (
            <li key={`${thing.path}-${thing.title}`} className="border-b last:border-b-0">
              <Link
                to={thing.path}
                className="focus-visible:ring-ring hover:bg-muted flex min-h-12 items-center gap-3 px-1 py-1.5 focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{thing.title}</span>
                  <span className="text-muted-foreground block text-sm">
                    Chapter {thing.chapter}
                  </span>
                  <span className="sr-only">{thing.did}</span>
                </span>
                <span aria-hidden="true" className="text-muted-foreground text-2xl">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <h4 className="pt-2 text-lg font-semibold">Also that day</h4>
        <ul className="space-y-2">
          {DAY_COUNTS.map((item) => (
            <li key={item.what}>
              <span className="font-bold">{item.count}</span> {item.what}
            </li>
          ))}
        </ul>
      </div>
    </TryIt>
  )
}
