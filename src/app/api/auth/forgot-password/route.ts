import { NextRequest, NextResponse } from 'next/server'
import { FITMARK_BASE_URL, endpoints } from '@/lib/api/endpoints'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const upstream = await fetch(`${FITMARK_BASE_URL}${endpoints.forgotPassword}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await upstream.json().catch(() => ({}))
  return NextResponse.json(data, { status: upstream.status })
}
