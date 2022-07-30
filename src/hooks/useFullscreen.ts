import { RefObject, useState } from "react";

export const useFullscreen = (element: RefObject<HTMLElement>) => {
  const [fullscreen, setFullscreen] = useState(true);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    if (element.current) {
      if (!fullscreen) {
        element.current.style.width = `calc(100% - 10px)`;
        element.current.style.height = `calc(100% - 10px)`;
      } else {
        element.current.style.width = "auto";
        element.current.style.height = "auto";
      }
    }
  };

  return { fullscreen, toggleFullscreen };
};
