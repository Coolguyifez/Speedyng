import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // 'key' is unique for every navigation, even to the same URL
  const { key } = useLocation();

  useEffect(() => {
    // We target the window, the document element, and the body 
    // to ensure mobile browsers (Safari/Chrome) always snap to top.
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [key]); // Trigger whenever a new navigation key is generated

  return null;
};

export default ScrollToTop;