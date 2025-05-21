import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.4.0", (api) => {
  const FIELD = "tlp_show_thumbnail";          // ← 與 plugin.rb 對應

  /*------------------------------------------------
    ❶ 先註冊 controller action（TopicController）
  ------------------------------------------------*/
  api.modifyClass("controller:topic", {
    pluginId: "thumbnail-toggle-control",
    actions: {
      toggleThumbnailFlag() {
        const topic = this.model;
        const curr  = topic.get(`custom_fields.${FIELD}`) === true;
        topic.set(`custom_fields.${FIELD}`, !curr);

        topic
          .save({ custom_fields: topic.custom_fields })
          .then(() => this.appEvents.trigger("topic:custom-field-changed"));
      },
    },
  });

  /*------------------------------------------------
    ❷ 再用新版 registerPostMenuButton 掛按鈕
  ------------------------------------------------*/
  api.registerPostMenuButton("thumbnail-toggle-btn", (attrs) => {
    // 只給 staff／admin，且限定第 1 樓
    if (!attrs?.currentUser?.staff) return false;
    if (attrs.post_number !== 1)     return false;

    const on  = attrs.topic.custom_fields?.[FIELD] === true;

    return {
      action: "toggleThumbnailFlag",               // 對應 controller action
      icon:   on ? "image" : "image-slash",
      label:  on ? "thumbnail_toggle.hide"
                : "thumbnail_toggle.show",
      className: "thumbnail-toggle-btn",           // 任意 CSS class
      position: "last",                            // 放在最右（可調 first / second…）
    };
  });
});
