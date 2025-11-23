export type ToastType = "success" | "error" | "info";

export type ToastPayload = {
  id: number;
  type: ToastType;
  text: string;
  timestamp: number;
};

type Listener = (payload: ToastPayload) => void;

const ToastService = (() => {
  let listeners = new Set<Listener>();
  let nextId = 1;
  const queue: ToastPayload[] = [];

  const notify = (p: ToastPayload) => {
    if (listeners.size === 0) {
      if (p.type === "error") console.warn(`[toast][${p.type}]`, p.text);
      else console.log(`[toast][${p.type}]`, p.text);
    } else {
      listeners.forEach((l) => {
        try {
          l(p);
        } catch (e) {
          console.warn("Toast listener threw", e);
        }
      });
    }
  };

  return {
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      if (queue.length) {
        const pending = queue.splice(0, queue.length);
        pending.forEach(notify);
      }
      return () => listeners.delete(listener);
    },

    show: (type: ToastType, text: string) => {
      const id = nextId++;
      const payload: ToastPayload = { id, type, text, timestamp: Date.now() };
      if (listeners.size === 0) queue.push(payload);
      notify(payload);
      return id;
    },

    clear: (id?: number) => {
      if (typeof id === "number") {
        const idx = queue.findIndex((q) => q.id === id);
        if (idx >= 0) queue.splice(idx, 1);
      } else {
        queue.length = 0;
      }
    },

    _resetForTests: () => {
      listeners = new Set();
      queue.length = 0;
      nextId = 1;
    },
  } as const;
})();

export const toast = {
  success: (msg = "") => ToastService.show("success", msg),
  error: (msg = "") => ToastService.show("error", msg),
  info: (msg = "") => ToastService.show("info", msg),
};

export const subscribeToast = (listener: Listener) => ToastService.subscribe(listener);
export const clearToast = (id?: number) => ToastService.clear(id);

export default ToastService;

