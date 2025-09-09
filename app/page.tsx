'use client'
import { useState } from 'react'

interface LogEntry {
  timestamp: string
  request: any
  response: any
  status: 'loading' | 'success' | 'error'
  error?: string
}

export default function Home() {
  const [functionUrl, setFunctionUrl] = useState('')
  const [projectId, setProjectId] = useState('project' + Date.now())
  const [target, setTarget] = useState('https://excalidraw.com/')
  const [callbackUrl, setCallbackUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const sendRequest = async () => {
    setLoading(true)
    
    const payload = {
      url: "https://crawl1-b3emf3dbccepdgb7.eastus-01.azurewebsites.net/crawl",
      projectId,
      target,
      callbackUrl
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toLocaleString(),
      request: payload,
      response: null,
      status: 'loading'
    }

    setLogs(prev => [logEntry, ...prev])

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      logEntry.response = data
      logEntry.status = response.ok ? 'success' : 'error'
      
      if (!response.ok) {
        logEntry.error = `${response.status}: ${response.statusText}`
      }

    } catch (error: any) {
      logEntry.response = null
      logEntry.status = 'error'
      logEntry.error = error.message
    }

    setLogs(prev => [logEntry, ...prev.slice(1)])
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Azure Function Tester</h1>
      
      {/* Form */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Function URL:</label><br/>
          <input 
            type="text" 
            value={functionUrl}
            onChange={(e) => setFunctionUrl(e.target.value)}
            placeholder="https://your-function.azurewebsites.net/api/your-function"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Project ID:</label><br/>
          <input 
            type="text" 
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Target URL:</label><br/>
          <input 
            type="text" 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Callback URL (optional):</label><br/>
          <input 
            type="text" 
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          onClick={sendRequest} 
          disabled={loading || !functionUrl}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>

        <button 
          onClick={() => setLogs([])}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#666', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
      </div>

      {/* Logs */}
      <div>
        <h2>Logs ({logs.length})</h2>
        {logs.length === 0 ? (
          <p>No requests sent yet.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: log.status === 'error' ? '#ffe6e6' : log.status === 'success' ? '#e6ffe6' : '#f0f0f0'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>
                  {log.status === 'loading' && '⏳'} 
                  {log.status === 'success' && '✅'} 
                  {log.status === 'error' && '❌'} 
                  {log.timestamp} - {log.request.projectId}
                </strong>
              </div>

              {log.error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                  <strong>Error:</strong> {log.error}
                </div>
              )}

              <details>
                <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                  View Request/Response
                </summary>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Request:</strong>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    overflow: 'auto',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(log.request, null, 2)}
                  </pre>
                </div>

                {log.response && (
                  <div>
                    <strong>Response:</strong>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '10px', 
                      borderRadius: '4px', 
                      overflow: 'auto',
                      fontSize: '12px'
                    }}>
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                )}
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  )
}