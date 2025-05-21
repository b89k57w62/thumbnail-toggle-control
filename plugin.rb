# frozen_string_literal: true
# name: thumbnail-toggle-control
# about: Adds a boolean flag to decide whether TLP shows thumbnail
# version: 0.1
# authors: Jeffrey

register_asset "javascripts/discourse/tlp-show-thumbnail-flag.js"

after_initialize do
  # 1️⃣ 宣告一個 boolean custom field，存在 topics.custom_fields 裡
  Topic.register_custom_field_type('tlp_show_thumbnail', :boolean)

  # 2️⃣ 追蹤欄位變動（可回溯，不需要手動 save_custom_fields）
  PostRevisor.track_topic_field(:tlp_show_thumbnail) do |tc, new_val|
    tc.topic.custom_fields['tlp_show_thumbnail'] = new_val
  end

  # 3️⃣ 等 Sidecar 完全載入後，再把我們的 patch 加進去
  DiscourseEvent.on(:topic_previews_ready) do
    next unless defined?(::TopicPreviews::TopicListItemSerializerExtension)

    module ::TopicPreviews
      module ThumbFlagPatch
        # 覆寫原本拿 thumbnail_url 的方法
        def thumbnail_url
          # 只有 custom_fields['tlp_show_thumbnail'] === true 時才 call super
          return nil unless object.custom_fields['tlp_show_thumbnail'] == true
          super
        end
      end
    end

    ::TopicPreviews::TopicListItemSerializerExtension.prepend(
      ::TopicPreviews::ThumbFlagPatch
    )
    Rails.logger.info("[thumbnail-toggle-control] ThumbFlagPatch applied")
  end
end
