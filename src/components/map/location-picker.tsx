"use client"

import { useEffect, useRef } from "react"

interface LocationPickerProps {
  lat: number
  lng: number
  onSelect: (lat: number, lng: number) => void
}

export function LocationPicker({ lat, lng, onSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    async function init() {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      const map = L.map(mapRef.current!, { center: [lat || -3.7172, lng || -38.5433], zoom: 13 })
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
      }

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat: newLat, lng: newLng } = e.latlng
        if (markerRef.current) {
          ;(markerRef.current as { setLatLng: (latlng: [number, number]) => void }).setLatLng([newLat, newLng])
        } else {
          markerRef.current = L.marker([newLat, newLng], { icon }).addTo(map)
        }
        onSelect(newLat, newLng)
      })

      mapInstance.current = map
    }

    void init()

    return () => {
      if (mapInstance.current) {
        ;(mapInstance.current as { remove: () => void }).remove()
        mapInstance.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={mapRef} className="h-full w-full" />
}
