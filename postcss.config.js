import globalData from "@csstools/postcss-global-data";
import customMedia from "postcss-custom-media";

export default {
  plugins: [
    // Makes the @custom-media in breakpoints.css available to every file,
    // even scoped Vue <style> blocks that never @import it (each is compiled
    // as its own isolated PostCSS run, so this is the only way to share
    // definitions across all of them without a per-component import line).
    globalData({ files: ["./src/assets/css/breakpoints.css"] }),
    customMedia(),
  ],
};
