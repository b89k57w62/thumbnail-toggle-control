# frozen_string_literal: true
# name: thumbnail-toggle-control
# about: Adds a boolean flag to decide whether TLP shows thumbnail
# version: 0.1
# authors: Jeffrey

after_initialize do
  ##
  ## A. 註冊 custom field
  ##
  Topic.register_custom_field_type('thumbnail_toggle_enabled', :boolean)

  ##
  ## B. 追蹤 field 變動
  ##
  PostRevisor.track_topic_field(:thumbnail_toggle_enabled) do |tc, new_val|
    tc.topic.custom_fields['thumbnail_toggle_enabled'] = new_val
  end

  ##
  ## C. Patch TLP Sidecar 的 serializer
  ##    只有開關為 true 時才回傳原本的 thumbnail_url
  ##
  DiscourseEvent.on(:topic_previews_ready) do
    next unless defined?(::TopicPreviews::TopicListItemSerializerExtension)

    module ::TopicPreviews
      module ThumbTogglePatch
        def thumbnail_url
          return nil unless object.custom_fields['thumbnail_toggle_enabled'] == true
          super
        end
      end
    end

    ::TopicPreviews::TopicListItemSerializerExtension.prepend(
      ::TopicPreviews::ThumbTogglePatch
    )
    Rails.logger.info("[thumbnail-toggle-control] ThumbTogglePatch applied")
  end
end