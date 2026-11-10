# @zag-js/react: unmount before start leaves the scroll lock on

`useMachine` starts the machine in a `queueMicrotask` scheduled from a layout effect, and the microtask does not check
whether the component is still mounted. A dialog that is open as it mounts and unmounts before that microtask runs
still starts its machine, and the scroll lock it applies is never removed.

```sh
npm install
npm start               # unmount before the machine started: lock left on <body> (exits 1)
node repro.mjs after-start   # control: unmount after it started: no lock (exits 0)
```

Versions: `@zag-js/react` and `@zag-js/dialog` 1.47.0, React 18.3.1, jsdom 24.1.3, Node 24.
