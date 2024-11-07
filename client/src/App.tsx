import { useEffect, useState } from "react";

import "./App.css";

function App() {
  const [isHealthy, setIsHealthy] = useState();
  const [output, setOutput] = useState("");

  useEffect(() => {
    const handleFetch = async () => {
      const response = await fetch("/api/output");

      const text = await response.text();

      setOutput(text);
    };

    const interval = setInterval(async () => {
      await handleFetch();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleFetch = async () => {
      const response = await fetch("/api");

      const data = await response.json();

      setIsHealthy(data.success);
    };

    handleFetch();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col gap-10 p-5">
      <header className="text-xl">
        Portfolio [
        <a href="https://rokaskasperavicius.dev" target="_blank">
          rokaskasperavicius.dev
        </a>
        ]
      </header>

      <main className="flex flex-col h-full gap-5 min-h-0">
        <div className="text-xl flex justify-between">
          <div>Latest Build Log</div>
          <div>Webhook Status: {isHealthy ? "OK" : "Unavailable"}</div>
        </div>

        <div className="container-wrapper min-h-0 text-center">
          <div className="container">
            <pre className="pre text-sm">{output}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
