import { create } from 'zustand';

export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'nano' | 'cuid' | 'ulid';
export type NamespaceType = 'dns' | 'url' | 'oid' | 'x500' | 'custom';

export interface GeneratorOptions {
  version: UuidVersion;
  quantity: number;
  uppercase: boolean;
  hyphens: boolean;
  braces: boolean;
  namespaceType: NamespaceType;
  customNamespace: string;
  nameValue: string;
}

const DEFAULT_OPTIONS: GeneratorOptions = {
  version: 'v4',
  quantity: 10,
  uppercase: false,
  hyphens: true,
  braces: false,
  namespaceType: 'dns',
  customNamespace: '',
  nameValue: '',
};

interface UuidStore {
  options: GeneratorOptions;
  setOptions: (options: React.SetStateAction<GeneratorOptions>) => void;
  generatedItems: string[];
  setGeneratedItems: (items: string[]) => void;
  isInitialLoad: boolean;
  setIsInitialLoad: (val: boolean) => void;
}

export const useUuidStore = create<UuidStore>((set) => ({
  options: DEFAULT_OPTIONS,
  setOptions: (update) => set((state) => ({ 
    options: typeof update === 'function' ? update(state.options) : update 
  })),
  generatedItems: [],
  setGeneratedItems: (items) => set({ generatedItems: items }),
  isInitialLoad: true,
  setIsInitialLoad: (val) => set({ isInitialLoad: val }),
}));
