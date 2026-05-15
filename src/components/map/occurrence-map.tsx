"use client"

import { useEffect, useRef, useState } from "react"
import type { OccurrenceListItem } from "@/types"
import { categoryLabels, formatDate } from "@/lib/utils"

interface OccurrenceMapProps {
  occurrences: OccurrenceListItem[]
}

const statusColors: Record<string, string> = {
  OPEN: "#dc2626",
  IN_PROGRESS: "#d97706",
  RESOLVED: "#16a34a",
}

type LeafletLib = typeof import("leaflet")
type LayerGroup = import("leaflet").LayerGroup

export function OccurrenceMap({ occurrences }: OccurrenceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import("leaflet").Map | null>(null)
  const layerGroupRef = useRef<LayerGroup | null>(null)
  const LRef = useRef<LeafletLib | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current) return

    let cancelled = false

    async function init() {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      if (cancelled || !mapRef.current) return

      const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number }
      if (container._leaflet_id) delete container._leaflet_id

      const map = L.map(mapRef.current, {
        center: [-3.7172, -38.5433],
        zoom: 12,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      LRef.current = L
      mapInstance.current = map
      layerGroupRef.current = L.layerGroup().addTo(map)

      if (!cancelled) setMapReady(true)
    }

    void init()

    return () => {
      cancelled = true
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
        layerGroupRef.current = null
        LRef.current = null
        setMapReady(false)
      }
    }
  }, [])

  // Update markers only — map stays alive
  useEffect(() => {
    const L = LRef.current
    const group = layerGroupRef.current
    if (!mapReady || !L || !group) return

    group.clearLayers()

    occurrences.forEach((occ) => {
      const color = statusColors[occ.status] ?? "#888"
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      const popup = L.popup({ maxWidth: 280 }).setContent(`
        <div style="font-family:system-ui;padding:14px 16px;min-width:200px">
          <p style="font-weight:600;margin:0 0 4px;color:#e8e8e8;font-size:13px">${occ.title}</p>
          <p style="color:#888;margin:0 0 2px;font-size:12px">${categoryLabels[occ.category] ?? occ.category}</p>
          <p style="color:#888;margin:0 0 8px;font-size:12px">${formatDate(occ.createdAt)}</p>
          <a href="/dashboard/occurrences/${occ.id}" style="color:#2563eb;text-decoration:none;font-size:12px">Ver detalhes →</a>
        </div>
      `)

      L.marker([occ.latitude, occ.longitude], { icon }).bindPopup(popup).addTo(group)
    })
  }, [mapReady, occurrences])

  return <div ref={mapRef} className="h-full w-full" />
}
