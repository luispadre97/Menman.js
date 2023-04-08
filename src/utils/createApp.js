export function createApp(rootComponent) {
  return {
    mount: function (selector) {
      const appElement = document.querySelector(selector);
      appElement.innerHTML = rootComponent();
    },
  };
}