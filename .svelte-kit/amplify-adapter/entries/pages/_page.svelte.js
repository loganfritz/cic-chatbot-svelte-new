import "../../chunks/app.js";
import { X as ensure_array_like, Y as stringify, S as pop, Q as push } from "../../chunks/index.js";
import { marked } from "marked";
import { e as escape_html } from "../../chunks/escaping.js";
const replacements = {
  translate: /* @__PURE__ */ new Map([
    [true, "yes"],
    [false, "no"]
  ])
};
function attr(name, value, is_boolean = false) {
  if (value == null || !value && is_boolean || value === "" && name === "class") return "";
  const normalized = name in replacements && replacements[name].get(value) || value;
  const assignment = is_boolean ? "" : `="${escape_html(normalized, true)}"`;
  return ` ${name}${assignment}`;
}
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function Chatbot($$payload, $$props) {
  push();
  const renderer = new marked.Renderer();
  const originalLinkRenderer = renderer.link.bind(renderer);
  renderer.link = (href, title, text) => {
    const link = originalLinkRenderer(href, title, text);
    return link.replace("<a ", '<a class="markdown-content-link" ');
  };
  renderer.autolink = (href, type) => {
    const linkHtml = `<a class="markdown-content-link" href="${href}">${href}</a>`;
    return linkHtml;
  };
  marked.setOptions({ renderer, gfm: true });
  let messages = [];
  let prompt = "";
  let language = "EN";
  const each_array = ensure_array_like(messages);
  $$payload.out += `<header class="header svelte-a6fgwa"><img src="/header_logo.png" alt="ASU Logo" class="svelte-a6fgwa"> <h1 class="svelte-a6fgwa">ASU CIC ChatBot</h1></header> <div class="container svelte-a6fgwa"><div class="messages svelte-a6fgwa"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let message = each_array[$$index];
    $$payload.out += `<div${attr("class", `message-wrapper ${stringify(message.type)} svelte-a6fgwa`)}><img${attr("src", message.type === "user" ? "/UserAvatar.svg" : "/BotAvatar.png")}${attr("alt", `${message.type} avatar`)}${attr("class", `avatar ${stringify(message.type)} svelte-a6fgwa`)}> <div${attr("class", `message ${stringify(message.type)} svelte-a6fgwa`)}>${html(message.content)}</div></div>`;
  }
  $$payload.out += `<!--]--></div> <form class="chat-form svelte-a6fgwa"><label for="prompt" class="svelte-a6fgwa">Enter your prompt:</label><br> <input type="text" id="prompt"${attr("value", prompt)} autocomplete="off" autocapitalize="off" autocorrect="off" class="svelte-a6fgwa"><br> <label for="language" class="svelte-a6fgwa">Language (e.g. "EN"):</label><br> <input type="text" id="language"${attr("value", language)} autocomplete="off" autocapitalize="on" autocorrect="off" class="svelte-a6fgwa"><br> <button type="submit" class="svelte-a6fgwa"><i class="fas fa-paper-plane svelte-a6fgwa"></i> Send</button></form></div>`;
  pop();
}
function _page($$payload) {
  $$payload.out += `<main class="svelte-1usqayj">`;
  Chatbot($$payload);
  $$payload.out += `<!----></main>`;
}
export {
  _page as default
};
