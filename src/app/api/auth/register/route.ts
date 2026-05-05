import { NextRequest, NextResponse } from 'next/server'
import { FITMARK_BASE_URL, endpoints } from '@/lib/api/endpoints'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const upstream = await fetch(`${FITMARK_BASE_URL}${endpoints.register}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(
      { message: data.message || 'Erro ao registrar' },
      { status: upstream.status },
    )
  }

  return NextResponse.json(data)
}
