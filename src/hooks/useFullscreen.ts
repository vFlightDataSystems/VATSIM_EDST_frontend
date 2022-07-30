import { RefObject, useState } from "react";

export const useFullscreen = (element: RefObject<HTMLElement>) => {
  const [fullscreen, setFullscreen] = useState(true);

  const toggleFullscreen = () => {
    if (element.current) {
      element.current.style.width = "auto";
      element.current.style.height = "auto";
    }
    setFullscreen(!fullscreen);
  };

  return { fullscreen, toggleFullscreen };
};
