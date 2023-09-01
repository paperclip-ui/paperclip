export const isEventTargetTextInput = (target: EventTarget) =>
  /textarea|input/.test(String((target as HTMLElement).tagName).toLowerCase());
