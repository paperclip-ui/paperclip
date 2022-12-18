import { EventEmitter } from "events";

export class History {
  private _em: EventEmitter;
  constructor() {
    this._em = new EventEmitter();
    window.addEventListener("popstate", () => {
      this._em.emit("change");
    });
  }
  onChange(listener: () => void) {
    this._em.on("change", listener);
  }
  redirect(url: string) {
    history.pushState(null, null, url);
    this._em.emit("change");
  }
}

export const createHistory = () => new History();
