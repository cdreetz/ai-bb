# AI-BB


- Docs seem okay for testing and maybe general scraping, but not sure how useful for AI stuff
- Session management in general is pretty painful
- Not sure logs should show 100 logs for a single loadUrl that lasted 4 seconds
- Session overview bottom panel with 'console' button just doesnt work at all? Not even sure what it does
- Would also be helpful to show more details on the session itself, basically would like to see all things that are returned from getSession

- Sessions vs browsers
  - Docs say to use browser.close() to ensure we end the session after loadURL, but its not ideal to end the session every time we load a page
  - But it's not clear if we can close the browser, but continue using the session

- The 429 error is unclear and is only explained in 1 part of the docs, on the very bottom of some page. Should probably be more clear in the error 
- Using the default loadUrl doesnt work for chats because the session is immediately ended after the first page load, and then following attempts to loadUrl result in 429

- What is ideal? 
  - Maintain a single browserbase session and single browser instance within a user session?
  - Maintain a single browserbase session but close and create new browser per loadUrl? 


- BrowserbaseAISDK doesnt work, I think it would be better to just show people how to do what the SDK aims to achieve, instead of abstracting it away and making it hard to understand


- When I tried to implement function for reconnecting to running session to use for loadUrl again, end up with 'Promise was collected' errors.  And when I check the session in the dashboard, it shows it is still running, but the video clip of the session is only for the first 2 seconds. Not sure what that means. 



## Personal notes

- It is my general belief that this applies to most cases, but 10x more important for AI applications.  Also why I don't use stuff like langchain.  People should be writing these functions themselves and DEFINITELY should not use anything that abstracts away prompts. How can you possibly control an AI application if you don't even know the prompts being used?
- Give a man a fish...
- Less abstraction, better guides and docs >>>>>> abstracting everything away and shitty docs
- I think this is what they call DevEx