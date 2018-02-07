// import isStickySupported from '@/utils/isStickySupported';
// import rafThrottle from '@/utils/rafThrottle';

// function bindSticky(el, binding) {
//   const { modifiers } = binding;
//   const { top = false, bottom = false, left = false, right = false } = modifiers;

//   const style = el.style;
//   const { offsetHeight } = el;
//   const containerHeight = el.parentElement.offsetHeight;

//   if (top) {
//     style.top = '0';
//   }
//   if (bottom) {
//     style.top = `${containerHeight - offsetHeight}px`;
//   }
//   if (left) {
//     style.left = '0';
//   }
//   if (right) {
//     style.right = '0';
//   }
// }

// function bindUnsticky(el, binding) {
//   const { modifiers } = binding;
//   const { top = false, bottom = false, left = false, right = false } = modifiers;

//   const listener = rafThrottle((event) => {
//     const style = el.style;
//     const { offsetHeight } = el;
//     const containerHeight = el.parentElement.offsetHeight;

//     console.log(event);

//     if (top) {
//       style.top = '0';
//     }
//     if (bottom) {
//       style.bottom = '0';
//     }
//     if (left) {
//       style.left = '0';
//     }
//     if (right) {
//       style.right = '0';
//     }
//   });

//   const parent = el.parentElement;
//   parent.addEventListener('scroll', listener);
//   binding.unbindListener = function unbindListener() {
//     parent.removeEventListener('scroll', listener);
//   };
// }

const stickyPosition = {
  // inserted(el, binding) {
  //   if (!isStickySupported) {
  //     el.style.position = 'sticky';
  //     bindSticky(el, binding);
  //   } else {
  //     el.style.position = 'absolute';
  //     bindUnsticky(el, binding);
  //   }
  // },
  // unbind() {
  //   if (!isStickySupported) {
  //     throw new Error('todo: finish sticky position vue directie');
  //   }
  // },
};

export default stickyPosition;

