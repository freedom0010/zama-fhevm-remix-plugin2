import { useRemixPlugin } from './hooks/useRemixPlugin'

function App() {
  const { isReady, logs, connect } = useRemixPlugin()

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Zama FHEVM</h1>
        
        <div className="mb-4">
          <button
            onClick={connect}
            disabled={isReady}
            className={`px-4 py-2 rounded font-medium ${
              isReady
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isReady ? 'Connected to Remix Host' : 'Connect to Remix Host'}
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-2">Logs</h3>
          <div className="max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm text-gray-600 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
