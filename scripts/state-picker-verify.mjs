import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";

const hooks = [];
let hookIndex = 0;
let locationRequests = 0;
let destination = null;
const jsx = (type, props) => ({ type, props: props || {} });
const react = {
  useState(initial) {
    const slot = hookIndex++;
    if (!(slot in hooks)) hooks[slot] = initial;
    return [hooks[slot], value => { hooks[slot] = typeof value === "function" ? value(hooks[slot]) : value; }];
  },
  useMemo(factory) { return factory(); },
  useEffect() {},
  useId() { return "state-test"; },
  useRef(initial) {
    const slot = hookIndex++;
    if (!(slot in hooks)) hooks[slot] = { current: initial };
    return hooks[slot];
  },
};
const realStates = testLoader()("lib/states.ts");
const catalog = realStates.prepStates.map(state => state.code === "RI" ? { ...state, status: "comingSoon", homePath: null } : state);
const load = testLoader({
  react,
  "react/jsx-runtime": { jsx, jsxs: jsx },
  "@/components/MessageDialog": { MessageDialog: "dialog" },
  "@/lib/states": { ...realStates, prepStates: catalog },
}, {
  window: { location: { assign: value => { destination = value; } } },
  navigator: { geolocation: { getCurrentPosition(_success, error) { locationRequests++; error({ code: 1 }); } } },
});
const { StatePicker } = load("components/StatePicker.tsx");
const { stateEntry } = load("lib/state-entry.ts");
function render() { hookIndex = 0; return StatePicker({}); }
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join("");
  if (tree === null || tree === undefined || typeof tree === "boolean") return "";
  return typeof tree === "object" ? text(tree.props?.children) : String(tree);
}
function input() { return nodes(render()).find(node => node.props.role === "combobox"); }
function options() { return nodes(render()).filter(node => node.props.role === "option"); }
function search(value) { input().props.onChange({ target: { value } }); }
function key(value) { input().props.onKeyDown({ key: value, preventDefault() {} }); }
function start() { nodes(render()).find(node => node.type === "form").props.onSubmit({ preventDefault() {} }); }
function button(label) { return nodes(render()).find(node => node.type === "button" && text(node).replace(/→$/, "").trim() === label); }

assert.equal(input().props["aria-expanded"], false);
start();
assert.equal(destination, null, "No default state is chosen");
assert.equal(input().props["aria-expanded"], true);
assert.equal(options().length, catalog.length);
assert.ok(nodes(render()).some(node => text(node) === "Select your state to continue"));
const names = options().map(node => text(node).split("Coming soon")[0]);
assert.match(names[0], /^Arizona/);
assert.match(names.at(-1), /^Wyoming/);
for (const query of ["CA", "ca", "  CA  ", "California", " california ", "cAlIfOrNiA"]) {
  search(query);
  assert.equal(options().length, 1);
  assert.match(text(options()[0]), /^California/);
}
key("Enter");
assert.equal(input().props.value, "California (CA)");
assert.equal(input().props["aria-expanded"], false);
start();
assert.equal(destination, "/california/practice/?mode=quick&start=1");
destination = null;
search("Californi");
start();
assert.equal(destination, null, "Editing clears a stale selection");
search("does-not-exist");
assert.equal(options().length, 0);
assert.ok(nodes(render()).some(node => text(node) === "No matching states found"));
search("");
assert.equal(options().length, catalog.length);
key("ArrowDown");
assert.equal(input().props["aria-activedescendant"], options()[1].props.id);
key("ArrowUp");
key("Enter");
assert.equal(input().props.value, "Arizona (AZ)");
input().props.onFocus();
assert.equal(options().length, catalog.length, "Focusing a selected state reveals the complete catalog");
key("Escape");
assert.equal(input().props["aria-expanded"], false);
for (const [code, label, href] of [
  ["AZ", "Start Free Practice", "/arizona-notary-practice-test/?mode=quick&start=1"],
  ["CT", "Start Handbook Practice", "/connecticut/practice/?mode=quick&start=1"],
  ["NC", "Find an Approved Course", "/north-carolina/#courses"],
  ["RI", "View Prep Updates", "/rhode-island/"],
]) {
  search(code); options()[0].props.onClick();
  assert.ok(button(label), code + " has the appropriate action");
  start(); assert.equal(destination, href);
}
const comingSoon = realStates.prepStates.find(state => state.code === "RI");
assert.equal(stateEntry({ ...comingSoon, status: "comingSoon", homePath: null }).href, "/rhode-island/");
button("Use My Location").props.onClick();
assert.equal(locationRequests, 1);
assert.ok(nodes(render()).some(node => node.props.role === "status" && text(node).includes("permission was blocked")));
search("az");
assert.equal(options().length, 1, "Search remains available after location denial");
console.log("StatePicker passed: complete registry, code/name filtering, empty/no-result states, keyboard selection, stale selection, task navigation, coming-soon fixture and permission-denial fallback.");
