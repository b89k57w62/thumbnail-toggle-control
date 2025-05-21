# frozen_string_literal: true
# name: thumbnail-toggle-control
# about: Adds a boolean flag to decide whether TLP shows thumbnail
# version: 0.1
# authors: Jeffrey

after_initialize do
  Topic.register_custom_field_type('tlp_show_thumbnail', :boolean)
  TopicList.preloaded_custom_fields << 'tlp_show_thumbnail'
  TopicView.preloaded_custom_fields  << 'tlp_show_thumbnail'

  PostRevisor.track_topic_field(:tlp_show_thumbnail) do |tc, new_val|
    tc.topic.custom_fields['tlp_show_thumbnail'] = new_val
  end

  module ::TopicPreviews
    module ThumbFlagPatch
      def thumbnail_url
        return nil unless object.custom_fields['tlp_show_thumbnail'] == true
        super
      end
    end
  end

  reloadable_patch do
    TopicPreviews::TopicListItemSerializerExtension.prepend(
      TopicPreviews::ThumbFlagPatch
    )
  end
end
