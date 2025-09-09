import { NextRequest, NextResponse } from 'next/server'

let callbacks: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const callback = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data: body,
      section: 'callback'
    }
    
    callbacks.unshift(callback)
    if (callbacks.length > 20) callbacks = callbacks.slice(0, 20)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorCallback = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data: { error: String(error) },
      section: 'error'
    }
    
    callbacks.unshift(errorCallback)
    if (callbacks.length > 20) callbacks = callbacks.slice(0, 20)
    
    return NextResponse.json({ success: false }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ callbacks })
}

export async function DELETE() {
  callbacks = []
  return NextResponse.json({ success: true })
}