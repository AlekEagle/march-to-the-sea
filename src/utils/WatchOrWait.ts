import { Ref, watch } from 'vue';

// This is a utility function that will return a promise that resolves when:
// 1. The timeout duration has passed
// 2. The value of the ref has changed
// 3. A callback validator function returns true.

// The callback validator function is optional. If it is not provided,
// only conditions 1 and 2 will be checked.
export default function watchOrWait<T>(
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
