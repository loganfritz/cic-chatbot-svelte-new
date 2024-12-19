import { S as pop, Q as push } from "../../chunks/index.js";
import "../../chunks/app.js";
function _layout($$payload, $$props) {
  push();
  let { children } = $$props;
  children($$payload);
  $$payload.out += `<!---->`;
  pop();
}
export {
  _layout as default
};
