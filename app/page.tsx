'use client'

import { useState, useEffect } from 'react'

interface CallbackData {
  id: string
  timestamp: string
  data: any
  section: string
}

export default function Home() {
  const [sections, setSections] = useState([
    { id: 1, functionUrl: '', projectId: '', target: '', callbackUrl: '' },
    { id: 2, functionUrl: '', projectId: '', target: '', callbackUrl: '' },
    { id: 3, functionUrl: '', projectId: '', target: '', callbackUrl: '' },
    { id: 4, functionUrl: '', projectId: '', target: '', callbackUrl: '' }
  ])
  
  const [loading, setLoading] = useState<{[key: number]: boolean}>({})
  const [responses, setResponses] = useState<{[key: number]: any}>({})
  const [callbacks, setCallbacks] = useState<CallbackData[]>([])

  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    setSections(prev => prev.map(s => ({
      ...s,
      callbackUrl: s.callbackUrl || `${baseUrl}/api/callback`
    })))
  }, [])

  const updateSection = (id: number, field: string, value: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const trigger = async (id: number) => {
    const section = sections.find(s => s.id === id)
    if (!section?.functionUrl || !section?.target || !section?.projectId) {
      alert('Fill all required fields')
      return
    }

    setLoading(prev => ({ ...prev, [id]: true }))

    try {
      const payload = {
        url: section.functionUrl,
        projectId: section.projectId,
        target: section.target,
        callbackUrl: section.callbackUrl
      }

      const res = await fetch(section.functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      setResponses(prev => ({
        ...prev,
        [id]: { status: res.status, data, timestamp: new Date().toISOString() }
      }))
    } catch (error) {
      setResponses(prev => ({
        ...prev,
        [id]: { status: 'error', data: { error: String(error) }, timestamp: new Date().toISOString() }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  // Poll callbacks
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/callback')
        if (res.ok) {
          const data = await res.json()
          setCallbacks(data.callbacks || [])
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0']

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        Azure Function Tester
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {sections.map((section, index) => (
          <div key={section.id} style={{ 
            backgroundColor: colors[index], 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Section {section.id}</h3>
            
            <input
              placeholder="Function URL"
              value={section.functionUrl}
              onChange={(e) => updateSection(section.id, 'functionUrl', e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            
            <input
              placeholder="Project ID"
              value={section.projectId}
              onChange={(e) => updateSection(section.id, 'projectId', e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            
            <input
              placeholder="Target URL"
              value={section.target}
              onChange={(e) => updateSection(section.id, 'target', e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            
            <input
              placeholder="Callback URL"
              value={section.callbackUrl}
              onChange={(e) => updateSection(section.id, 'callbackUrl', e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            
            <button
              onClick={() => trigger(section.id)}
              disabled={loading[section.id]}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading[section.id] ? '#ccc' : '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading[section.id] ? 'not-allowed' : 'pointer',
                marginBottom: '15px'
              }}
            >
              {loading[section.id] ? 'Loading...' : `Trigger ${section.id}`}
            </button>

            {responses[section.id] && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <strong>Status:</strong> {responses[section.id].status}<br/>
                <strong>Time:</strong> {new Date(responses[section.id].timestamp).toLocaleTimeString()}<br/>
                <pre style={{ marginTop: '5px', overflow: 'auto' }}>
                  {JSON.stringify(responses[section.id].data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Callbacks */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>
          Callbacks ({callbacks.length})
        </h2>
        <button
          onClick={() => setCallbacks([])}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '15px'
          }}
        >
          Clear
        </button>
        
        {callbacks.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666', backgroundColor: '#f9f9f9' }}>
            No callbacks yet
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {callbacks.map((cb) => (
              <div key={cb.id} style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <strong>{new Date(cb.timestamp).toLocaleTimeString()}</strong>
                <pre style={{ marginTop: '5px', overflow: 'auto' }}>
                  {JSON.stringify(cb.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}