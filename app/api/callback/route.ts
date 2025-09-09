import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for callbacks (use database in production)
let callbacks: any[] = []

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    
    // Log the callback data (like your Express.js example)
    console.log('Callback received:', body)
    
    // Store the callback with timestamp
    const callback = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data: body
    }
    
    // Add to callbacks array (keep last 50)
    callbacks.unshift(callback)
    if (callbacks.length > 50) {
      callbacks = callbacks.slice(0, 50)
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Callback received successfully',
      receivedAt: callback.timestamp
    })
    
  } catch (error) {
    console.error('Error processing callback:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process callback' 
    }, { 
      status: 400 
    })
  }
}

// GET endpoint to retrieve all callbacks (for debugging)
export async function GET() {
  return NextResponse.json({ 
    callbacks: callbacks,
    count: callbacks.length,
    message: 'All callbacks retrieved'
  })
}

// DELETE endpoint to clear all callbacks
export async function DELETE() {
  const clearedCount = callbacks.length
  callbacks = []
  
  console.log(`Cleared ${clearedCount} callbacks`)
  
  return NextResponse.json({ 
    success: true, 
    message: `Cleared ${clearedCount} callbacks`,
    clearedCount: clearedCount
  })
}