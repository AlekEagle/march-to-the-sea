import { Ref, watch } from 'vue';

// General purpose utility functions for waiting for various conditions to be met.

// This is a utility function that will return a promise that resolves when
// the timeout duration has passed.
export function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

// This is a utility function that will return a promise that resolves when:
// 1. The value of the ref has changed.
// 2. (Optional) A callback validator function returns true.

// The callback validator function is optional. If it is not provided,
// only condition 1 will be checked.
export function waitFor<T>(
  ref: Ref<T>,
  shouldResolveEarly?: (value: T) => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    let cancel: () => void;

    // If the value of the ref changes, resolve the promise
    cancel = watch(ref, (v) => {
      if (shouldResolveEarly && !shouldResolveEarly(v)) return;
      cancel();
      resolve();
    });
  });
}

// This is a utility function that will return a promise that resolves when:
// 1. The timeout duration has passed.
// 2. The value of the ref has changed.
// 3. (Optional) A callback validator function returns true.

// The callback validator function is optional. If it is not provided,
// only conditions 1 and 2 will be checked.
export function watchOrWait<T>(
  duration: number,
  ref: Ref<T>,
  shouldResolveEarly?: (value: T) => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    let timeout: ReturnType<typeof setTimeout>, cancel: () => void;

    const clear = () => {
      clearTimeout(timeout);
      cancel();
    };

    // If the value of the ref changes, resolve the promise
    cancel = watch(ref, (v) => {
      if (shouldResolveEarly && !shouldResolveEarly(v)) return;
      clear();
      resolve();
    });

    // If the timeout duration passes, resolve the promise
    timeout = setTimeout(() => {
      clear();
      resolve();
    }, duration);
  });
}

export default {
  wait,
  waitFor,
  watchOrWait,
};
