export default async function server(request) {

    try {
      const { sqlite } = await import("https://esm.town/v/stevekrouse/sqlite");
      const KEY = new URL(request.url).pathname.split("/").at(-1) || 'default';
      const SCHEMA_VERSION = 5;
  
      try {
        await sqlite.execute(`
          CREATE TABLE IF NOT EXISTS ${KEY}_jobs_${SCHEMA_VERSION} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
  
        await sqlite.execute(`
          CREATE TABLE IF NOT EXISTS ${KEY}_messages_${SCHEMA_VERSION} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (tableCreationError) {
        console.error("Table creation error:", tableCreationError);
        return new Response(JSON.stringify({ 
          error: "Failed to create tables", 
          details: tableCreationError instanceof Error ? tableCreationError.message : String(tableCreationError)
        }), { 
          status: 500,
          headers: { "Content-Type": "application/json" } 
        });
      }
  
      // Job Posting Endpoint
      if (request.method === "POST" && new URL(request.url).pathname === "/post-job") {
        try {
          const { title, company, description } = await request.json();
          const result = await sqlite.execute(
            `INSERT INTO ${KEY}_jobs_${SCHEMA_VERSION} (title, company, description) VALUES (?, ?, ?)`,
            [title, company, description]
          );
          return new Response(JSON.stringify({ success: true, result }), { 
            headers: { "Content-Type": "application/json" } 
          });
        } catch (jobPostError) {
          console.error("Job post error:", jobPostError);
          return new Response(JSON.stringify({ 
            error: "Failed to post job", 
            details: jobPostError instanceof Error ? jobPostError.message : String(jobPostError)
          }), { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
          });
        }
      }
  
      // Get Jobs Endpoint
      if (request.method === "GET" && new URL(request.url).pathname === "/get-jobs") {
        try {
          const jobs = await sqlite.execute(`
            SELECT * FROM ${KEY}_jobs_${SCHEMA_VERSION} 
            ORDER BY created_at DESC 
            LIMIT 50
          `);
          return new Response(JSON.stringify(jobs.rows || []), { 
            headers: { "Content-Type": "application/json" } 
          });
        } catch (getJobsError) {
          console.error("Get jobs error:", getJobsError);
          return new Response(JSON.stringify({ 
            error: "Failed to retrieve jobs", 
            details: getJobsError instanceof Error ? getJobsError.message : String(getJobsError)
          }), { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
          });
        }
      }
  
      // Send Message Endpoint
      if (request.method === "POST" && new URL(request.url).pathname === "/send-message") {
        try {
          const { content, username } = await request.json();
          if (!username) {
            return new Response(JSON.stringify({ 
              error: "Username is required" 
            }), { 
              status: 400,
              headers: { "Content-Type": "application/json" } 
            });
          }
          const result = await sqlite.execute(
            `INSERT INTO ${KEY}_messages_${SCHEMA_VERSION} (username, content) VALUES (?, ?)`,
            [username, content]
          );
          return new Response(JSON.stringify({ success: true, result }), { 
            headers: { "Content-Type": "application/json" } 
          });
        } catch (sendMessageError) {
          console.error("Send message error:", sendMessageError);
          return new Response(JSON.stringify({ 
            error: "Failed to send message", 
            details: sendMessageError instanceof Error ? sendMessageError.message : String(sendMessageError)
          }), { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
          });
        }
      }
  
      // Get Messages Endpoint
      if (request.method === "GET" && new URL(request.url).pathname === "/get-messages") {
        try {
          const messages = await sqlite.execute(`
            SELECT * FROM ${KEY}_messages_${SCHEMA_VERSION} 
            ORDER BY created_at DESC 
            LIMIT 50
          `);
          return new Response(JSON.stringify(messages.rows || []), { 
            headers: { "Content-Type": "application/json" } 
          });
        } catch (getMessagesError) {
          console.error("Get messages error:", getMessagesError);
          return new Response(JSON.stringify({ 
            error: "Failed to retrieve messages", 
            details: getMessagesError instanceof Error ? getMessagesError.message : String(getMessagesError)
          }), { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
          });
        }
      }
  
      // Default HTML Response
      return new Response(`
        <html>
          <head>
            <title>Job Opportunities Board</title>
            <meta name="description" content="A collaborative platform for job seekers and employers to post opportunities and connect in real-time. Share job listings, discuss career paths, and network with professionals across various industries.">
            <meta property="og:title" content="🌟 Job Opportunities Board">
            <meta property="og:description" content="A real-time job posting and community chat platform for professionals.">
            <style>${css}</style>
          </head>
          <body>
            <div id="root"></div>
            <script src="https://esm.town/v/std/catch"></script>
            <script type="module" src="${import.meta.url}"></script>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html" }
      });
    } catch (globalError) {
      console.error("Global server error:", globalError);
      return new Response(JSON.stringify({ 
        error: "Unexpected server error", 
        details: globalError instanceof Error ? globalError.message : String(globalError)
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      });
    }
  }
  
  const css = `
  body {
    font-family: 'Arial', sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
  }
  
  .job-board-app {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
  }
  
  h1 {
    text-align: center;
    background-color: #2c3e50;
    color: white;
    padding: 15px;
    margin: 0;
  }
  
  .app-container {
    display: flex;
  }
  
  .left-panel, .right-panel {
    width: 50%;
    padding: 20px;
  }
  
  .job-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .job-form input, .job-form textarea, .message-form input, .username-modal input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .job-form button, .message-form button, .username-modal button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .job-list, .chat-room {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
  }
  
  .job-card {
    background: white;
    border: 1px solid #e0e0e0;
    margin-bottom: 10px;
    padding: 15px;
    border-radius: 4px;
  }
  
  .message-list {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .message {
    margin-bottom: 10px;
    padding: 5px;
    background-color: #f1f1f1;
    border-radius: 4px;
  }
  
  .username-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .username-modal {
    background: white;
    padding: 30px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
  }
  
  .username-modal h2 {
    margin-bottom: 20px;
  }
  
  .username-modal input {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .error-message {
    color: red;
    font-size: 0.8em;
    margin-bottom: 10px;
  }
  
  .chat-header {
    background-color: #f1f1f1;
    padding: 10px;
    text-align: right;
    border-bottom: 1px solid #ddd;
  }
  
  footer {
    text-align: center;
    padding: 10px;
    background-color: #2c3e50;
  }
  
  footer a {
    color: white;
    text-decoration: none;
  }
  `;