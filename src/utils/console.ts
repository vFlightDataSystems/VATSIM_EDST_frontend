export function log(message?: any, ...optionalParams: any[]) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(message, ...optionalParams);
  }
}
