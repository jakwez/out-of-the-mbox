import type { OnProgressGeneric } from "./OnProgressGeneric";

export function createThrottledProgressCallback<
  CALLBACK extends OnProgressGeneric
>(callback: OnProgressGeneric, numSteps: number): CALLBACK {
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
