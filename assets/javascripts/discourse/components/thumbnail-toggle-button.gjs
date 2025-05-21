import Component from "@glimmer/component";
import { service } from "@ember/service";
import { action } from "@ember/object";
import DButton from "discourse/components/d-button";

export default class ThumbnailToggleButton extends Component {
  @service appEvents;

  // 決定按鈕是否顯示
  static shouldRender(attrs) {
    const { post, currentUser } = attrs;
    return (
      currentUser?.staff &&
      post &&
      post.post_number === 1
    );
  }

  get topic() {
    return this.args.post.topic;
  }

  get isThumbnailEnabled() {
    return this.topic.get("custom_fields.thumbnail_toggle_enabled") === true;
  }

  @action
  toggleThumbnailFlag() {
    const curr = this.isThumbnailEnabled;
    this.topic.set("custom_fields.thumbnail_toggle_enabled", !curr);
    this.topic
      .save({ custom_fields: this.topic.custom_fields })
      .then(() => this.appEvents.trigger("topic:custom-field-changed"));
  }

  <template>
    <DButton
      @action={{this.toggleThumbnailFlag}}
      @icon={{if this.isThumbnailEnabled "image" "image-slash"}}
      @label={{if this.isThumbnailEnabled "thumbnail_toggle.hide" "thumbnail_toggle.show"}}
      class="thumbnail-toggle-btn"
      ...attributes
    />
  </template>
} 