import isStickySupported from '@/utils/isStickySupported';
import rafThrottle from '@/utils/rafThrottle';

function bindSticky(el, binding) {
  const { modifiers } = binding;
  const { top = false, bottom = false, left = false, right = false } = modifiers;

  const style = el.style;
  const { offsetHeight } = el;
  const containerHeight = el.parentElement.offsetHeight;

  if (top) {
    style.top = '0';
  }
  if (bottom) {
    style.top = `${containerHeight - offsetHeight}px`;
  }
  if (left) {
    style.left = '0';
  }
  if (right) {
    style.right = '0';
  }
}

function bindUnsticky(el, binding) {
  const { modifiers } = binding;
  const { top = false, bottom = false, left = false, right = false } = modifiers;

  const parent = el.parentElement;

  function updatePosition() {
    const { style } = el;
    const { scrollTop, scrollLeft } = parent;

    if (top) {
      style.top = `${scrollTop}px`;
    }
    if (bottom) {
      style.bottom = `${-scrollTop}px`;
    }
    if (left) {
      style.left = `${scrollLeft}px`;
    }
    if (right) {
      style.right = `${-scrollLeft}px`;
    }
  }

  // const listener = rafThrottle(updatePosition);
  const listener = updatePosition;
  parent.addEventListener('scroll', listener);
  binding.unbindListener = function unbindListener() {
    parent.removeEventListener('scroll', listener);
  };

  updatePosition();
}

const stickyPosition = {
  inserted(el, binding) {
    if (!isStickySupported) {
      el.style.position = 'sticky';
      bindSticky(el, binding);
    } else {
      el.style.position = 'absolute';
      bindUnsticky(el, binding);
    }
  },
  unbind(el, binding) {
    if (!isStickySupported) {
      binding.unbindListener();
    }
  },
};

export default stickyPosition;

