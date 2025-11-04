import type { OnProgress } from "./OnProgress";

export function throttleOnProgress<CALLBACK extends OnProgress>(
  callback: OnProgress,
  numSteps: number
): CALLBACK {
  let prevStep = -1;
  const throttledFunc = function (this: any, ...args: Array<any>) {
    const zeroToOneProgress = args[0] as number;
    const step = Math.floor(zeroToOneProgress * numSteps);
    if (step !== prevStep) {
      prevStep = step;
      return callback.apply(this, args as Parameters<CALLBACK>);
    }
  } as CALLBACK;
  return throttledFunc;
}
