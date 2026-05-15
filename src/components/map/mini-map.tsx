"use client"

import { useEffect, useRef } from "react"

interface MiniMapProps {
  lat: number
  lng: number
  title: string
  status: string
}

const statusColors: Record<string, string> = {
  OPEN: "#dc2626",
  IN_PROGRESS: "#d97706",
  RESOLVED: "#16a34a",
}

export function MiniMap({ lat, lng, title, status }: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let cancelled = false

    async function init() {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      if (cancelled || !mapRef.current) return

      const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number }
      if (container._leaflet_id) delete container._leaflet_id

      const map = L.map(mapRef.current, { center: [lat, lng], zoom: 15, zoomControl: false })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

      const color = statusColors[status] ?? "#888"
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.6)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      L.marker([lat, lng], { icon }).bindPopup(title).addTo(map)
      mapInstance.current = map
    }

    void init()

    return () => {
      cancelled = true
      if (mapInstance.current) {
        ;(mapInstance.current as { remove: () => void }).remove()
        mapInstance.current = null
      }
    }
  }, [lat, lng, title, status])

  return <div ref={mapRef} className="h-full w-full min-h-64" />
}
