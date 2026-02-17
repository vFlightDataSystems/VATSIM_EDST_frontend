export enum apiEramChar {
    UpArrow = 128,
    DownArrow = 129,
    HsfIndicator = 130,
    Del = 131,
    CheckMark = 132,
    XMark = 133,
    Vci = 134,
    ClearWeather = 135,
    OvercastWeather = 136,
    InsertCursor = 137,
    UpTriangle = 138,
    DownTriangle = 139,
}

/**
 * Mapping of display characters to their ERAM character codes.
 * When sending to the server, these characters must be converted to their corresponding codes.
 */
export const characterToEramCharMapping: Record<string, number> = {
    '`': apiEramChar.ClearWeather, // Backtick (U+0060) → ClearWeather (135)
};