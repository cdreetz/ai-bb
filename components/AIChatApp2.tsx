'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AIChatApp2() {
  const [sessionData, setSessionData] = useState<{ lastSessionId: string | null, allSessions: any[] | null }>({
    lastSessionId: null,
    allSessions: null
  })
  const [error, setError] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<any | null>(null)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch('/api/session')
        if (!response.ok) {
          throw new Error('Failed to fetch session data')
        }
        const data = await response.json()
        setSessionData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    fetchSessionData()
  }, [])

  const runningSessions = sessionData.allSessions?.filter(session => session.status === 'RUNNING') || []

  const handleSessionClick = async (session: any) => {
    setSelectedSession(session)
    try {
      const response = await fetch(`/api/get-session?id=${session.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch session details')
      }
      const data = await response.json()
      setSelectedSessionDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching session details')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 p-4">
      <Card className="w-1/2 h-full flex flex-col mr-4">
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Currently Running Sessions:</h2>
                {runningSessions.length > 0 ? (
                  <ul className="space-y-2">
                    {runningSessions.map((session: any, index: number) => (
                      <li key={index} className="bg-green-100 p-2 rounded shadow cursor-pointer hover:bg-green-200" onClick={() => handleSessionClick(session)}>
                        <span className="font-medium">ID:</span> {session.id}, <span className="font-medium">Status:</span> {session.status}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No running sessions found</p>
                )}
              </div>
              <div className="h-full">
                <h2 className="text-lg font-semibold mb-2">All Sessions:</h2>
                <ScrollArea className="h-full pr-4">
                  {sessionData.allSessions ? (
                    <ul className="space-y-2">
                      {sessionData.allSessions.map((session: any, index: number) => (
                        <li key={index} className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-100" onClick={() => handleSessionClick(session)}>
                          <span className="font-medium">ID:</span> {session.id}, <span className="font-medium">Status:</span> {session.status}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No sessions data available</p>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="w-1/2 h-full flex flex-col">
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {selectedSessionDetails ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(selectedSessionDetails, null, 2)}</pre>
            ) : (
              <p>Select a session to view details</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
