interface RemixMessage {
  type: string
  payload?: any
}

class RemixPlugin {
  private isConnected = false
  private listeners: ((message: RemixMessage) => void)[] = []

  connect() {
    if (this.isConnected) return

    window.addEventListener('message', this.handleMessage.bind(this))
    window.parent.postMessage({ type: 'plugin-loaded' }, '*')
    this.isConnected = true
  }

  log(message: string) {
    window.parent.postMessage({
      type: 'plugin-log',
      payload: { message }
    }, '*')
  }

  private handleMessage(event: MessageEvent) {
    if (event.source !== window.parent) return
    
    const message: RemixMessage = event.data
    this.listeners.forEach(listener => listener(message))
  }

  onMessage(listener: (message: RemixMessage) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

export const remixPlugin = new RemixPlugin()