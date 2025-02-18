/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState } from "https://esm.sh/react@18.2.0";
import JobPostingForm from './components/JobPostingForm.js';
import JobList from './components/JobList.js';
import ChatRoom from './components/ChatRoom.js';

function App() {
  const [refreshJobs, setRefreshJobs] = useState(0);

  return (
    <div className="job-board-app">
      <h1>🌟 Job Opportunities Board</h1>
      <div className="app-container">
        <div className="left-panel">
          <JobPostingForm onSubmit={() => setRefreshJobs(r => r + 1)} />
          <JobList key={refreshJobs} />
        </div>
        <div className="right-panel">
          <ChatRoom />
        </div>
      </div>
      <footer>
        <a href={import.meta.url.replace("esm.town", "val.town")} target="_top">View Source</a>
      </footer>
    </div>
  );
}

export default App;