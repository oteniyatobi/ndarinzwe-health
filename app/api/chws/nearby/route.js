import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = await createClient()

  // Require authentication — CHW location data must not be public
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat'))
  const lng = parseFloat(searchParams.get('lng'))
  // Cap radius at 50km — prevents full-country enumeration
  const radius = Math.min(parseFloat(searchParams.get('radius') || '10'), 50)

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  // Validate coordinate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('find_nearby_chws', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radius,
  })

  // Never expose raw DB error messages to the client
  if (error) return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  return NextResponse.json({ chws: data || [] })
}
