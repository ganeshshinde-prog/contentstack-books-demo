// Lytics jstag TypeScript declarations

interface LyticsEventData {
  event: string;
  [key: string]: any;
}

interface JsTag {
  send: (data: LyticsEventData) => void;
  identify: (userId: string, attributes?: Record<string, any>) => void;
  pageView: (data?: Record<string, any>) => void;
  mock: (enabled: boolean) => void;
  getid: () => string | null;
  setid: (id: string) => void;
  loadEntity: (entityId: string) => Promise<any>;
  getEntity: (entityId: string) => any;
  on: (event: string, callback: Function) => void;
  once: (event: string, callback: Function) => void;
  call: (method: string, ...args: any[]) => any;
  init: (config: { src: string }) => void;
  loadScript: (src: string, onload?: Function, onerror?: Function) => void;
  config?: any;
}

declare global {
  interface Window {
    jstag: JsTag;
  }
}

export {};
