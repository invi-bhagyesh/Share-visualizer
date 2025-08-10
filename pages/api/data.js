import fs from "fs"
import path from "path"
import Papa from "papaparse"

export default function handler(req, res) {
  try {
    const csvPath = path.join(process.cwd(), "public", "sharelm_data.csv")

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        error: "Data file not found. Please run the prepare_data.py script first.",
      })
    }

    const csvData = fs.readFileSync(csvPath, "utf8")
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        if (field === "x" || field === "y") {
          return Number.parseFloat(value)
        }
        return value
      },
    })

    let data = parsed.data

    // Filter by search query if provided
    const { search } = req.query
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase()
      data = data.filter((row) => row.full_text && row.full_text.toLowerCase().includes(searchTerm))
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error reading data:", error)
    res.status(500).json({ error: "Failed to load data" })
  }
}
