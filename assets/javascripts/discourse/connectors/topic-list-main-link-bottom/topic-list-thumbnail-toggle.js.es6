import ThumbnailToggleHelper from "../../lib/thumbnail-toggle-helper";

export default {
  setupComponent(args, component) {
    component.set("topic", args.topic);
  },
  
  actions: {
    toggleThumbnail() {
      ThumbnailToggleHelper.toggleThumbnail(this.get("topic"));
    }
  }
}; 