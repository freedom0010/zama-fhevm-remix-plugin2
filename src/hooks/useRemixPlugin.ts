// Remix API hook
import { useEffect } from 'react'
import { usePluginStore } from '../store/pluginStore'
import { remixPlugin } from '../plugin'

export function useRemixPlugin() {
  const { isReady, logs, setReady, addLog } = usePluginStore()

  useEffect(() => {
    const unsubscribe = remixPlugin.onMessage((message) => {
      addLog(`Received: ${message.type}`)
      
      if (message.type === 'remix-ready') {
        setReady(true)
        addLog('Connected to Remix host')
      }
    })

    return unsubscribe
  }, [addLog, setReady])

  const connect = () => {
    addLog('Attempting to connect to Remix host...')
    remixPlugin.connect()
  }

  const log = (message: string) => {
    addLog(message)
    remixPlugin.log(message)
  }

  return {
    isReady,
    logs,
    connect,
    log
  }
}