import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.4.0", (api) => {
  const FIELD = "tlp_show_thumbnail";

  api.modifyClass("controller:topic", {
    pluginId: "thumbnail-toggle-control",
    actions: {
      toggleThumbnailFlag() {
        const topic = this.model;
        const on    = topic.get(`custom_fields.${FIELD}`) === true;
        topic.set(`custom_fields.${FIELD}`, !on);
        topic
          .save({ custom_fields: topic.custom_fields })
          .then(() => this.appEvents.trigger("topic:custom-field-changed"));
      },
    },
  });

  api.decorateWidget("topic-list-item-thumbnail:after", (helper) => {
    const topic = helper.attrs.topic;
    const on    = topic.custom_fields?.[FIELD] === true;

    if (!helper.currentUser?.staff) return;

    return helper.attach("button", {
      icon:      on ? "image-slash" : "image",
      className: "toggle-thumbnail-btn",
      title:     helper.i18n(on ? "thumbnail_toggle.hide"
                                : "thumbnail_toggle.show"),
      action:    "toggleThumbnailFlag",
    });
  });
});
