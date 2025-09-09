'use client';

import { useState, useEffect } from 'react';

// Define the log entry type
interface LogEntry {
  id?: string;
  timestamp?: string;
  message?: string;
  type?: string;
  [key: string]: any; // Allow additional properties
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<string>('Connecting...');

  useEffect(() => {
    const eventSource = new EventSource('/api/callback');

    eventSource.onopen = function() {
      setStatus('Connected');
    };

    eventSource.onerror = function() {
      setStatus('Error');
    };

    eventSource.onmessage = function(event: MessageEvent) {
      try {
        const data: LogEntry = JSON.parse(event.data);
        if (data && data.type !== 'connection') {
          setLogs(function(prev: LogEntry[]) {
            return [data, ...prev];
          });
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    return function() {
      eventSource.close();
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Real-time Logs</h1>
        <span className={
          status === 'Connected' 
            ? 'px-2 py-1 rounded text-sm bg-green-100 text-green-800'
            : 'px-2 py-1 rounded text-sm bg-red-100 text-red-800'
        }>
          {status}
        </span>
      </div>
             
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.map(function(log: LogEntry, i: number) {
          const timestamp = log.timestamp || new Date().toISOString();
          const message = log.message || JSON.stringify(log);
                     
          return (
            <div key={log.id || i} className="p-3 border rounded bg-gray-50">
              <div className="text-sm text-gray-500">
                {new Date(timestamp).toLocaleTimeString()}
              </div>
              <div className="mt-1">
                {message}
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            Waiting for logs...
          </div>
        )}
      </div>
    </div>
  );
}