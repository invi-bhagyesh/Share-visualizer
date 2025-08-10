"use client"

import { useState } from "react"
import Layout from "../components/Layout"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/data?search=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const truncateText = (text, maxLength = 300) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Search Conversations</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search terms..."
              className="input-field flex-1"
            />
            <button type="submit" disabled={loading || !searchQuery.trim()} className="btn-primary">
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-dark-muted">Searching conversations...</p>
          </div>
        )}

        {hasSearched && !loading && (
          <div className="mb-4">
            <p className="text-dark-muted">
              Found {results.length} conversation{results.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((conversation, index) => (
            <div key={conversation.conversation_id || index} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-blue-400">ID: {conversation.conversation_id}</h3>
              </div>
              <p className="text-dark-text leading-relaxed">{truncateText(conversation.full_text)}</p>
            </div>
          ))}
        </div>

        {hasSearched && !loading && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-dark-muted">No conversations found matching your search.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
