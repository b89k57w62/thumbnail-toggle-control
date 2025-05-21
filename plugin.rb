# frozen_string_literal: true
# name: thumbnail-toggle-control
# about: Adds a boolean flag to decide whether TLP shows thumbnail
# version: 0.1
# authors: Jeffrey

after_initialize do
  Topic.register_custom_field_type('tlp_show_thumbnail', :boolean)

  PostRevisor.track_topic_field(:tlp_show_thumbnail) do |tc, new_val|
    tc.topic.custom_fields['tlp_show_thumbnail'] = new_val
  end

  DiscourseEvent.on(:topic_previews_ready) do
    next unless defined?(::TopicPreviews::TopicListItemSerializerExtension)

    module ::TopicPreviews
      module ThumbTogglePatch
        def thumbnail_url
          return nil unless object.custom_fields['tlp_show_thumbnail'] == true
          super
        end
      end
    end

    ::TopicPreviews::TopicListItemSerializerExtension.prepend(
      ::TopicPreviews::ThumbTogglePatch
    )
  end
end