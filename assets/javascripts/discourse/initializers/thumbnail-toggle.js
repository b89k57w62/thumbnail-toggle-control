import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", (api) => {
  const FIELD = "thumbnail_toggle_enabled";

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

  // 使用舊的 addPostMenuButton API - 這在大多數 Discourse 版本中都支持
  api.addPostMenuButton("thumbnailToggle", (attrs) => {
    // 只在第一篇貼文、且使用者為 staff 時顯示
    if (!attrs.currentUser?.staff) return;
    if (!attrs.post) return;
    if (attrs.post.post_number !== 1) return;

    const topic = attrs.post.topic;
    const on = topic.get(`custom_fields.${FIELD}`) === true;

    return {
      action: "toggleThumbnailFlag",
      icon: on ? "image" : "image-slash",
      title: on ? "thumbnail_toggle.hide" : "thumbnail_toggle.show",
      label: on ? "thumbnail_toggle.hide" : "thumbnail_toggle.show",
      className: "thumbnail-toggle-btn",
      position: "first",
    };
  });
}); 