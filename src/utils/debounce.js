export default function debounce(func, { delay = 17, trailing = true } = {}) {
  let timeout;

  return function callFn(...args) {
    const context = this;
    function later() {
      timeout = null;
      if (trailing) {
        func.apply(context, args);
      }
    }

    const callNow = !trailing && !timeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, delay);
    if (callNow) {
      func.apply(context, args);
    }
  };
}
