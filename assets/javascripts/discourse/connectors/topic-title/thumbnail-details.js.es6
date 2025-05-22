import ThumbnailToggleHelper from "../../lib/thumbnail-toggle-helper";

export default {
  setupComponent(args, component) {
    component.set("model", args.model);
  },
  
  actions: {
    toggleThumbnail() {
      ThumbnailToggleHelper.toggleThumbnail(this.get("model"));
    }
  }
}; 