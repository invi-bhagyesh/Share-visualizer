"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Layout from "../components/Layout"

// Dynamically import DeckGL to avoid SSR issues
const DeckGL = dynamic(() => import("@deck.gl/react").then((mod) => mod.default), {
  ssr: false,
})

const ScatterplotLayer = dynamic(() => import("@deck.gl/layers").then((mod) => mod.ScatterplotLayer), {
  ssr: false,
})

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 1,
  pitch: 0,
  bearing: 0,
}

export default function VisualizerPage() {
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch("/api/data")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled in the layer rendering, not by filtering data
  }

  const getPointColor = useCallback(
    (d) => {
      if (!searchQuery.trim()) {
        return [100, 150, 255, 180] // Light blue
      }

      const matches = d.full_text && d.full_text.toLowerCase().includes(searchQuery.toLowerCase())

      return matches
        ? [255, 100, 100, 200] // Red for matches
        : [100, 150, 255, 100] // Dimmed blue for non-matches
    },
    [searchQuery],
  )

  const layers = [
    new ScatterplotLayer({
      id: "conversations",
      data,
      getPosition: (d) => [d.x, d.y],
      getRadius: 0.02,
      getFillColor: getPointColor,
      pickable: true,
      onHover: (info) => {
        if (info.object) {
          setTooltip({
            x: info.x,
            y: info.y,
            text: info.object.full_text,
          })
        } else {
          setTooltip(null)
        }
      },
    }),
  ]

  const truncateText = (text, maxLength = 200) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  if (loading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-dark-muted">Loading visualization...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="relative h-screen">
        {/* Search overlay */}
        <div className="absolute top-4 left-4 z-10 bg-dark-surface border border-dark-border rounded-lg p-4 shadow-lg">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search to highlight..."
              className="input-field w-64"
            />
            <button type="submit" className="btn-primary">
              Highlight
            </button>
          </form>
          {searchQuery && <p className="text-sm text-dark-muted mt-2">Red dots match "{searchQuery}"</p>}
        </div>

        {/* Visualization */}
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          style={{ position: "relative", width: "100%", height: "100%" }}
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 bg-dark-surface border border-dark-border rounded-lg p-3 shadow-lg max-w-sm pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: tooltip.x > window.innerWidth - 300 ? "translateX(-100%)" : "none",
            }}
          >
            <p className="text-sm text-dark-text">{truncateText(tooltip.text)}</p>
          </div>
        )}

        {/* Info panel */}
        <div className="absolute bottom-4 right-4 bg-dark-surface border border-dark-border rounded-lg p-4 shadow-lg">
          <p className="text-sm text-dark-muted">{data.length} conversations visualized</p>
          <p className="text-xs text-dark-muted mt-1">Hover over dots to see conversation text</p>
        </div>
      </div>
    </Layout>
  )
}
