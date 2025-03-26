import { useEffect, useState } from "react";

function App() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [output, setOutput] = useState("");

  useEffect(() => {
    const handleFetch = async () => {
      const response = await fetch("/api/logs/current");

      if (!response.ok) {
        setIsHealthy(false);
      }

      const text = await response.text();
      setOutput(text);
    };

    const intervalId = setInterval(async () => {
      await handleFetch();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleFetch = async () => {
      // const response = await fetch("/api/logs/current/status");
      // const result = await response.json();
      // console.log(result);
      // setOutput(result.results[0].log);
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

        <div className="border border-solid border-text p-5 bg-background h-full box-border flex justify-center items-start rounded-md min-h-0 text-center">
          <div className="flex flex-col-reverse overflow-y-scroll max-h-full">
            <pre className="w-full whitespace-pre-wrap m-0 text-sm">
              {output}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
