'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Send, User } from 'lucide-react'

type LogEntry = {
  type: 'tool' | 'error'
  content: string
}

export function AiChatApp() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onResponse: (response) => {
      // This is where we'd typically handle tool calls
      // For demonstration, we'll add a mock tool call log entry
      setLogEntries(prev => [...prev, { type: 'tool', content: 'Mock tool call: getWeather' }])
    },
    onError: (error) => {
      setLogEntries(prev => [...prev, { type: 'error', content: error.message }])
    }
  })

  return (
    <div className="flex h-screen bg-gray-100 p-4 gap-4">
      <Card className="w-1/2 flex flex-col">
        <CardHeader>
          <CardTitle>AI Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow mb-4 pr-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`flex items-center ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.role === 'user' ? (
                    <User className="h-8 w-8 rounded-full bg-blue-500 p-2 text-white" />
                  ) : (
                    <Bot className="h-8 w-8 rounded-full bg-green-500 p-2 text-white" />
                  )}
                  <div className={`mx-2 p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex items-center">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="flex-grow mr-2"
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="w-1/2 flex flex-col">
        <CardHeader>
          <CardTitle>Tool Calling Log</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <ScrollArea className="h-full pr-4">
            {logEntries.map((entry, index) => (
              <div key={index} className={`mb-2 p-2 rounded ${entry.type === 'tool' ? 'bg-blue-100' : 'bg-red-100'}`}>
                <span className="font-semibold">{entry.type === 'tool' ? 'Tool Call:' : 'Error:'}</span> {entry.content}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}