/**
 * returns the positive modulus n mod m
 * @param n
 * @param m
 */
export const mod = (n: number, m: number) => ((n % m) + m) % m;
