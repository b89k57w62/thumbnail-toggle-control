import { withPluginApi } from "discourse/lib/plugin-api";
import ThumbnailToggleHelper from "../lib/thumbnail-toggle-helper";

export default {
  name: "thumbnail-toggle-control",
  initialize() {
    withPluginApi("1.4.0", api => {
      // 全域註冊主題控制器的操作
      api.modifyClass("controller:topic", {
        actions: {
          toggleThumbnail() {
            ThumbnailToggleHelper.toggleThumbnail(this.model);
          }
        }
      });
      
      // 全域註冊主題列表項目的操作
      api.modifyClass("component:topic-list-item", {
        actions: {
          toggleThumbnail() {
            ThumbnailToggleHelper.toggleThumbnail(this.topic);
          }
        }
      });
      
      // 確保我們可以在 outlet 中獲取主題數據
      api.reopenWidget("topic-list-item", {
        toggleThumbnail() {
          ThumbnailToggleHelper.toggleThumbnail(this.findAncestorModel());
        }
      });
    });
  }
};
