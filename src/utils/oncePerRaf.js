export default function oncePerRaf(callback) {
  let calledInCurrentRaf = false;
  let latestArgs = [];
  return function oncePerRafCb(...args) {
    latestArgs = args;
    if (!calledInCurrentRaf) {
      window.requestAnimationFrame(() => {
        callback(...latestArgs);
        calledInCurrentRaf = false;
      });
      calledInCurrentRaf = true;
    }
  };
}
