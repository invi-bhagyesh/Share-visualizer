"use client"

import Link from "next/link"
import { useRouter } from "next/router"

export default function Layout({ children }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-blue-400">
                WILDVIS Explorer
              </Link>
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === "/"
                      ? "bg-blue-600 text-white"
                      : "text-dark-muted hover:text-dark-text hover:bg-dark-bg"
                  }`}
                >
                  Search
                </Link>
                <Link
                  href="/visualizer"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === "/visualizer"
                      ? "bg-blue-600 text-white"
                      : "text-dark-muted hover:text-dark-text hover:bg-dark-bg"
                  }`}
                >
                  Visualizer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
