// @zag-js/react: a dialog unmounted before its machine's queued start runs leaves the scroll lock on <body>.
// Run with `npm start`. Each case mounts a dialog that is open from the start and reads <body> after unmounting it.
import { JSDOM } from "jsdom"

const dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true })
for (const k of ["window", "document", "navigator", "HTMLElement", "Node", "getComputedStyle", "requestAnimationFrame",
  "cancelAnimationFrame", "MutationObserver", "Element", "ShadowRoot", "HTMLIFrameElement"])
  if (dom.window[k] !== undefined) Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true })

const React = (await import("react")).default
const { createRoot } = await import("react-dom/client")
const { flushSync } = await import("react-dom")
const dialog = await import("@zag-js/dialog")
const { useMachine, normalizeProps } = await import("@zag-js/react")

const tick = () => new Promise((resolve) => setTimeout(resolve, 20))
const locked = () => document.body.hasAttribute("data-scroll-lock") || document.body.style.overflow === "hidden"

let id = 0
function OpenDialog() {
  const service = useMachine(dialog.machine, { id: `dialog-${id}`, open: true, preventScroll: true })
  const api = dialog.connect(service, normalizeProps)
  return React.createElement("div", api.getContentProps())
}

async function mountAndUnmount({ waitForStart }) {
  id += 1
  const root = createRoot(document.body.appendChild(document.createElement("div")))
  flushSync(() => root.render(React.createElement(OpenDialog)))
  if (waitForStart) await tick() // the machine's queued start has run
  root.unmount()
  await tick()
  return locked()
}

const which = process.argv[2] ?? "early"
const leftLocked = await mountAndUnmount({ waitForStart: which === "after-start" })
console.log(`unmounted ${which === "after-start" ? "after" : "before"} the machine started -> scroll lock left on <body>: ${leftLocked}`)
process.exitCode = leftLocked ? 1 : 0
