import { withPluginApi } from "discourse/lib/plugin-api";
import ThumbnailToggleButton from "../components/thumbnail-toggle-button";

export default {
  name: "thumbnail-toggle",
  initialize() {
    console.log("[thumbnail-toggle] initializer loaded");

    withPluginApi("1.34.0", (api) => {
      // 註冊按鈕到帖子菜單
      api.registerValueTransformer(
        "post-menu-buttons",
        ({ value: dag, context }) => {
          dag.add("thumbnailToggle", ThumbnailToggleButton, {
            before: [
              context.firstButtonKey, // 添加到第一個按鈕前
            ],
          });
        }
      );
    });
  },
}; 