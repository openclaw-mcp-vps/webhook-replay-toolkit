declare global {
  interface Window {
    LemonSqueezy?: {
      Setup: (config: {
        eventHandler?: (event: {
          event: string;
          data: Record<string, unknown>;
        }) => void | Promise<void>;
      }) => void;
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

export {};
