// File: src/utils/browserbase.ts

import * as puppeteer from 'puppeteer-core';

export type ClientOptions = {
    apiKey?: string;
    projectId?: string;
    baseURL?: string;
    baseConnectURL?: string;
};

export type ConnectOptions = {
    sessionId?: string;
    proxy?: boolean;
};

export type LoadOptions = {
    textContent?: boolean;
} & ConnectOptions;

export type CreateSessionOptions = {
    projectId?: string;
    extensionId?: string;
    browserSettings?: {
        fingerprint?: {
            browserListQuery?: string;
            httpVersion?: 1 | 2;
            browsers?: Array<'chrome' | 'firefox' | 'edge' | 'safari'>;
            devices?: Array<'desktop' | 'mobile'>;
            locales?: string[];
            operatingSystems?: Array<'windows' | 'macos' | 'linux' | 'ios' | 'android'>;
            screen?: {
                maxHeight?: number;
                maxWidth?: number;
                minHeight?: number;
                minWidth?: number;
            };
        };
        viewport?: {
            width?: number;
            height?: number;
        };
        context?: {
            id: string;
            persist: boolean;
        };
    };
    keepAlive?: boolean;
    timeout?: number;
};

export type Session = {
    id: string;
    createdAt: string;
    startedAt: string;
    endedAt?: string;
    expiresAt: string;
    projectId: string;
    status: 'RUNNING' | 'COMPLETED' | 'ERROR' | 'TIMED_OUT';
    taskId?: string;
    proxyBytes?: number;
    avg_cpu_usage?: number;
    memory_usage?: number;
    details?: string;
    logs?: string;
};

class BrowserbaseUtil {
    private apiKey: string;
    private projectId: string;
    private baseAPIURL: string;
    private baseConnectURL: string;
    currentSession: Session | null;
    private browser: puppeteer.Browser | null;
    private lastActivityTimestamp: number;
    private inactivityTimer: NodeJS.Timeout | null;

    constructor(options: ClientOptions = {}) {
        this.apiKey = options.apiKey || process.env.BROWSERBASE_API_KEY || '';
        this.projectId = options.projectId || process.env.BROWSERBASE_PROJECT_ID || '';
        this.baseAPIURL = options.baseURL || process.env.BROWSERBASE_API_URL || 'https://www.browserbase.com';
        this.baseConnectURL = options.baseConnectURL || process.env.BROWSERBASE_CONNECT_URL || 'wss://connect.browserbase.com';
        this.currentSession = null;
        this.browser = null;
        this.lastActivityTimestamp = Date.now();
        this.inactivityTimer = null;
    }

    getConnectURL({ sessionId, proxy = false }: ConnectOptions = {}): string {
        return `${this.baseConnectURL}?apiKey=${this.apiKey}${sessionId ? `&sessionId=${sessionId}` : ''}${proxy ? `&enableProxy=true` : ''}`;
    }

    async listSessions(): Promise<Session[]> {
        const response = await fetch(`${this.baseAPIURL}/v1/sessions`, {
            headers: {
                'x-bb-api-key': this.apiKey,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to list sessions: ${response.statusText}`);
        }
        return await response.json();
    }

    async createSession(options: CreateSessionOptions = {}): Promise<Session> {
        if (!this.projectId) {
            throw new Error('projectId is missing. Set BROWSERBASE_PROJECT_ID in your environment variables.');
        }
        const response = await fetch(`${this.baseAPIURL}/v1/sessions`, {
            method: 'POST',
            headers: {
                'x-bb-api-key': this.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ projectId: this.projectId, ...options }),
        });
        if (!response.ok) {
            throw new Error(`Failed to create session: ${response.statusText}`);
        }
        return await response.json();
    }

    async getSession(sessionId: string): Promise<Session> {
        const response = await fetch(`${this.baseAPIURL}/v1/sessions/${sessionId}`, {
            headers: {
                'x-bb-api-key': this.apiKey,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to get session: ${response.statusText}`);
        }
        return await response.json();
    }

    async getOrCreateSession(): Promise<Session> {
        if (this.currentSession && this.currentSession.status === 'RUNNING') {
            return this.currentSession;
        }

        try {
            const sessions = await this.listSessions();
            const runningSessions = sessions.filter(s => s.status === 'RUNNING');

            if (runningSessions.length > 0) {
                runningSessions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                this.currentSession = runningSessions[0];
            } else {
                this.currentSession = await this.createSession();
            }
            return this.currentSession;
        } catch (error) {
            console.error('Error getting or creating session:', error);
            throw error;
        }
    }

    async loadURLs(urls: string[], options: LoadOptions = {}): Promise<string[]> {
        if (!this.currentSession) {
            await this.getOrCreateSession();
        }

        if (!this.browser) {
            this.browser = await puppeteer.connect({
                browserWSEndpoint: this.getConnectURL({ sessionId: this.currentSession!.id, proxy: options.proxy }),
            });
        }
        
        const results: string[] = [];

        try {
            for (const url of urls) {
                const pages = await this.browser.pages();
                const page = pages[0] || await this.browser.newPage();
                await page.goto(url);
                let html = await page.content();
                const readable = await page.evaluate(`
                    import('https://cdn.skypack.dev/@mozilla/readability').then(readability => {
                        return new readability.Readability(document).parse()
                    })
                `);
                html = `${(readable as any).title}\n${(readable as any).textContent}`;
                
                results.push(html);
                
                this.resetInactivityTimer();
            }
        } catch (error) {
            console.error('Error loading URLs:', error);
            throw error;
        }

        return results;
    }

    private resetInactivityTimer(): void {
        this.lastActivityTimestamp = Date.now();
        
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        this.inactivityTimer = setTimeout(() => this.closeInactiveBrowser(), 60000); // 60 seconds
    }

    private async closeInactiveBrowser(): Promise<void> {
        const currentTime = Date.now();
        const inactiveTime = currentTime - this.lastActivityTimestamp;
        
        if (inactiveTime >= 60000 && this.browser) { // 60 seconds
            await this.browser.close();
            this.browser = null;
            this.currentSession = null;
            console.log('Browser closed due to inactivity');
        }
    }
}

// Create and export a singleton instance
const browserbaseUtil = new BrowserbaseUtil();
export default browserbaseUtil;