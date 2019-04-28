exports.up = pgm => {
    pgm.alterColumn('activities', 'activity_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('announcements', 'announcement_start_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('announcements', 'announcement_end_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('announcements', 'announcement_created_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('appeal_abandoned_jobs', 'appeal_on', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('blocked_users', 'blocked_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('conversations', 'conversation_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('deleted_conversations', 'convo_deleted_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_milestones', 'milestone_due_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_milestones', 'milestone_completed_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_milestones', 'milestone_fund_due_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_milestones', 'milestone_start_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_milestones', 'payout_arrival_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('error_log', 'error_entry_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('friends', 'became_friend_on', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('ip_address_log', 'ip_logged_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_messages', 'job_message_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_post_applications', 'applied_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_postings', 'job_post_date', {
            type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_postings', 'job_post_modified_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_postings', 'job_post_closing_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('job_postings', 'job_post_expiration_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('jobs', 'job_created_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('jobs', 'job_end_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('jobs', 'job_modified_Date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('jobs', 'job_due_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('messages', 'message_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('milestone_conditions', 'condition_complete_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('milestone_files', 'file_uploaded_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('notifications', 'notification_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('pinned_jobs', 'pinned_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('pinned_messages', 'message_pinned_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('promotions', 'promo_Created_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('promotions', 'promo_effective_start_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('promotions', 'promo_effective_end_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('removed_applications', 'removed_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('reports', 'report_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('review_tokens', 'token_created_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('review_tokens', 'token_used_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('saved_job_post', 'saved_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('sectors', 'sector_created_on', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('site_review', 'review_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('user_bans', 'ban_start_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('user_bans', 'ban_end_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('user_events', 'event_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('user_listings', 'listing_created_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('user_listings', 'listing_renewed_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('user_reviews', 'review_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('user_reviews', 'review_modified_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('user_warnings', 'warning_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('users', 'user_created_on', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('users', 'user_this_login', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('users', 'user_last_login', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('users', 'reg_key_expire_date', {
        type: 'timestamp with time zone'
    }),
    pgm.alterColumn('users', 'subscription_end_date', {
        type: 'timestamp with time zone'
    })
}