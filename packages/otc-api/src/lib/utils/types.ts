/**
 * @see https://x.com/hd_nvim/status/1578567206190780417
 */
export type Narrow<T> = T extends Function
  ? T
  : never | T extends string | number | boolean | bigint
    ? T
    : never | T extends []
      ? []
      : never | { [K in keyof T]: Narrow<T[K]> }
