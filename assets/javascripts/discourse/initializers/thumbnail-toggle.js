import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.4.0", (api) => {
  const FIELD = "tlp_show_thumbnail";      // 必須與 plugin.rb 相同

  /*------------------------------------------------
    ❶ controller action：切換布林並保存
  ------------------------------------------------*/
  api.modifyClass("controller:topic", {
    pluginId: "thumbnail-toggle",
    actions: {
      toggleThumbnailFlag() {
        const topic = this.model;
        const curr  = topic.get(`custom_fields.${FIELD}`) === true;
        topic.set(`custom_fields.${FIELD}`, !curr);

        topic
          .save({ custom_fields: topic.custom_fields })
          .then(() =>
            this.appEvents.trigger("topic:custom-field-changed")
          );
      },
    },
  });

  /*------------------------------------------------
    ❷ 在第一篇貼文的 post-controls 末尾插入按鈕
  ------------------------------------------------*/
  api.decorateWidget("post-controls:after", (helper) => {
    const currentUser = helper.attrs.currentUser;
    const post        = helper.getModel();          // 目前這個 widget 對應的 Post

    // 只給 staff/admin，且僅限第一篇貼文
    if (!currentUser?.staff)   return;
    if (post.post_number !== 1) return;

    const topic = post.topic;
    const on    = topic.custom_fields?.[FIELD] === true;

    return helper.attach("button", {
      icon:      on ? "image" : "image-slash",
      title:     helper.i18n(on ? "thumbnail_toggle.hide"
                                : "thumbnail_toggle.show"),
      className: "thumbnail-toggle-btn",
      action:    "toggleThumbnailFlag",    // ← 綁到 Step ❶ 的 action
    });
  });
});
