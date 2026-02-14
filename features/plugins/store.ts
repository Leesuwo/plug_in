import { create } from 'zustand'
import { Plugin, PluginFilter, PluginSortOption } from './types'

interface PluginStore {
  plugins: Plugin[]
  filter: PluginFilter
  sort: PluginSortOption
  setPlugins: (plugins: Plugin[]) => void
  setFilter: (filter: Partial<PluginFilter>) => void
  setSort: (sort: PluginSortOption) => void
  resetFilter: () => void
}

const defaultFilter: PluginFilter = {}
const defaultSort: PluginSortOption = {
  field: 'name',
  direction: 'asc',
}

export const usePluginStore = create<PluginStore>((set) => ({
  plugins: [],
  filter: defaultFilter,
  sort: defaultSort,
  setPlugins: (plugins) => set({ plugins }),
  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),
  setSort: (sort) => set({ sort }),
  resetFilter: () => set({ filter: defaultFilter }),
}))
