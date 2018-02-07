const style = document.createElement('a').style;
style.cssText = 'position:sticky;position:-webkit-sticky;position:-ms-sticky;';
const isStickySupported = style.position.indexOf('sticky') !== -1;
export default isStickySupported;
