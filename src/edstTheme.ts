export const colors = {
  grey: "#ADADAD",
  yellow: "#ADAD00",
  red: "#AD0000",
  orange: "#AD5700",
  green: "#00AD00",
  blue: "#00ADAD",
  brown: "#695547",
  black: "#000000",
  optionsBackgroundGreen: "#006900",
  stripPendingRemovalColor: "#595959",
  stripHighlightColor: "#414141",
  windowBorderColor: "#888888",
  windowOutlineColor: "#ADADAD"
};

export const fontProperties = {
  fontSize: "17px",
  inputFontSize: "17px",
  eramFontFamily: "ERAM",
  edstFontFamily: "EDST",
  floatingFontSizes: ["14px", "17px", "20px"]
};

export const edstTheme = {
  colors,
  fontProperties
};

declare module "styled-components" {
  export interface DefaultTheme {
    colors: typeof colors;
    fontProperties: typeof fontProperties;
  }
}
