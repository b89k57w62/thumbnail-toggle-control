import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "thumbnail-toggle-button",

  initialize() {
    withPluginApi("0.11.1", (api) => {
      // 1️⃣ 列出所有可 decorate 的 widget 名稱（幫助你確認正確 key）
      console.log("[thumbnail-toggle] widgetNames:", api.getWidgetNames());

      // 2️⃣ 攔截所有 connector，過濾出縮圖那個 outlet
      api.decorateWidget("connector:after", (helper) => {
        // 請先透過上面 log 確認這個名稱，預設為 "topic-list-item-thumbnail"
        if (helper.attrs.name !== "topic-list-item-thumbnail") {
          return;
        }

        const { topic, currentUser } = helper.attrs;
        if (!currentUser?.staff) {
          return;
        }

        const FIELD = "tlp_show_thumbnail";
        const on    = topic.custom_fields?.[FIELD] === true;
        const titleKey = on ? "thumbnail_toggle.hide" : "thumbnail_toggle.show";
        const icon     = on ? "image-slash" : "image";

        // 插入一顆按鈕
        return helper.h(
          "button.thumbnail-toggle-btn",
          {
            title: helper.i18n(titleKey),
            onclick: async () => {
              // 切換 custom field
              topic.custom_fields[FIELD] = !on;
              await topic.save({ custom_fields: topic.custom_fields });
              // 重新載入列表以套用 serializer patch
              window.location.reload();
            },
          },
          // 使用內建 icon helper
          helper.h("i.fa", { class: `fa-${icon}` })
        );
      });
    });
  },
};
