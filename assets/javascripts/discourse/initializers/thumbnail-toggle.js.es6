import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "thumbnail-toggle",

  initialize() {
    console.log("[thumbnail-toggle] initializer loaded");

    withPluginApi("0.12.0", (api) => {
      const FIELD = "thumbnail_toggle_enabled";

      // 1️⃣ 盡量用新版 addPostMenuButton；若舊版存在 addTopicMenuButton 也照用
      const addMenu =
        api.addPostMenuButton || api.addTopicMenuButton /* fallback */;

      if (!addMenu) {
        // 這代表當前 API 版本不支援兩種 Helper
        console.warn("[thumbnail-toggle] No menu button helper found");
        return;
      }

      // 2️⃣ 在「第一篇貼文」的 ⋯ 選單中掛一顆按鈕
      addMenu("thumbnail-flag", (attrs) => {
        // 只有 staff / admin 看得到
        if (!attrs.currentUser?.staff) return;

        // 如果是 addPostMenuButton，attrs 裡是 post 物件；取 topic 要透過 post.topic
        const topic =
          attrs.topic || (attrs.post && attrs.post.topic) || attrs.model;
        if (!topic) return;

        const on = topic.get(`custom_fields.${FIELD}`) === true;

        return {
          action: "toggleThumbnailFlag",
          icon: on ? "image" : "image-slash",
          title: on ? "隱藏縮圖" : "顯示縮圖",
        };
      });

      // 3️⃣ 綁定 controller action
      api.modifyClass("controller:topic", {
        pluginId: "thumbnail-toggle",
        actions: {
          toggleThumbnailFlag() {
            const FIELD = "thumbnail_toggle_enabled";
            const topic = this.model;
            const curr = topic.get(`custom_fields.${FIELD}`) === true;
            topic.set(`custom_fields.${FIELD}`, !curr);

            topic
              .save({ custom_fields: topic.custom_fields })
              .then(() =>
                this.appEvents.trigger("topic:custom-field-changed")
              );
          },
        },
      });
    });
  },
};
