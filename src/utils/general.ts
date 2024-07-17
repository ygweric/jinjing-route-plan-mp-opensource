/**
 *
 * @param ms 毫秒
 * @returns
 */
export const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, ms);
  });
};
