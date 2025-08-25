import { create } from 'zustand'

interface PluginState {
  isReady: boolean
  logs: string[]
  setReady: (ready: boolean) => void
  addLog: (message: string) => void
}

export const usePluginStore = create<PluginState>((set) => ({
  isReady: false,
  logs: [],
  setReady: (ready) => set({ isReady: ready }),
  addLog: (message) => set((state) => ({ 
    logs: [...state.logs, `[${new Date().toLocaleTimeString()}] ${message}`] 
  }))
}))