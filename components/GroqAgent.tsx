'use client'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChat } from "ai/react"
import { useState } from "react"

function AgentChat() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmit(event);
        }
    }
    return (
    <div className="w-1/2 flex flex-col">
        <ScrollArea className="flex-1 border rounded-md p-4 mb-4">
            {messages.map((message, index) => (
                <div key={index} className="flex flex-col mb-4">
                    <span className="font-bold">{message.role === "user" ? "You" : "Groq Agent"}</span>
                    <p>{message.content}</p>
                </div>
            ))}
        </ScrollArea>
        <Input 
            placeholder="Type your message here..." 
            value={input} 
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
        />
        <Button onClick={handleSubmit}>Send</Button>
    </div>
    )
}


export default function GroqAgent() {
    const [url, setUrl] = useState("")
    const [scrapedContent, setScrapedContent] = useState<string[]>([])
    const [logs, setLogs] = useState<string[]>([])

    const handleUrlSubmit = async () => {
        try {
            setLogs(["Starting URL scrape..."])
            setScrapedContent([]) // Reset scraped content
            const response = await fetch("/api/scrape", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ urls: [url] })
            })
            const data = await response.json()
            if (data.success) {
                setScrapedContent(data.data)
                setLogs(prevLogs => [...prevLogs, ...data.logs, "Scrape completed successfully"])
            } else {
                setScrapedContent(["Error: " + data.error])
                setLogs(prevLogs => [...prevLogs, ...data.logs, "Scrape failed"])
            }
        } catch (error) {
            setScrapedContent(["Error: " + (error instanceof Error ? error.message : String(error))])
            setLogs(prevLogs => [...prevLogs, "An error occurred during scraping"])
        }
    }

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-4">Groq Agent</h1>
            <div className="flex flex-1 space-x-4">
                <AgentChat />
                <div className="w-1/2 flex flex-col">
                    <ScrollArea className="flex-1 border rounded-md p-4 mb-4">
                        <div className="mb-4">
                            <h3 className="font-bold">Logs:</h3>
                            {logs.map((log, index) => (
                                <div key={index} className="text-sm text-gray-600 mb-1">{log}</div>
                            ))}
                        </div>
                        <div>
                            <h3 className="font-bold">Scraped Content:</h3>
                            {scrapedContent.length === 0 ? (
                                <p>No content scraped yet. Enter a URL below to scrape.</p>
                            ) : (
                                scrapedContent.map((content, index) => (
                                    <div key={index} className="mb-4">
                                        <h4 className="font-semibold">Result {index + 1}:</h4>
                                        <pre className="whitespace-pre-wrap text-sm mt-2">{content}</pre>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                    <Input 
                        placeholder="Enter URL to scrape" 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button onClick={handleUrlSubmit}>Scrape</Button>
                </div>
            </div>
        </div>
    )
}