import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  reconnectNotice: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setReconnectNotice: (notice: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  reconnectNotice: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setReconnectNotice: (reconnectNotice) => set({ reconnectNotice }),
}));

