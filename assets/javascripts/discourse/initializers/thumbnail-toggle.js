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

  // 使用新的 registerValueTransformer API - 正確的參數格式
  api.registerValueTransformer("post-menu-buttons", ({ value: buttons, context }) => {
    // 獲取必要的上下文信息
    const { post, currentUser } = context;
    
    // 只在第一篇貼文、且使用者為 staff 時顯示
    if (!currentUser?.staff) return buttons;
    if (!post) return buttons;
    if (post.post_number !== 1) return buttons;

    const topic = post.topic;
    const on = topic.get(`custom_fields.${FIELD}`) === true;

    // 添加按鈕到菜單
    buttons.push({
      action: "toggleThumbnailFlag",
      icon: on ? "image" : "image-slash",
      title: on ? "thumbnail_toggle.hide" : "thumbnail_toggle.show",
      label: on ? "thumbnail_toggle.hide" : "thumbnail_toggle.show",
      className: "thumbnail-toggle-btn",
      position: "first",
    });
    
    return buttons;
  });
}); 