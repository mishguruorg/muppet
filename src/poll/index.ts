/**
 * Continously execute an asynchronous function until a timeout is reached.
 *
 * This is very useful when checking if a UI element has been loaded yet.
 *
 * @param timeout: number of milliseconds to poll for
 * @param predicate: an asynchronous function to execute until the timeout ends
 * the predicate should return a boolean
 *     - if the boolean is false, continue polling
 *     - if the boolean is true, polling ends
 *
 * @returns timedOut: this is true if the poll reached the timeout and false if
 * it finished early.
 */

type PredicateFn = () => Promise<boolean>

const poll = async (
  timeout: number,
  predicate: PredicateFn,
): Promise<boolean> => {
  const deadline = Date.now() + timeout
  while (Date.now() <= deadline) {
    const result = await predicate()
    if (result === true) {
      return false
    }
  }
  return true
}

export default poll
