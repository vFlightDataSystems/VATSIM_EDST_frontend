export const WEATHER_REFRESH_RATE = 120000; // 2 minutes
export const SPA_INDICATOR = "^";
export const COMPLETED_CHECKMARK_SYMBOL = "\u2713";
export const DOWNLINK_SYMBOL = "\u00BB";
export const OPLUS_SYMBOL = "\u2295";
export const VCI_SYMBOL = "\u2719";
export const CPDLC_VCI = "\u2720";

const ALT_EXPR = /[0-5]?[1-9][05]/;
export const ALTITUDE_VALIDATION_EXPRESSIONS = {
  hardAlt: ALT_EXPR,
  tempAlt: new RegExp(`T${ALT_EXPR.source}`),
  blockAlt: new RegExp(`${ALT_EXPR.source}B${ALT_EXPR.source}`)
};

export const GI_EXPR = /GI (C|\d{2}|[A-Z]{4}) `(.*)/gm;

export const REMOVAL_TIMEOUT = 120000;
