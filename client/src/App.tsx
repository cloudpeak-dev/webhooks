import { useEffect, useState } from "react";

import "./App.css";

function App() {
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

  return (
    <div className="container-wrapper">
      <div className="container">
        <pre className="pre">{output}</pre>
      </div>
    </div>
  );
}

export default App;
