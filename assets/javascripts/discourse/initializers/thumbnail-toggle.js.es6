import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "thumbnail-toggle",
  initialize() {
    console.log("[thumbnail-toggle] initializer loaded");

    withPluginApi("1.4.0", (api) => {
      const FIELD = "thumbnail_toggle_enabled";

      // ❶ 透過 value transformer 注入自訂按鈕
      api.addValueTransformer("post-menu-buttons", (buttons, attrs) => {
        // 只在第一篇貼文、且使用者為 staff 時顯示
        if (!attrs.currentUser?.staff) return buttons;
        if (!attrs?.post) return buttons;
        if (!attrs.post.post_number || attrs.post.post_number !== 1) return buttons;

        const topic = attrs.post.topic;
        const on = topic.get(`custom_fields.${FIELD}`) === true;

        // 插進一顆新按鈕 (位置：reply 之後)
        buttons.push({
          action: "toggleThumbnailFlag",
          icon: on ? "image" : "image-slash",
          label: on ? "thumbnail_toggle.hide" : "thumbnail_toggle.show",
          className: "thumbnail-toggle-btn",
          priority: 120, // 比分享 (160) 更前
        });
        return buttons;
      });

      // ❷ controller action
      api.modifyClass("controller:topic", {
        pluginId: "thumbnail-toggle",
        actions: {
          toggleThumbnailFlag() {
            const topic = this.model;
            const curr = topic.get(`custom_fields.${FIELD}`) === true;
            topic.set(`custom_fields.${FIELD}`, !curr);
            topic
              .save({ custom_fields: topic.custom_fields })
              .then(() => this.appEvents.trigger("topic:custom-field-changed"));
          },
        },
      });
    });
  },
};
