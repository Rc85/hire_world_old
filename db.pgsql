--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4
-- Dumped by pg_dump version 10.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    activity_id integer NOT NULL,
    activity_action character varying NOT NULL,
    activity_user character varying NOT NULL,
    activity_type character varying NOT NULL,
    activity_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: activities_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activities_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activities_activity_id_seq OWNER TO postgres;

--
-- Name: activities_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activities_activity_id_seq OWNED BY public.activities.activity_id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    announcement_id integer NOT NULL,
    announcement text NOT NULL,
    announcement_start_date date,
    announcement_end_date date,
    announcer character varying NOT NULL,
    announcement_created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_annoucement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_annoucement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.announcements_annoucement_id_seq OWNER TO postgres;

--
-- Name: announcements_annoucement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_annoucement_id_seq OWNED BY public.announcements.announcement_id;


--
-- Name: appeal_abandoned_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appeal_abandoned_jobs (
    aa_id integer NOT NULL,
    appeal_abandoned_job_id integer NOT NULL,
    additional_info text,
    appealed_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.appeal_abandoned_jobs OWNER TO postgres;

--
-- Name: appeal_abandoned_jobs_aa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appeal_abandoned_jobs_aa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.appeal_abandoned_jobs_aa_id_seq OWNER TO postgres;

--
-- Name: appeal_abandoned_jobs_aa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appeal_abandoned_jobs_aa_id_seq OWNED BY public.appeal_abandoned_jobs.aa_id;


--
-- Name: blocked_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_users (
    blocked_user_id integer NOT NULL,
    blocking_user character varying NOT NULL,
    blocked_user character varying NOT NULL,
    blocked_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blocked_users OWNER TO postgres;

--
-- Name: blocked_users_blocked_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blocked_users_blocked_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blocked_users_blocked_user_id_seq OWNER TO postgres;

--
-- Name: blocked_users_blocked_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blocked_users_blocked_user_id_seq OWNED BY public.blocked_users.blocked_user_id;


--
-- Name: business_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_hours (
    business_hour_id integer NOT NULL,
    monday character varying,
    tuesday character varying,
    wednesday character varying,
    thursday character varying,
    friday character varying,
    saturday character varying,
    sunday character varying,
    for_listing integer NOT NULL
);


ALTER TABLE public.business_hours OWNER TO postgres;

--
-- Name: business_hours_business_hour_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_hours_business_hour_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.business_hours_business_hour_id_seq OWNER TO postgres;

--
-- Name: business_hours_business_hour_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_hours_business_hour_id_seq OWNED BY public.business_hours.business_hour_id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    conversation_id integer NOT NULL,
    conversation_starter character varying NOT NULL,
    conversation_recipient character varying NOT NULL,
    conversation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    conversation_status character varying DEFAULT 'New'::character varying,
    conversation_subject character varying NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: conversations_conversation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversations_conversation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.conversations_conversation_id_seq OWNER TO postgres;

--
-- Name: conversations_conversation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversations_conversation_id_seq OWNED BY public.conversations.conversation_id;


--
-- Name: deleted_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deleted_messages (
    deleted_msg_id integer NOT NULL,
    deleted_message integer NOT NULL,
    message_deleted_by character varying NOT NULL,
    message_deleted_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.deleted_messages OWNER TO postgres;

--
-- Name: deleted_messages_deleted_msg_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deleted_messages_deleted_msg_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deleted_messages_deleted_msg_id_seq OWNER TO postgres;

--
-- Name: deleted_messages_deleted_msg_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deleted_messages_deleted_msg_id_seq OWNED BY public.deleted_messages.deleted_msg_id;


--
-- Name: dismissed_announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dismissed_announcements (
    dismissed_announcement integer,
    dismissed_by character varying
);


ALTER TABLE public.dismissed_announcements OWNER TO postgres;

--
-- Name: error_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.error_log (
    error_id integer NOT NULL,
    error character varying NOT NULL,
    error_url character varying,
    error_entry_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    error_occurrence integer DEFAULT 0
);


ALTER TABLE public.error_log OWNER TO postgres;

--
-- Name: error_log_error_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.error_log_error_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.error_log_error_id_seq OWNER TO postgres;

--
-- Name: error_log_error_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.error_log_error_id_seq OWNED BY public.error_log.error_id;


--
-- Name: friends; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friends (
    friend_id integer NOT NULL,
    friend_user_1 character varying NOT NULL,
    friend_user_2 character varying NOT NULL,
    became_friend_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.friends OWNER TO postgres;

--
-- Name: friends_friend_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.friends_friend_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.friends_friend_id_seq OWNER TO postgres;

--
-- Name: friends_friend_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.friends_friend_id_seq OWNED BY public.friends.friend_id;


--
-- Name: job_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_messages (
    job_message_id integer NOT NULL,
    job_message_creator character varying NOT NULL,
    job_message text,
    job_message_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    job_message_parent_id integer NOT NULL,
    job_message_status character varying DEFAULT 'New'::character varying
);


ALTER TABLE public.job_messages OWNER TO postgres;

--
-- Name: job_messages_job_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_messages_job_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.job_messages_job_message_id_seq OWNER TO postgres;

--
-- Name: job_messages_job_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_messages_job_message_id_seq OWNED BY public.job_messages.job_message_id;


--
-- Name: job_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_milestones (
    milestone_id integer NOT NULL,
    milestone_job_id integer NOT NULL,
    milestone_payment_amount numeric(3,2) NOT NULL,
    milestone_due_date timestamp without time zone,
    milestone_status character varying DEFAULT 'In Progress'::character varying
);


ALTER TABLE public.job_milestones OWNER TO postgres;

--
-- Name: job_milestones_milestone_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_milestones_milestone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.job_milestones_milestone_id_seq OWNER TO postgres;

--
-- Name: job_milestones_milestone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_milestones_milestone_id_seq OWNED BY public.job_milestones.milestone_id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    job_id integer NOT NULL,
    job_description text NOT NULL,
    job_total_price numeric(3,2) NOT NULL,
    job_price_currency character varying NOT NULL,
    job_user character varying NOT NULL,
    job_client character varying NOT NULL,
    job_offered_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    job_end_date timestamp without time zone,
    job_status character varying DEFAULT 'Pending'::character varying
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_job_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jobs_job_id_seq OWNER TO postgres;

--
-- Name: jobs_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_job_id_seq OWNED BY public.jobs.job_id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    message_id integer NOT NULL,
    message_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    message_status character varying DEFAULT 'New'::character varying,
    message_creator character varying NOT NULL,
    message_conversation_id integer NOT NULL,
    message_body text
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_message_id_seq OWNER TO postgres;

--
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- Name: milestone_conditions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.milestone_conditions (
    condition_id integer NOT NULL,
    condition_parent_id integer NOT NULL,
    condition text NOT NULL,
    condition_status character varying DEFAULT 'In Progress'::character varying
);


ALTER TABLE public.milestone_conditions OWNER TO postgres;

--
-- Name: milestone_conditions_condition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.milestone_conditions_condition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.milestone_conditions_condition_id_seq OWNER TO postgres;

--
-- Name: milestone_conditions_condition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.milestone_conditions_condition_id_seq OWNED BY public.milestone_conditions.condition_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    notification_recipient character varying NOT NULL,
    notification_message text NOT NULL,
    notification_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notification_status character varying DEFAULT 'New'::character varying,
    notification_type character varying NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_notification_id_seq OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: pinned_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pinned_jobs (
    pinned_id integer NOT NULL,
    pinned_job integer NOT NULL,
    pinned_by character varying NOT NULL,
    pinned_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pinned_jobs OWNER TO postgres;

--
-- Name: pinned_jobs_pinned_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pinned_jobs_pinned_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pinned_jobs_pinned_id_seq OWNER TO postgres;

--
-- Name: pinned_jobs_pinned_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pinned_jobs_pinned_id_seq OWNED BY public.pinned_jobs.pinned_id;


--
-- Name: pinned_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pinned_messages (
    pinned_msg_id integer NOT NULL,
    pinned_message integer NOT NULL,
    message_pinned_by character varying NOT NULL,
    message_pinned_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pinned_messages OWNER TO postgres;

--
-- Name: pinned_messages_pinned_msg_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pinned_messages_pinned_msg_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pinned_messages_pinned_msg_id_seq OWNER TO postgres;

--
-- Name: pinned_messages_pinned_msg_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pinned_messages_pinned_msg_id_seq OWNED BY public.pinned_messages.pinned_msg_id;


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    promo_id integer NOT NULL,
    promo_name character varying NOT NULL,
    promo_created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    promo_effective_start_date timestamp without time zone,
    promo_effective_end_date timestamp without time zone,
    promo_description text,
    promo_status character varying DEFAULT 'Active'::character varying NOT NULL,
    promo_code character varying(10) NOT NULL
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: promotions_promo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotions_promo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.promotions_promo_id_seq OWNER TO postgres;

--
-- Name: promotions_promo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotions_promo_id_seq OWNED BY public.promotions.promo_id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    report_id integer NOT NULL,
    reporter character varying NOT NULL,
    report_type character varying NOT NULL,
    report_from_url character varying,
    report_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    report_status character varying DEFAULT 'Pending'::character varying,
    reported_user character varying,
    reported_id integer
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reports_report_id_seq OWNER TO postgres;

--
-- Name: reports_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_report_id_seq OWNED BY public.reports.report_id;


--
-- Name: sectors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sectors (
    sector_id integer NOT NULL,
    sector character varying,
    sector_created_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sector_created_by character varying,
    sector_status character varying DEFAULT 'Open'::character varying
);


ALTER TABLE public.sectors OWNER TO postgres;

--
-- Name: sectors_sector_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sectors_sector_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sectors_sector_id_seq OWNER TO postgres;

--
-- Name: sectors_sector_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sectors_sector_id_seq OWNED BY public.sectors.sector_id;


--
-- Name: site_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_configs (
    config_id integer NOT NULL,
    config_name character varying NOT NULL,
    config_status character varying DEFAULT 'Active'::character varying NOT NULL
);


ALTER TABLE public.site_configs OWNER TO postgres;

--
-- Name: site_config_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_config_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.site_config_configs_id_seq OWNER TO postgres;

--
-- Name: site_config_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_config_configs_id_seq OWNED BY public.site_configs.config_id;


--
-- Name: site_review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_review (
    site_review_id integer NOT NULL,
    reviewer character varying NOT NULL,
    rating integer NOT NULL,
    review_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_review OWNER TO postgres;

--
-- Name: site_review_site_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_review_site_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.site_review_site_review_id_seq OWNER TO postgres;

--
-- Name: site_review_site_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_review_site_review_id_seq OWNED BY public.site_review.site_review_id;


--
-- Name: user_bans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_bans (
    ban_id integer NOT NULL,
    banned_user character varying NOT NULL,
    banned_by character varying NOT NULL,
    ban_reason text NOT NULL,
    ban_type character varying NOT NULL,
    ban_start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ban_end_date timestamp without time zone
);


ALTER TABLE public.user_bans OWNER TO postgres;

--
-- Name: user_bans_ban_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_bans_ban_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_bans_ban_id_seq OWNER TO postgres;

--
-- Name: user_bans_ban_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_bans_ban_id_seq OWNED BY public.user_bans.ban_id;


--
-- Name: user_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_listings (
    listing_id integer NOT NULL,
    listing_user character varying NOT NULL,
    listing_created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    listing_sector character varying NOT NULL,
    listing_price numeric NOT NULL,
    listing_price_type character varying NOT NULL,
    listing_price_currency character varying NOT NULL,
    listing_negotiable boolean,
    listing_detail text,
    listing_status character varying DEFAULT 'Active'::character varying,
    listing_renewed_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    listing_title character varying NOT NULL,
    listing_local boolean DEFAULT false,
    listing_remote boolean DEFAULT false
);


ALTER TABLE public.user_listings OWNER TO postgres;

--
-- Name: user_listings_listing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_listings_listing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_listings_listing_id_seq OWNER TO postgres;

--
-- Name: user_listings_listing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_listings_listing_id_seq OWNED BY public.user_listings.listing_id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    user_profile_id integer,
    user_firstname character varying NOT NULL,
    user_lastname character varying NOT NULL,
    avatar_url character varying DEFAULT '/images/profile.png'::character varying,
    user_title character varying NOT NULL,
    user_education character varying,
    user_bio text,
    user_github character varying,
    user_twitter character varying,
    user_facebook character varying,
    user_website character varying,
    user_linkedin character varying,
    user_instagram character varying,
    user_city character varying,
    user_region character varying,
    user_country character varying,
    user_business_name character varying,
    user_worldwide boolean,
    user_phone character varying,
    user_address character varying,
    user_city_code character varying
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Name: user_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_reviews (
    review_id integer NOT NULL,
    reviewer character varying,
    review_token character varying,
    review_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    token_status character varying DEFAULT 'Valid'::character varying,
    reviewing character varying,
    review text,
    review_rating integer,
    review_modified_date timestamp without time zone,
    review_job_id integer,
    review_status character varying DEFAULT 'Active'::character varying,
    review_list_id integer
);


ALTER TABLE public.user_reviews OWNER TO postgres;

--
-- Name: user_reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_reviews_review_id_seq OWNER TO postgres;

--
-- Name: user_reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_reviews_review_id_seq OWNED BY public.user_reviews.review_id;


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    user_setting_id integer,
    hide_email boolean DEFAULT false,
    display_fullname boolean DEFAULT false,
    email_notifications boolean DEFAULT false,
    allow_messaging boolean DEFAULT true,
    display_business_hours boolean DEFAULT false
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: user_view_count; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_view_count (
    viewing_user character varying,
    view_count integer DEFAULT 0
);


ALTER TABLE public.user_view_count OWNER TO postgres;

--
-- Name: user_warnings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_warnings (
    warning_id integer NOT NULL,
    warning text NOT NULL,
    warning_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    warned_by character varying NOT NULL,
    warned_user character varying NOT NULL
);


ALTER TABLE public.user_warnings OWNER TO postgres;

--
-- Name: user_warnings_warning_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_warnings_warning_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_warnings_warning_id_seq OWNER TO postgres;

--
-- Name: user_warnings_warning_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_warnings_warning_id_seq OWNED BY public.user_warnings.warning_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(15) NOT NULL,
    user_password character varying NOT NULL,
    user_email character varying NOT NULL,
    user_created_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_status character varying DEFAULT 'Pending'::character varying,
    account_type character varying,
    user_this_login timestamp without time zone,
    user_last_login timestamp without time zone,
    user_level integer DEFAULT 0,
    registration_key character varying,
    reg_key_expire_date timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '1 day'::interval day),
    is_subscribed boolean DEFAULT false,
    stripe_id character varying,
    subscription_id character varying,
    subscription_end_date timestamp without time zone,
    plan_id character varying,
    connected_id character varying,
    CONSTRAINT check_user_level CHECK (((user_level >= 0) AND (user_level <= 100))),
    CONSTRAINT check_user_status CHECK (((user_status)::text = ANY ((ARRAY['Pending'::character varying, 'Active'::character varying, 'Suspend'::character varying, 'Ban'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: activities activity_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities ALTER COLUMN activity_id SET DEFAULT nextval('public.activities_activity_id_seq'::regclass);


--
-- Name: announcements announcement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN announcement_id SET DEFAULT nextval('public.announcements_annoucement_id_seq'::regclass);


--
-- Name: appeal_abandoned_jobs aa_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appeal_abandoned_jobs ALTER COLUMN aa_id SET DEFAULT nextval('public.appeal_abandoned_jobs_aa_id_seq'::regclass);


--
-- Name: blocked_users blocked_user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users ALTER COLUMN blocked_user_id SET DEFAULT nextval('public.blocked_users_blocked_user_id_seq'::regclass);


--
-- Name: business_hours business_hour_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours ALTER COLUMN business_hour_id SET DEFAULT nextval('public.business_hours_business_hour_id_seq'::regclass);


--
-- Name: conversations conversation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations ALTER COLUMN conversation_id SET DEFAULT nextval('public.conversations_conversation_id_seq'::regclass);


--
-- Name: deleted_messages deleted_msg_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_messages ALTER COLUMN deleted_msg_id SET DEFAULT nextval('public.deleted_messages_deleted_msg_id_seq'::regclass);


--
-- Name: error_log error_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_log ALTER COLUMN error_id SET DEFAULT nextval('public.error_log_error_id_seq'::regclass);


--
-- Name: friends friend_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends ALTER COLUMN friend_id SET DEFAULT nextval('public.friends_friend_id_seq'::regclass);


--
-- Name: job_messages job_message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_messages ALTER COLUMN job_message_id SET DEFAULT nextval('public.job_messages_job_message_id_seq'::regclass);


--
-- Name: job_milestones milestone_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_milestones ALTER COLUMN milestone_id SET DEFAULT nextval('public.job_milestones_milestone_id_seq'::regclass);


--
-- Name: jobs job_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN job_id SET DEFAULT nextval('public.jobs_job_id_seq'::regclass);


--
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- Name: milestone_conditions condition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestone_conditions ALTER COLUMN condition_id SET DEFAULT nextval('public.milestone_conditions_condition_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: pinned_jobs pinned_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs ALTER COLUMN pinned_id SET DEFAULT nextval('public.pinned_jobs_pinned_id_seq'::regclass);


--
-- Name: pinned_messages pinned_msg_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_messages ALTER COLUMN pinned_msg_id SET DEFAULT nextval('public.pinned_messages_pinned_msg_id_seq'::regclass);


--
-- Name: promotions promo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions ALTER COLUMN promo_id SET DEFAULT nextval('public.promotions_promo_id_seq'::regclass);


--
-- Name: reports report_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN report_id SET DEFAULT nextval('public.reports_report_id_seq'::regclass);


--
-- Name: sectors sector_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sectors ALTER COLUMN sector_id SET DEFAULT nextval('public.sectors_sector_id_seq'::regclass);


--
-- Name: site_configs config_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_configs ALTER COLUMN config_id SET DEFAULT nextval('public.site_config_configs_id_seq'::regclass);


--
-- Name: site_review site_review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_review ALTER COLUMN site_review_id SET DEFAULT nextval('public.site_review_site_review_id_seq'::regclass);


--
-- Name: user_bans ban_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_bans ALTER COLUMN ban_id SET DEFAULT nextval('public.user_bans_ban_id_seq'::regclass);


--
-- Name: user_listings listing_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_listings ALTER COLUMN listing_id SET DEFAULT nextval('public.user_listings_listing_id_seq'::regclass);


--
-- Name: user_reviews review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_reviews ALTER COLUMN review_id SET DEFAULT nextval('public.user_reviews_review_id_seq'::regclass);


--
-- Name: user_warnings warning_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_warnings ALTER COLUMN warning_id SET DEFAULT nextval('public.user_warnings_warning_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (activity_id, activity_action, activity_user, activity_type, activity_date) FROM stdin;
1	Changed password	roger85	Account	2018-12-27 18:43:52.805604
2	Updated profile	roger85	Account	2018-12-27 18:44:01.131086
3	Updated profile	roger85	Account	2018-12-27 19:15:33.788169
4	Updated profile	roger85	Account	2018-12-27 19:16:04.267968
5	Set payment method ending in 0005 as default	roger85	Payment	2018-12-27 19:16:18.571506
6	Subscription created	roger85	Subscription	2018-12-27 19:16:50.343926
7	Deleted a payment method	roger85	Payment	2018-12-27 19:17:50.825429
8	Added a payment method ending in 4242	roger85	Payment	2018-12-27 19:18:00.391162
9	Subscription canceled	roger85	Subscription	2018-12-27 19:52:09.402406
10	Subscription created	roger85	Subscription	2018-12-27 19:52:24.575856
11	Subscription canceled	roger85	Subscription	2018-12-27 20:26:30.797258
12	Subscription created	roger85	Subscription	2018-12-30 20:33:55.563824
13	Created an account	verifying_user	Account	2019-01-01 17:15:52.225691
14	Subscription created	payinguser	Subscription	2019-01-17 00:45:47.958059
15	Updated profile	payinguser	Account	2019-01-17 21:47:19.276946
16	Subscription canceled	payinguser	Subscription	2019-01-18 22:17:27.65038
17	Subscription created	payinguser	Subscription	2019-01-18 22:21:47.830864
18	Subscription canceled	payinguser	Subscription	2019-01-18 22:23:47.201125
19	Subscription created	payinguser	Subscription	2019-01-18 22:24:01.802707
20	Subscription created	newuser	Subscription	2019-01-18 22:29:45.535533
21	Subscription canceled	roger85	Subscription	2019-01-18 22:38:04.393783
22	Subscription created	roger85	Subscription	2019-01-18 22:38:33.636131
23	Subscription canceled	roger85	Subscription	2019-01-18 22:45:19.2733
24	Subscription created	roger85	Subscription	2019-01-18 22:45:56.511178
25	Subscription canceled	roger85	Subscription	2019-01-18 22:52:44.167661
26	Subscription created	roger85	Subscription	2019-01-18 23:00:11.438192
27	Subscription canceled	roger85	Subscription	2019-01-19 00:03:48.554018
28	Subscription created	roger85	Subscription	2019-01-19 00:08:26.372032
29	Updated profile	payinguser	Account	2019-01-19 15:47:34.677854
30	Updated profile	niceuser	Account	2019-01-19 21:00:01.941083
31	Updated profile	niceuser	Account	2019-01-19 21:01:38.099884
32	Updated profile	niceuser	Account	2019-01-19 21:04:32.038701
33	Updated profile	niceuser	Account	2019-01-19 21:14:38.636029
34	Updated profile	niceuser	Account	2019-01-19 21:15:25.923705
35	Updated profile	niceuser	Account	2019-01-19 21:27:52.054121
36	Updated profile	niceuser	Account	2019-01-19 21:29:01.860371
37	Updated profile	niceuser	Account	2019-01-19 21:30:31.93401
38	Updated profile	niceuser	Account	2019-01-19 21:35:41.15056
39	Updated profile	niceuser	Account	2019-01-19 21:41:06.478049
40	Updated profile	niceuser	Account	2019-01-19 21:43:01.452184
41	Updated profile	niceuser	Account	2019-01-19 21:43:23.259182
42	Updated profile	niceuser	Account	2019-01-19 21:52:23.296965
43	Updated profile	niceuser	Account	2019-01-19 21:53:48.968393
44	Updated profile	niceuser	Account	2019-01-19 21:54:01.312548
46	Subscription renewed	roger85	Subscription	2019-01-20 00:53:47.659117
47	Subscription renewed	roger85	Subscription	2019-01-20 00:54:56.724906
48	Deleted a card	roger85	Payment	2019-01-20 00:57:08.509175
49	Deleted a card	roger85	Payment	2019-01-20 00:57:10.851992
50	Deleted a card	roger85	Payment	2019-01-20 00:57:13.412715
51	Subscription renewed	roger85	Subscription	2019-01-20 01:52:03.255527
52	Subscription renewed	roger85	Subscription	2019-01-20 02:21:57.439604
53	Updated profile	roger85	Account	2019-01-20 12:28:40.250662
54	Updated profile	roger85	Account	2019-01-20 12:33:31.210422
55	Updated profile	roger85	Account	2019-01-20 12:33:54.857386
56	Updated profile	roger85	Account	2019-01-20 12:37:31.183475
57	Updated profile	roger85	Account	2019-01-20 12:37:50.026476
58	Updated profile	roger85	Account	2019-01-20 12:46:17.767942
59	Updated profile	roger85	Account	2019-01-20 12:46:39.265513
60	Updated profile	roger85	Account	2019-01-20 13:09:38.138557
61	Updated profile	roger85	Account	2019-01-20 13:13:16.119849
62	Updated profile	roger85	Account	2019-01-20 13:13:22.423547
63	Updated profile	roger85	Account	2019-01-20 13:14:23.959703
64	Updated profile	roger85	Account	2019-01-20 13:14:29.51256
65	Updated profile	roger85	Account	2019-01-20 13:19:33.570826
66	Updated profile	roger85	Account	2019-01-20 13:19:53.364893
67	Updated profile	roger85	Account	2019-01-20 13:21:45.627289
68	Updated profile	roger85	Account	2019-01-20 13:21:48.713565
69	Updated profile	roger85	Account	2019-01-20 13:23:26.936695
70	Updated profile	roger85	Account	2019-01-20 13:24:53.792797
71	Updated profile	roger85	Account	2019-01-20 13:32:37.112808
72	Updated profile	roger85	Account	2019-01-20 13:34:50.418456
73	Added a card ending in 4444	roger85	Payment	2019-01-20 13:49:51.739048
74	Added a card ending in 0005	roger85	Payment	2019-01-20 13:53:12.733484
75	Added a card ending in 0005	roger85	Payment	2019-01-20 13:58:01.397232
76	Added a card ending in 0005	roger85	Payment	2019-01-20 13:59:39.536001
77	Added a card ending in 0005	roger85	Payment	2019-01-20 15:10:07.88944
78	Added a card ending in 4444	roger85	Payment	2019-01-20 15:20:18.752685
79	Deleted a card	roger85	Payment	2019-01-20 15:20:24.480269
80	Deleted a card	roger85	Payment	2019-01-20 15:20:26.932051
81	Deleted a card	roger85	Payment	2019-01-20 15:20:29.515367
82	Deleted a card	roger85	Payment	2019-01-20 15:20:32.979378
83	Added a card ending in 8431	roger85	Payment	2019-01-20 15:22:36.727037
84	Deleted a card	roger85	Payment	2019-01-20 15:23:21.821246
85	Account created	recruiter	Account	2019-02-03 19:33:46.471931
86	Purchased 30 Day Listing	recruiter	Purchase	2019-02-10 21:32:04.028133
87	Purchased 30 Day Listing	recruiter	Purchase	2019-02-10 21:38:25.958291
88	Purchased 30 Day Listing	recruiter	Purchase	2019-02-10 21:39:56.79515
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (announcement_id, announcement, announcement_start_date, announcement_end_date, announcer, announcement_created_date) FROM stdin;
8	this is from the past	2018-12-01	2018-12-31	roger85	2019-01-01 14:54:42.664947
10	For a limited time, all users can list for FREE!	2019-01-01	2019-03-31	roger85	2019-01-01 15:14:35.023851
13	Another announcement	2019-01-01	2019-01-31	roger85	2019-01-01 15:42:23.974089
14	This should appear	2019-01-01	2019-01-31	roger85	2019-01-01 15:58:23.09577
\.


--
-- Data for Name: appeal_abandoned_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appeal_abandoned_jobs (aa_id, appeal_abandoned_job_id, additional_info, appealed_on) FROM stdin;
\.


--
-- Data for Name: blocked_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocked_users (blocked_user_id, blocking_user, blocked_user, blocked_date) FROM stdin;
8	roger85	verifying_user	2019-02-01 22:46:51.818677
9	roger85	newuser	2019-02-01 22:47:00.992975
\.


--
-- Data for Name: business_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_hours (business_hour_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, for_listing) FROM stdin;
1	8am - 6pm	8am - 6pm	8am - 6pm	8am - 6pm	8am - 8pm	Closed	Closed	1
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (conversation_id, conversation_starter, conversation_recipient, conversation_date, conversation_status, conversation_subject) FROM stdin;
2	roger85	recruiter	2019-02-11 23:32:38.755107	Read	test
1	payinguser2	recruiter	2019-02-11 23:05:59.385908	Read	test
\.


--
-- Data for Name: deleted_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deleted_messages (deleted_msg_id, deleted_message, message_deleted_by, message_deleted_date) FROM stdin;
\.


--
-- Data for Name: dismissed_announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dismissed_announcements (dismissed_announcement, dismissed_by) FROM stdin;
14	roger85
13	roger85
10	roger85
\.


--
-- Data for Name: error_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.error_log (error_id, error, error_url, error_entry_date, error_occurrence) FROM stdin;
32	Error: Request failed with status code 404\n    at createError (webpack:///./node_modules/axios/lib/core/createError.js?:16:15)\n    at settle (webpack:///./node_modules/axios/lib/core/settle.js?:18:12)\n    at XMLHttpRequest.handleLoad (webpack:///./node_modules/axios/lib/adapters/xhr.js?:77:7)	/api/user/get/work-history	2019-01-30 18:58:18.313567	9
189	ReferenceError: jobs is not defined\n    at ViewUser.render (webpack:///./src/components/pages/ViewUser.js?:362:14)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/get/user	2019-02-01 20:16:30.600776	1
215	TypeError: Cannot read property 'length' of undefined\n    at ViewUserJobActivities (webpack:///./src/components/includes/page/ViewUserJobActivities.js?:22:19)\n    at mountIndeterminateComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13381:13)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13821:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)\n    at requestWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5)	/api/get/user	2019-02-01 20:53:45.304172	1
192	TypeError: Cannot read property 'map' of undefined\n    at ViewUserJobActivities (webpack:///./src/components/includes/page/ViewUserJobActivities.js?:21:24)\n    at mountIndeterminateComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13381:13)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13821:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)\n    at requestWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5)	/api/get/user	2019-02-01 20:16:51.066599	3
1	Error: User not found\n    at H:\\Projects\\mploy\\modules\\auth.js:194:37\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/auth/login	2019-01-29 20:14:29.665768	585
116	ReferenceError: i is not defined\n    at eval (webpack:///./src/components/includes/page/ViewUserWorkHistory.js?:196:16)\n    at Array.map (<anonymous>)\n    at ViewUserWorkHistory.render (webpack:///./src/components/includes/page/ViewUserWorkHistory.js?:185:28)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)	/api/get/user	2019-01-30 21:48:22.968723	1
141	Invariant Violation: Objects are not valid as a React child (found: object with keys {job_id, job_client, job_created_date, job_stage, job_user, job_status, job_subject, job_user_complete, job_client_complete, job_modified_date, job_listing_id, abandon_reason, job_end_date}). If you meant to render a collection of children, use an array instead.\n    in div (created by ViewUserWorkHistory)\n    in div (created by ViewUserWorkHistory)\n    in div (created by ViewUserWorkHistory)\n    in div (created by ViewUserWorkHistory)\n    in ViewUserWorkHistory (created by ViewUserProfile)\n    in div (created by ViewUserProfile)\n    in ViewUserProfile (created by ViewUser)\n    in div (created by TitledContainer)\n    in div (created by TitledContainer)\n    in TitledContainer (created by ViewUser)\n    in div (created by ViewUser)\n    in div (created by ViewUser)\n    in div (created by ViewUser)\n    in ViewUser (created by Connect(ViewUser))\n    in Connect(ViewUser) (created by Route)\n    in Route (created by withRouter(Connect(ViewUser)))\n    in withRouter(Connect(ViewUser)) (created by Route)\n    in div (created by Dashboard)\n    in section (created by Dashboard)\n    in Dashboard (created by Connect(Dashboard))\n    in Connect(Dashboard) (created by Route)\n    in Route (created by withRouter(Connect(Dashboard)))\n    in withRouter(Connect(Dashboard)) (created by Route)\n    in Route (created by App)\n    in Switch (created by App)\n    in div (created by App)\n    in App (created by Connect(App))\n    in Connect(App) (created by Route)\n    in Route (created by withRouter(Connect(App)))\n    in withRouter(Connect(App))\n    in Router (created by BrowserRouter)\n    in BrowserRouter\n    in Provider\n    at invariant (webpack:///./node_modules/fbjs/lib/invariant.js?:42:15)\n    at throwOnInvalidObjectType (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11899:5)\n    at createChild (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12110:7)\n    at reconcileChildrenArray (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12342:25)\n    at reconcileChildFibers (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12656:14)\n    at reconcileChildrenAtExpirationTime (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13024:28)\n    at reconcileChildren (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13007:3)\n    at updateFragment (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13063:3)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13839:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)	/api/get/user/work-history	2019-01-30 22:13:10.010692	0
20	TypeError: Cannot read property 'username' of undefined\n    at eval (webpack:///./src/components/pages/ViewUser.js?:145:45)	/api/get/user	2019-01-29 20:24:25.467772	5
44	TypeError: endYear.getUTCFullYear is not a function\n    at eval (webpack:///./src/components/includes/page/ViewUserWorkHistory.js?:73:30)	/api/get/user/work-history	2019-01-30 19:34:11.490155	0
76	TypeError: Cannot read property 'job_end_date' of undefined\n    at eval (webpack:///./src/components/includes/page/ViewUserWorkHistory.js?:81:57)	/api/get/user/work-history	2019-01-30 20:17:52.818037	0
228	ReferenceError: jobs is not defined\n    at eval (webpack:///./src/components/includes/page/ViewUserJobActivities.js?:45:19)\n    at Array.map (<anonymous>)\n    at ViewUserJobActivities (webpack:///./src/components/includes/page/ViewUserJobActivities.js?:28:21)\n    at mountIndeterminateComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13381:13)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13821:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)	/api/get/user	2019-02-01 21:22:37.985263	1
263	Error: Request failed with status code 500\n    at createError (webpack:///./node_modules/axios/lib/core/createError.js?:16:15)\n    at settle (webpack:///./node_modules/axios/lib/core/settle.js?:18:12)\n    at XMLHttpRequest.handleLoad (webpack:///./node_modules/axios/lib/adapters/xhr.js?:77:7)	/api/user/block	2019-02-01 22:43:25.991349	0
284	Invariant Violation: You must specify the "to" property\n    at invariant (webpack:///./node_modules/invariant/browser.js?:38:15)\n    at Link.render (webpack:///./node_modules/react-router-dom/es/Link.js?:78:53)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)	/api/auth/login	2019-02-03 15:29:36.799534	1
290	ReferenceError: messageCount is not defined\n    at SideBar.render (webpack:///./src/components/includes/site/SideBar.js?:163:30)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-03 15:33:12.88805	1
307	ReferenceError: faUserFriends is not defined\n    at SideBar.render (webpack:///./src/components/includes/site/SideBar.js?:204:15)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-03 15:43:18.572611	0
312	ReferenceError: MyListingRow is not defined\n    at eval (webpack:///./src/components/pages/MyListings.js?:126:75)\n    at Array.map (<anonymous>)\n    at MyListings.render (webpack:///./src/components/pages/MyListings.js?:125:38)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)	/api/get/user/listings	2019-02-03 18:19:56.714834	0
313	TypeError: Cannot read property 'user' of undefined\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:321:35)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/get/user/listings	2019-02-03 18:40:14.931186	0
314	TypeError: Cannot read property 'user' of undefined\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:322:35)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/get/user/listings	2019-02-03 18:40:29.376334	0
315	ReferenceError: Alert is not defined\n    at eval (webpack:///./src/components/pages/MyListings.js?:137:22)	/api/listing/renew	2019-02-03 19:20:35.009186	0
316	TypeError: _this3.props.dispatch is not a function\n    at eval (webpack:///./src/components/pages/MyListings.js?:139:22)	/api/listing/renew	2019-02-03 19:21:04.347645	0
319	Error: Your subscription has ended\n    at H:\\Projects\\mploy\\modules\\fetch\\listings.js:137:37\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/get/user/listings	2019-02-03 19:43:01.070298	2
322	Error: You're not subscribed\n    at H:\\Projects\\mploy\\modules\\fetch\\listings.js:143:37\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/get/user/listings	2019-02-03 19:48:03.926984	0
324	Invariant Violation: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.\n    at invariant (webpack:///./node_modules/fbjs/lib/invariant.js?:42:15)\n    at scheduleWork$1 (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16222:11)\n    at Object.enqueueSetState (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11300:5)\n    at ListSettings.Component.setState (webpack:///./node_modules/react/cjs/react.development.js?:270:16)\n    at ListSettings.setSetting (webpack:///./src/components/includes/page/ListSettings.js?:222:12)\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:285:25)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)	/api/auth/login	2019-02-03 22:12:30.544675	1
326	Error: You can only create one listing\n    at H:\\Projects\\mploy\\modules\\user\\listings.js:47:45\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/listing/create	2019-02-03 23:36:11.442874	0
327	error: INSERT has more target columns than expressions\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/listing/create	2019-02-03 23:36:41.235194	0
328	error: duplicate key value violates unique constraint "unique_listing"\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/listing/create	2019-02-03 23:38:36.334179	0
329	ReferenceError: NavLink is not defined\n    at MyListingRow.render (webpack:///./src/components/includes/page/MyListingRow.js?:100:140)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/get/user/listings	2019-02-04 00:29:23.527668	1
331	TypeError: Cannot read property 'user' of undefined\n    at MyListingRow.render (webpack:///./src/components/includes/page/MyListingRow.js?:103:45)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/get/user/listings	2019-02-04 00:30:14.484677	1
334	Error: Request failed with status code 504\n    at createError (webpack:///./node_modules/axios/lib/core/createError.js?:16:15)\n    at settle (webpack:///./node_modules/axios/lib/core/settle.js?:18:12)\n    at XMLHttpRequest.handleLoad (webpack:///./node_modules/axios/lib/adapters/xhr.js?:77:7)	/api/auth/login	2019-02-04 18:00:18.797863	17
337	error: syntax error at or near "WHERE"\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/get/user	2019-02-04 18:36:16.516295	0
343	error: bind message supplies 2 parameters, but prepared statement "" requires 1\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/get/user	2019-02-04 18:59:55.851673	1
346	Error: Cannot set business hours for this listing type\n    at H:\\Projects\\mploy\\modules\\user\\user.js:293:41\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/user/business_hours/save	2019-02-06 20:08:05.590266	0
347	TypeError: Cannot read property 'listing_title' of undefined\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:325:41)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-10 14:31:37.851892	0
348	TypeError: Cannot read property 'indexOf' of undefined\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:342:67)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-10 14:32:05.663367	1
350	TypeError: Cannot read property 'indexOf' of undefined\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:345:67)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-10 14:35:40.997279	0
351	TypeError: Cannot read property 'indexOf' of undefined\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:362:67)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-10 14:38:08.001796	0
352	TypeError: Cannot read property 'indexOf' of undefined\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:369:40)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-10 14:38:45.168711	1
354	ReferenceError: locationInput is not defined\n    at ListSettings.render (webpack:///./src/components/includes/page/ListSettings.js?:453:23)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-10 14:40:24.953998	0
619	error: column "job_end_date" does not exist\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/get/user	2019-02-14 02:01:09.95659	1
355	Invariant Violation: Objects are not valid as a React child (found: object with keys {sector_id, sector, sector_created_on, sector_created_by, sector_status}). If you meant to render a collection of children, use an array instead.\n    in select (created by ListSettings)\n    in div (created by InputWrapper)\n    in InputWrapper (created by Connect(InputWrapper))\n    in Connect(InputWrapper) (created by ListSettings)\n    in div (created by ListSettings)\n    in form (created by ListSettings)\n    in section (created by ListSettings)\n    in ListSettings (created by Connect(ListSettings))\n    in Connect(ListSettings) (created by Route)\n    in Route (created by withRouter(Connect(ListSettings)))\n    in withRouter(Connect(ListSettings)) (created by MyListing)\n    in div (created by TitledContainer)\n    in div (created by TitledContainer)\n    in TitledContainer (created by MyListing)\n    in section (created by MyListing)\n    in MyListing (created by Connect(MyListing))\n    in Connect(MyListing) (created by Route)\n    in Route (created by withRouter(Connect(MyListing)))\n    in withRouter(Connect(MyListing)) (created by Route)\n    in div (created by Dashboard)\n    in section (created by Dashboard)\n    in Dashboard (created by Connect(Dashboard))\n    in Connect(Dashboard) (created by Route)\n    in Route (created by withRouter(Connect(Dashboard)))\n    in withRouter(Connect(Dashboard)) (created by Route)\n    in Route (created by App)\n    in Switch (created by App)\n    in div (created by App)\n    in App (created by Connect(App))\n    in Connect(App) (created by Route)\n    in Route (created by withRouter(Connect(App)))\n    in withRouter(Connect(App))\n    in Router (created by BrowserRouter)\n    in BrowserRouter\n    in Provider\n    at invariant (webpack:///./node_modules/fbjs/lib/invariant.js?:42:15)\n    at throwOnInvalidObjectType (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11899:5)\n    at createChild (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12110:7)\n    at reconcileChildrenArray (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12342:25)\n    at reconcileChildFibers (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12656:14)\n    at reconcileChildrenAtExpirationTime (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13024:28)\n    at reconcileChildren (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13007:3)\n    at updateHostComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13341:3)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13829:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)	/api/get/sectors	2019-02-10 14:40:43.25865	2
358	Invariant Violation: Objects are not valid as a React child (found: object with keys {sector_id, sector, sector_created_on, sector_created_by, sector_status}). If you meant to render a collection of children, use an array instead.\n    in select (created by ListSettings)\n    in div (created by InputWrapper)\n    in InputWrapper (created by Connect(InputWrapper))\n    in Connect(InputWrapper) (created by ListSettings)\n    in div (created by ListSettings)\n    in form (created by ListSettings)\n    in section (created by ListSettings)\n    in ListSettings (created by Connect(ListSettings))\n    in Connect(ListSettings) (created by Route)\n    in Route (created by withRouter(Connect(ListSettings)))\n    in withRouter(Connect(ListSettings)) (created by MyListing)\n    in div (created by TitledContainer)\n    in div (created by TitledContainer)\n    in TitledContainer (created by MyListing)\n    in section (created by MyListing)\n    in MyListing (created by Connect(MyListing))\n    in Connect(MyListing) (created by Route)\n    in Route (created by withRouter(Connect(MyListing)))\n    in withRouter(Connect(MyListing)) (created by Route)\n    in div (created by Dashboard)\n    in section (created by Dashboard)\n    in Dashboard (created by Connect(Dashboard))\n    in Connect(Dashboard) (created by Route)\n    in Route (created by withRouter(Connect(Dashboard)))\n    in withRouter(Connect(Dashboard)) (created by Route)\n    in Route (created by App)\n    in Switch (created by App)\n    in div (created by App)\n    in App (created by Connect(App))\n    in Connect(App) (created by Route)\n    in Route (created by withRouter(Connect(App)))\n    in withRouter(Connect(App))\n    in Router (created by BrowserRouter)\n    in BrowserRouter\n    in Provider\n    at invariant (webpack:///./node_modules/fbjs/lib/invariant.js?:42:15)\n    at throwOnInvalidObjectType (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11899:5)\n    at createChild (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12110:7)\n    at reconcileChildrenArray (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12342:25)\n    at reconcileChildFibers (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12656:14)\n    at reconcileChildrenAtExpirationTime (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13016:28)\n    at reconcileChildren (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13007:3)\n    at updateHostComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13341:3)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13829:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)	/api/auth/login	2019-02-10 14:43:14.09435	0
359	ReferenceError: SlideToggle is not defined\n    at ListSettings.render (webpack:///./src/components/pages/ListSettings.js?:290:84)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-10 15:12:27.271853	0
361	ReferenceError: UpdateUser is not defined\n    at eval (webpack:///./src/components/pages/ListSettings.js?:207:26)	/api/listing/toggle	2019-02-10 15:16:53.396259	0
370	error: column "listing_purpose" does not exist\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/user/business_hours/save	2019-02-10 17:03:29.002717	1
372	error: column "business_owner" of relation "business_hours" does not exist\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/user/settings/change	2019-02-10 17:14:41.336616	0
373	Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client\n    at ServerResponse.setHeader (_http_outgoing.js:471:11)\n    at ServerResponse.header (H:\\Projects\\mploy\\node_modules\\express\\lib\\response.js:767:10)\n    at ServerResponse.send (H:\\Projects\\mploy\\node_modules\\express\\lib\\response.js:170:12)\n    at ServerResponse.json (H:\\Projects\\mploy\\node_modules\\express\\lib\\response.js:267:15)\n    at ServerResponse.send (H:\\Projects\\mploy\\node_modules\\express\\lib\\response.js:158:21)\n    at client.query.then (H:\\Projects\\mploy\\modules\\user\\user.js:425:38)\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/user/subscription/add	2019-02-10 21:07:54.145628	0
375	ReferenceError: StaticAlert is not defined\n    at ListSettings.render (webpack:///./src/components/pages/ListSettings.js?:296:79)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-10 21:59:26.556448	0
377	Error: That listing does not exist\n    at H:\\Projects\\mploy\\modules\\fetch\\user.js:113:37\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/get/user	2019-02-10 23:31:41.906455	1
360	Error: Network Error\n    at createError (webpack:///./node_modules/axios/lib/core/createError.js?:16:15)\n    at XMLHttpRequest.handleError (webpack:///./node_modules/axios/lib/adapters/xhr.js?:87:14)	/api/listing/toggle	2019-02-10 15:16:14.976775	11
379	ReferenceError: faTimes is not defined\n    at Inquiries.render (webpack:///./src/components/pages/Inquiries.js?:504:46)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-11 01:24:29.27445	1
391	error: column "job_stage" does not exist\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/get/user	2019-02-11 19:21:03.255517	1
393	error: null value in column "message_job_id" violates not-null constraint\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/message/submit	2019-02-11 19:38:02.561047	2
396	TypeError: Cannot read property 'messages' of undefined\n    at new MessageDetails (webpack:///./src/components/pages/MessageDetails.js?:84:33)\n    at constructClassInstance (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11448:18)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13145:7)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-11 20:29:24.784348	0
397	Invariant Violation: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.\n\nCheck the render method of `Messages`.\n    at invariant (webpack:///./node_modules/fbjs/lib/invariant.js?:42:15)\n    at getFiberTagFromObjectType (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:9767:9)\n    at createFiberFromElement (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:9727:20)\n    at createChild (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12091:28)\n    at reconcileChildrenArray (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12342:25)\n    at reconcileChildFibers (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12656:14)\n    at reconcileChildrenAtExpirationTime (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13016:28)\n    at reconcileChildren (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13007:3)\n    at updateHostComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13341:3)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13829:14)	/api/auth/login	2019-02-11 20:30:47.580565	0
398	ReferenceError: MessageSender is not defined\n    at MessageDetails.render (webpack:///./src/components/pages/MessageDetails.js?:49:69)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-11 20:33:55.837588	0
401	error: column "message_sender" does not exist\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/get/message	2019-02-11 21:10:20.211446	0
402	TypeError: Cannot read property 'allow_messaging' of undefined\n    at H:\\Projects\\mploy\\modules\\message\\messages.js:23:50\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/message/submit	2019-02-11 21:39:23.767989	1
404	TypeError: Cannot read property 'allow_messaging' of undefined\n    at H:\\Projects\\mploy\\modules\\message\\messages.js:25:50\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/message/submit	2019-02-11 21:41:25.439537	0
405	TypeError: Cannot read property 'message_subject' of undefined\n    at MessageDetails.render (webpack:///./src/components/pages/MessageDetails.js?:146:74)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/message/submit	2019-02-11 21:49:17.862247	0
415	createError@webpack:///./node_modules/axios/lib/core/createError.js?:16:15\nsettle@webpack:///./node_modules/axios/lib/core/settle.js?:18:12\nhandleLoad@webpack:///./node_modules/axios/lib/adapters/xhr.js?:77:7\n	/api/get/message	2019-02-11 23:33:01.6533	0
417	error: null value in column "conversation_recipient" violates not-null constraint\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/message/submit	2019-02-11 23:40:52.335769	0
408	error: invalid input syntax for integer: "{}"\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/get/message	2019-02-11 22:11:08.235597	3
418	render/messages<@webpack:///./src/components/pages/Messages.js?:294:13\nrender@webpack:///./src/components/pages/Messages.js?:276:24\nfinishClassComponent@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:22\nupdateClassComponent@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10\nbeginWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14\nperformUnitOfWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12\nworkLoop@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24\nrenderRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7\nperformWorkOnRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22\nperformWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7\nperformSyncWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3\nrequestWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5\nscheduleWork$1@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16219:11\nenqueueSetState@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11300:5\nComponent.prototype.setState@webpack:///./node_modules/react/cjs/react.development.js?:270:3\ncomponentDidMount/<@webpack:///./src/components/pages/Messages.js?:156:11\nrun@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:75:22\nnotify/<@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:92:30\nflush@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/_microtask.js?:18:9\n	/api/get/messages/all	2019-02-11 23:48:11.768297	1
419	TypeError: Cannot read property 'conversation_id' of null\n    at eval (webpack:///./src/components/pages/Messages.js?:294:55)\n    at Array.map (<anonymous>)\n    at Messages.render (webpack:///./src/components/pages/Messages.js?:276:44)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)	/api/get/messages/all	2019-02-11 23:48:12.393448	1
422	render/messages<@webpack:///./src/components/pages/Messages.js?:293:13\nrender@webpack:///./src/components/pages/Messages.js?:274:24\nfinishClassComponent@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:22\nupdateClassComponent@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10\nbeginWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14\nperformUnitOfWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12\nworkLoop@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24\nrenderRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7\nperformWorkOnRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22\nperformWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7\nperformSyncWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3\nrequestWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5\nscheduleWork$1@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16219:11\nenqueueSetState@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11300:5\nComponent.prototype.setState@webpack:///./node_modules/react/cjs/react.development.js?:270:3\ncomponentDidMount/<@webpack:///./src/components/pages/Messages.js?:156:11\nrun@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:75:22\nnotify/<@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:92:30\nflush@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/_microtask.js?:18:9\n	/api/get/messages/all	2019-02-11 23:50:01.385913	0
423	TypeError: Cannot read property 'conversation_id' of null\n    at eval (webpack:///./src/components/pages/Messages.js?:293:55)\n    at Array.map (<anonymous>)\n    at Messages.render (webpack:///./src/components/pages/Messages.js?:274:44)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)	/api/get/messages/all	2019-02-11 23:50:02.173259	0
426	Error: You're not authorized\n    at H:\\Projects\\mploy\\modules\\fetch\\messages.js:145:37\n    at process._tickCallback (internal/process/next_tick.js:68:7)	/api/get/message	2019-02-11 23:51:58.250417	3
428	componentDidMount@webpack:///./src/components/pages/MessageDetails.js?:73:9\ncommitLifeCycles@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:14362:13\ncommitAllLifeCycles@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15463:7\ncallCallback@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:100:9\ninvokeGuardedCallbackDev@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:138:7\ninvokeGuardedCallback@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:187:5\ncommitRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15604:7\ncompleteRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16619:34\nperformWorkOnRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16564:9\nperformWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7\nperformSyncWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3\nrequestWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5\nscheduleWork$1@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16219:11\nenqueueSetState@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11300:5\nComponent.prototype.setState@webpack:///./node_modules/react/cjs/react.development.js?:270:3\nonStateChange@webpack:///./node_modules/react-redux/es/components/connectAdvanced.js?:215:11\ndispatch@webpack:///./node_modules/redux/es/redux.js?:229:7\ncreateThunkMiddleware/</</<@webpack:///./node_modules/redux-thunk/es/index.js?:12:16\ndispatch@webpack:///./node_modules/redux/es/redux.js?:571:18\nGetSession/</<@webpack:///./src/actions/FetchActions.js?:18:9\nrun@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:75:22\nnotify/<@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:92:30\nflush@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/_microtask.js?:18:9\n	/api/auth/login	2019-02-11 23:52:19.969216	1
311	Error: A cross-origin error was thrown. React doesn't have access to the actual error object in development. See https://fb.me/react-crossorigin-error for more information.\n    at Object.invokeGuardedCallbackDev (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:145:19)\n    at invokeGuardedCallback (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:187:29)\n    at commitRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15604:7)\n    at completeRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16619:34)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16564:9)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)\n    at requestWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5)\n    at scheduleWork$1 (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16219:11)\n    at Object.enqueueSetState (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11300:5)	/api/auth/login	2019-02-03 18:17:39.065876	2
434	TypeError: Cannot read property 'conversation_subject' of undefined\n    at MessageDetails.render (webpack:///./src/components/pages/MessageDetails.js?:146:75)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/get/message	2019-02-11 23:57:29.68413	0
436	error: there is no parameter $1\n    at Connection.parseE (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:553:11)\n    at Connection.parseMessage (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:378:19)\n    at Socket.<anonymous> (H:\\Projects\\mploy\\node_modules\\pg\\lib\\connection.js:119:22)\n    at Socket.emit (events.js:182:13)\n    at addChunk (_stream_readable.js:283:12)\n    at readableAddChunk (_stream_readable.js:264:11)\n    at Socket.Readable.push (_stream_readable.js:219:10)\n    at TCP.onread (net.js:638:20)	/api/message/reply	2019-02-12 00:00:24.799943	0
437	invariant@webpack:///./node_modules/fbjs/lib/invariant.js?:42:15\ngetFiberTagFromObjectType@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:9767:9\ncreateFiberFromElement@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:9727:20\ncreateChild@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12091:28\nreconcileChildrenArray@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12342:25\nreconcileChildFibers@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12656:14\nreconcileChildrenAtExpirationTime@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13016:28\nreconcileChildren@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13007:3\nupdateHostComponent@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13341:3\nbeginWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13829:14\nperformUnitOfWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12\nworkLoop@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24\nrenderRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7\nperformWorkOnRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22\nperformWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7\nperformSyncWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3\nrequestWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5\nscheduleWork$1@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16219:11\nenqueueSetState@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11300:5\nComponent.prototype.setState@webpack:///./node_modules/react/cjs/react.development.js?:270:3\nonStateChange@webpack:///./node_modules/react-redux/es/components/connectAdvanced.js?:215:11\ndispatch@webpack:///./node_modules/redux/es/redux.js?:229:7\ncreateThunkMiddleware/</</<@webpack:///./node_modules/redux-thunk/es/index.js?:12:16\ndispatch@webpack:///./node_modules/redux/es/redux.js?:571:18\nGetSession/</<@webpack:///./src/actions/FetchActions.js?:18:9\nrun@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:75:22\nnotify/<@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:92:30\nflush@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/_microtask.js?:18:9\n	/api/auth/login	2019-02-12 00:11:21.410128	0
438	Invariant Violation: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.\n\nCheck the render method of `Route`.\n    at invariant (webpack:///./node_modules/fbjs/lib/invariant.js?:42:15)\n    at getFiberTagFromObjectType (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:9767:9)\n    at createFiberFromElement (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:9727:20)\n    at createChild (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12091:28)\n    at reconcileChildrenArray (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12342:25)\n    at reconcileChildFibers (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:12656:14)\n    at reconcileChildrenAtExpirationTime (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13016:28)\n    at reconcileChildren (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13007:3)\n    at updateHostComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13341:3)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13829:14)	/api/auth/login	2019-02-12 00:11:22.219763	0
439	render@webpack:///./src/components/includes/page/ConversationRow.js?:127:9\nfinishClassComponent@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:22\nupdateClassComponent@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10\nbeginWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14\nperformUnitOfWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12\nworkLoop@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24\nrenderRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7\nperformWorkOnRoot@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22\nperformWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7\nperformSyncWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3\nrequestWork@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5\nscheduleWork$1@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16219:11\nenqueueSetState@webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11300:5\nComponent.prototype.setState@webpack:///./node_modules/react/cjs/react.development.js?:270:3\ncomponentDidMount/<@webpack:///./src/components/pages/Conversations.js?:159:11\nrun@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:75:22\nnotify/<@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/es6.promise.js?:92:30\nflush@webpack:///./node_modules/babel-polyfill/node_modules/core-js/modules/_microtask.js?:18:9\n	/api/get/messages/all	2019-02-12 00:35:21.036616	0
440	TypeError: Cannot read property 'review' of null\n    at ConversationRow.render (webpack:///./src/components/includes/page/ConversationRow.js?:127:31)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/get/messages/all	2019-02-12 00:35:21.789126	0
625	TypeError: Cannot read property 'stripe_connect_acct_id' of undefined\n    at ViewUser.render (webpack:///./src/components/pages/ViewUser.js?:591:85)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/get/user	2019-02-14 11:51:44.499516	0
643	TypeError: Cannot read property 'user' of undefined\n    at NotConnected (webpack:///./src/components/includes/page/NotConnected.js?:35:23)\n    at mountIndeterminateComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13381:13)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13821:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)\n    at requestWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5)	/api/auth/login	2019-02-14 18:10:16.291393	1
654	ReferenceError: code is not defined\n    at NotConnected (webpack:///./src/components/includes/page/NotConnected.js?:91:43)\n    at mountIndeterminateComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13381:13)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13821:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)\n    at requestWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16355:5)	/api/auth/login	2019-02-14 18:19:08.58969	0
663	ReferenceError: props is not defined\n    at NotConnected.render (webpack:///./src/components/includes/page/NotConnected.js?:87:16)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-14 19:59:50.115156	0
665	TypeError: Cannot read property 'props' of undefined\n    at new NotConnected (webpack:///./src/components/includes/page/NotConnected.js?:45:93)\n    at constructClassInstance (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:11448:18)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13145:7)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-14 20:00:50.8073	0
667	ReferenceError: days is not defined\n    at NotConnected.render (webpack:///./src/components/includes/page/NotConnected.js?:131:10)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-14 20:01:08.494542	0
670	ReferenceError: months is not defined\n    at NotConnected.render (webpack:///./src/components/includes/page/NotConnected.js?:109:10)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-14 20:03:54.136514	0
688	ReferenceError: years is not defined\n    at NotConnected.render (webpack:///./src/components/includes/page/NotConnected.js?:148:10)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-14 20:32:21.16852	0
717	TypeError: this.state.dobYear.reverse is not a function\n    at NotConnected.render (webpack:///./src/components/includes/page/NotConnected.js?:211:35)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-14 22:49:38.70249	0
731	ReferenceError: SubmitButton is not defined\n    at NotConnected.render (webpack:///./src/components/includes/page/NotConnected.js?:319:71)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)\n    at performWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16483:7)\n    at performSyncWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16455:3)	/api/auth/login	2019-02-14 23:19:04.979139	0
735	TypeError: Cannot read property 'user' of undefined\n    at eval (webpack:///./src/components/includes/site/SideBar.js?:266:35)\n    at Array.map (<anonymous>)\n    at Link.render (webpack:///./src/components/includes/site/SideBar.js?:264:37)\n    at finishClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13194:31)\n    at updateClassComponent (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13156:10)\n    at beginWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:13825:14)\n    at performUnitOfWork (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15864:12)\n    at workLoop (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15903:24)\n    at renderRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:15943:7)\n    at performWorkOnRoot (webpack:///./node_modules/react-dom/cjs/react-dom.development.js?:16561:22)	/api/auth/login	2019-02-14 23:24:56.962157	3
\.


--
-- Data for Name: friends; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friends (friend_id, friend_user_1, friend_user_2, became_friend_on) FROM stdin;
1	niceuser	roger85	2019-01-25 18:00:34.763282
2	niceuser	payinguser	2019-01-26 20:57:07.352972
4	niceuser	newuser	2019-01-26 21:25:00.181404
12	roger85	verifying_user	2019-02-01 22:22:39.545052
\.


--
-- Data for Name: job_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_messages (job_message_id, job_message_creator, job_message, job_message_date, job_message_parent_id, job_message_status) FROM stdin;
\.


--
-- Data for Name: job_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_milestones (milestone_id, milestone_job_id, milestone_payment_amount, milestone_due_date, milestone_status) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (job_id, job_description, job_total_price, job_price_currency, job_user, job_client, job_offered_date, job_end_date, job_status) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (message_id, message_date, message_status, message_creator, message_conversation_id, message_body) FROM stdin;
2	2019-02-11 23:32:38.755107	Read	roger85	2	test
3	2019-02-12 00:01:01.463994	Read	recruiter	2	test
4	2019-02-12 00:02:56.415492	Read	recruiter	2	test
5	2019-02-12 00:03:02.176276	Read	recruiter	2	testing
6	2019-02-12 00:04:02.017644	Read	roger85	2	lalala
7	2019-02-12 00:04:03.367155	Read	roger85	2	test
8	2019-02-12 00:04:05.431807	Read	roger85	2	hi
1	2019-02-11 23:05:59.385908	Read	payinguser2	1	test
9	2019-02-12 00:10:24.446168	Read	recruiter	1	falalalalala
\.


--
-- Data for Name: milestone_conditions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.milestone_conditions (condition_id, condition_parent_id, condition, condition_status) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, notification_recipient, notification_message, notification_date, notification_status, notification_type) FROM stdin;
5	roger85	You received an offer from <strong><u>niceuser</u></strong>	2019-01-19 03:14:41.603086	Viewed	Update
1	roger85	You received an offer from <strong>niceuser</strong>	2019-01-19 02:35:40.695505	Viewed	Update
2	roger85	You received an offer from <strong>niceuser</strong>	2019-01-19 02:42:15.208341	Viewed	Update
3	roger85	You received an offer from <strong><u>niceuser</u></strong>	2019-01-19 02:51:02.195734	Viewed	Update
4	roger85	You received an offer from <strong><u>niceuser</u></strong>	2019-01-19 02:51:42.319706	Viewed	Update
\.


--
-- Data for Name: pinned_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pinned_jobs (pinned_id, pinned_job, pinned_by, pinned_date) FROM stdin;
\.


--
-- Data for Name: pinned_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pinned_messages (pinned_msg_id, pinned_message, message_pinned_by, message_pinned_date) FROM stdin;
1	2	recruiter	2019-02-12 00:17:07.11805
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (promo_id, promo_name, promo_created_date, promo_effective_start_date, promo_effective_end_date, promo_description, promo_status, promo_code) FROM stdin;
1	30 Days Free	2018-10-21 01:59:42.215788	2018-10-21 01:59:42.215788	2019-01-19 02:00:43.120941	Use promo code 30DAYSFREE when subscribing to Listing plan to get 30 days free listing	Inactive	30DAYSFREE
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (report_id, reporter, report_type, report_from_url, report_date, report_status, reported_user, reported_id) FROM stdin;
1	roger85	Listing	/user/recruiter/9	2019-02-04 19:11:02.758323	Pending	recruiter	9
2	payinguser	Listing	/user/recruiter/9	2019-02-04 19:15:58.979109	Pending	recruiter	9
\.


--
-- Data for Name: sectors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sectors (sector_id, sector, sector_created_on, sector_created_by, sector_status) FROM stdin;
1	Artists	2018-08-18 18:26:59.643187	roger85	Open
29	Test sector	2018-11-11 01:19:01.513615	roger85	Delete
22	Securities	2018-10-18 00:33:57.326352	roger85	Close
30	Agencies	2019-01-26 22:15:21.38939	roger85	Open
3	Childcare	2018-08-18 18:33:15.651602	roger85	Open
4	Consultants	2018-08-18 18:34:29.557034	roger85	Open
6	Designers	2018-08-18 19:14:07.729477	roger85	Open
8	Events	2018-08-18 19:28:43.895477	roger85	Open
10	Homecare	2018-08-18 19:30:51.982557	roger85	Open
11	Laborers	2018-08-18 19:30:58.551267	roger85	Open
12	Personal	2018-08-18 19:31:00.358812	roger85	Open
13	Petcare	2018-08-18 19:31:02.62453	roger85	Open
14	Repairs	2018-08-18 19:32:41.14234	roger85	Open
2	Performers	2018-08-18 18:31:31.423495	roger85	Open
16	Financial	2018-10-18 00:13:33.35273	roger85	Open
17	Scribblers	2018-10-18 00:16:40.482861	roger85	Open
19	Legal	2018-10-18 00:24:28.621033	roger85	Open
20	Maritime	2018-10-18 00:30:54.736656	roger85	Open
21	Marketing	2018-10-18 00:33:53.647089	roger85	Open
9	Healthcare	2018-08-18 19:30:41.136696	roger85	Open
5	Transporation	2018-08-18 19:11:54.167937	roger85	Open
15	Trainers	2018-08-18 19:32:43.436103	roger85	Open
7	Info Tech	2018-08-18 19:15:23.92253	roger85	Open
\.


--
-- Data for Name: site_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_configs (config_id, config_name, config_status) FROM stdin;
2	Registration	Active
3	Subscription	Active
1	Site	Inactive
\.


--
-- Data for Name: site_review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_review (site_review_id, reviewer, rating, review_date) FROM stdin;
1	payinguser2	1	2018-12-17 23:00:30.017387
2	payinguser2	1	2018-12-17 23:00:46.239501
3	payinguser2	5	2018-12-17 23:01:31.19391
4	payinguser2	5	2018-12-17 23:14:28.657526
5	payinguser2	5	2018-12-17 23:18:09.590719
6	roger85	5	2018-12-23 18:51:57.561724
7	niceuser	5	2018-12-27 16:39:50.894419
8	roger85	5	2019-01-18 00:46:16.784073
9	payinguser	5	2019-01-18 22:23:48.774926
10	roger85	5	2019-01-18 22:38:05.558737
11	roger85	5	2019-01-18 22:45:20.272688
12	roger85	5	2019-01-18 22:52:45.156831
13	roger85	5	2019-01-19 00:03:50.226399
\.


--
-- Data for Name: user_bans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_bans (ban_id, banned_user, banned_by, ban_reason, ban_type, ban_start_date, ban_end_date) FROM stdin;
1	douchebag	roger85	you're a douche	Temporary	2018-11-27 18:14:08.325374	2018-12-04 18:14:08.332
3	douchebag	roger85	your'e a douche	Temporary	2018-11-27 18:43:17.125292	2019-01-26 18:43:17.131
4	douchebag	roger85	test	Temporary	2018-12-01 22:53:20.439117	2019-03-01 22:53:20.442
\.


--
-- Data for Name: user_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_listings (listing_id, listing_user, listing_created_date, listing_sector, listing_price, listing_price_type, listing_price_currency, listing_negotiable, listing_detail, listing_status, listing_renewed_date, listing_title, listing_local, listing_remote) FROM stdin;
9	verifying_user	2019-02-10 16:05:41.685112	Financial	23	Hour	CAD	f	test	Inactive	2019-02-10 16:05:41.685112	test	f	t
10	payinguser2	2019-02-10 22:12:48.759059	Financial	52	Hour	CAD	f	test	Inactive	2019-02-10 22:12:48.759059	I need work!	f	t
1	recruiter	2019-02-10 15:09:20.500209	Financial	23	Hour	USD	t	test	Active	2019-02-10 15:09:20.500209	looking for work	t	t
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (user_profile_id, user_firstname, user_lastname, avatar_url, user_title, user_education, user_bio, user_github, user_twitter, user_facebook, user_website, user_linkedin, user_instagram, user_city, user_region, user_country, user_business_name, user_worldwide, user_phone, user_address, user_city_code) FROM stdin;
25	Helen	Wu	/user_files/25/profile_pic_1549914732095.jpg	Human Resource Director	\N	\N	\N	\N	https://www.facebook.com	\N	\N	\N	Fayetteville	AR	US	Some Financial Company That Hires BEST	\N	\N	\N	\N
3	Steve	Lilliac	/images/profile.png	Renovator	\N	\N	\N	\N	\N	\N	\N	\N	Denver	CO	US	\N	\N	\N	\N	\N
2	Mandy	White	/user_files/2/profile_pic_1547091942074.jpg	Florist	\N	\N	github.com	\N	https://facebook.com	subdomain.example.com/url/app/index.html	\N	\N	Vancouver	BC	CA	BC's #1	\N	1234567890	3475 E 27th Ave	V5R1P8
1	Roger	Chin	/user_files/1/profile_pic_1546591409554.jpg	Full Stack Web Developer	BCIT	Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda ullam repellat maiores aperiam debitis iure, repudiandae maxime pariatur nam rerum quasi numquam aliquid illo temporibus amet officiis, veritatis ipsum? Illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur similique quae tenetur repellat earum voluptate, reiciendis doloribus. Pariatur atque porro sunt autem quod harum soluta necessitatibus tempora hic. Molestias, harum! Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic molestiae nihil, optio accusantium repellat ex cupiditate commodi similique facere minus maxime explicabo dolorum neque veniam corrupti ipsa debitis. Pariatur, necessitatibus. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus voluptatem, a molestias aperiam obcaecati doloribus harum veritatis suscipit asperiores hic exercitationem molestiae aliquid soluta minima! Laborum placeat saepe dolores! Enim.			https://www.facebook.com	https://www.rogerchin.me	https://www.linkedin.com	https://instagram.com	Tijuana	BC	MX	RC Web Development	\N			
23	anon	anon	/images/profile.png	none	\N	\N	\N	\N	\N	\N	\N	\N	Kelowna	BC	CA	\N	\N	\N	\N	\N
21	Abdu	Amar	/user_files/21/profile_pic_1547710686084.jpg	Auto Mechanic	\N	\N	\N	\N	\N	\N	\N	\N	Stamford	CT	US	Best of the best	\N	1326592629	somehwere in mexico	25251
22	Abu	Shakira	/user_files/22/profile_pic.jpg	Gigolo	\N	\N	\N	\N	\N	\N	\N	\N	New Orleans	LA	US	\N	\N	249-295-2952	249 Horny Rd.	25251
20	Mike	Cruz	/user_files/20/profile_pic.jpg	Realtor	\N	\N	\N	\N	\N	\N	\N	\N	Winnipeg	MB	CA	\N	\N	\N	1460 Cliveden Ave	V3M 6L9
24	Lisa	Dorm	/images/profile.png	Accountant	\N	\N	\N	\N	\N	\N	\N	\N	Vancouver	BC	CA	\N	\N	\N	\N	\N
\.


--
-- Data for Name: user_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_reviews (review_id, reviewer, review_token, review_date, token_status, reviewing, review, review_rating, review_modified_date, review_job_id, review_status, review_list_id) FROM stdin;
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_settings (user_setting_id, hide_email, display_fullname, email_notifications, allow_messaging, display_business_hours) FROM stdin;
3	f	f	f	t	f
20	f	f	f	t	f
22	f	f	f	t	f
23	f	f	f	t	f
21	t	f	f	f	f
24	f	f	f	t	f
2	f	f	f	t	f
1	f	f	\N	t	t
25	f	f	f	t	f
\.


--
-- Data for Name: user_view_count; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_view_count (viewing_user, view_count) FROM stdin;
roger85	2797
niceuser	75
payinguser	24
newuser	3
payinguser2	13
recruiter	745
\.


--
-- Data for Name: user_warnings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_warnings (warning_id, warning, warning_date, warned_by, warned_user) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, user_password, user_email, user_created_on, user_status, account_type, user_this_login, user_last_login, user_level, registration_key, reg_key_expire_date, is_subscribed, stripe_id, subscription_id, subscription_end_date, plan_id, connected_id) FROM stdin;
24	verifying_user	$2b$10$mdrAcnWlyF89vYOn/CO6l.bIdWA2C5939T5aakeVqA29XvKW68.5u	lisa@dorm.com	2019-01-01 17:15:52.193159	Active	User	2019-02-10 16:05:18.260925	2019-01-27 16:28:01.281	0	U2FsdGVkX1/Ci3wPrg4/4OY8uGzzf+3I+k9OdFUZ4OU=	2019-01-02 17:15:52.193159	f	\N	\N	\N	\N	\N
20	newuser	$2b$10$mQXOh6TuVzEO3v/56fl6HOXVEKMMjqIghQQkyw6wYS6GYxQn5cWWC	rogerchin1985@gmail.com	2018-12-02 20:05:19.148015	Active	Listing	2019-01-26 21:08:08.177317	2019-01-18 22:27:15.557	0	U2FsdGVkX185kxIsRVDrXGUlAZFk3zXvinsVonujB9riZaVAd5LaXH53vlmrfuLQ	2018-12-03 23:31:56.334803	t	cus_EMxFYVk9JDNnI1	sub_EMxFbNyCEFXUvy	2019-02-19 22:29:44.122123	plan_EAIyF94Yhy1BLB	\N
23	cannot_register	$2b$10$DT1jYcUlwte1RBRrPMkdx.RSQOkmOZ6QU.xQmwbArzOLXUODp7jJa	anon@anon.com	2018-12-16 18:04:41.926394	Active	User	\N	\N	0	U2FsdGVkX1/O89RMv8T3RHFvTYW6+NZ/Pv0MUehg7hU=	2018-12-17 18:04:41.926394	f	\N	\N	\N	\N	\N
22	payinguser2	$2b$10$rXQ2jPkBYPkQ6fg4TXlFwOtgqGPkEwr/yeiur1fobItj9YhkaYv6a	abu201812@gmail.com	2018-12-16 17:46:16.080273	Active	User	2019-02-13 14:10:23.101423	2019-02-10 22:10:16.958	0	U2FsdGVkX1/QEnxnzz2nlxbNWdpVjUx4OxN9ox4sM7ONqjYCwwMEZDQflYlAVuq8	2018-12-17 17:46:16.080273	t	cus_EAzF9Bk1S30kh5	\N	2019-01-18 23:45:36.127497	\N	\N
3	douchebag	$2b$10$5ky8eb0ckcJmaPwAu7Edbuk7FeFb7jo5hR161iHHikF9sXfUSvEZu	steve-lilliac@fakegmail.com	2018-11-26 17:30:25.600295	Suspend	User	2019-01-27 16:24:51.572683	2018-12-01 22:44:42.49	0	U2FsdGVkX1/LD8prWMMkru7R1tzxYopXrGPZThObFFh1gWwkiuCDI0/t2GY7SVPD	2018-11-27 17:30:25.600295	f	\N	\N	\N	\N	\N
21	payinguser	$2b$10$3aLCXj5lgpa9vousmAfbjebV5gPezvQcm/rxgUPv/Pr/ngFQ0h9BK	abdu1010101@gmail.com	2018-12-16 17:38:35.540182	Active	Listing	2019-02-03 21:29:07.26426	2019-02-03 15:56:18.222	0	U2FsdGVkX1+6DNiBk2FLpJN2XPVH9XSbc763n2DLsoq9TtdDYNS47HA2W+3vaPzZ	2018-12-17 17:38:35.540182	t	cus_EMEzAuIunqX21Q	sub_EMx9Ylr7SqSu3A	2019-02-18 00:45:46.409879	plan_EAIyF94Yhy1BLB	\N
2	niceuser	$2b$10$Wr/A4rJtpLIt6Kv2oCaNGetM79eFNF/49QAf1ul2/FofapOD8JiDK	niceuser@nice.com	2018-11-24 22:58:15.672353	Active	User	2019-02-04 19:00:49.825464	2019-02-01 16:37:15.988	0	U2FsdGVkX18uQ845PC7lKh2iZ1Fha91xaQNLUdh7UMAg4N5O13PEZ6dcmtfLvuK6	2018-11-25 22:58:15.672353	t	cus_EEFj0YW9924tr0	\N	2019-01-27 17:00:16.278834	\N	\N
1	roger85	$2b$10$z4XMgEDiFmDSJyD/zOSyiO7deH9Ql1.J/DlklBisM2LwC/e002QqO	rogerchin85@gmail.com	2018-11-15 22:36:02.429469	Active	Listing	2019-02-14 23:08:27.06689	2019-02-11 22:21:30.07	99	U2FsdGVkX19MYpIksa3zVa8PVfGmsjtSQ0qTldysg1mKm1hFTsUASJmOBC8MK7L5	2018-11-16 22:38:35.385272	t	cus_EBGVDMBmNoyQnx	sub_EMyqlbrc0JrgmU	2019-04-19 22:21:00	plan_EAIyF94Yhy1BLB	\N
25	recruiter	$2b$10$48zcexgfJMtsBUjcEoRdIOPFppRqRprFnwbLBA5mRVlfnBxHm7UK6	helen.wu@hrdirectorhaha.com	2019-02-03 19:33:46.399892	Active	User	2019-02-10 16:17:43.501233	2019-02-03 19:41:55.154	0	U2FsdGVkX1+9HhlHzJay0DJMpQduTNNKZwJ1KIJTYGX66SYB9JmUasGycZGI36tm	2019-02-04 19:33:46.399892	f	\N	\N	2019-03-12 21:39:56.79515	\N	\N
\.


--
-- Name: activities_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activities_activity_id_seq', 88, true);


--
-- Name: announcements_annoucement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_annoucement_id_seq', 14, true);


--
-- Name: appeal_abandoned_jobs_aa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appeal_abandoned_jobs_aa_id_seq', 1, false);


--
-- Name: blocked_users_blocked_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blocked_users_blocked_user_id_seq', 16, true);


--
-- Name: business_hours_business_hour_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_hours_business_hour_id_seq', 2, true);


--
-- Name: conversations_conversation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversations_conversation_id_seq', 3, true);


--
-- Name: deleted_messages_deleted_msg_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deleted_messages_deleted_msg_id_seq', 1, false);


--
-- Name: error_log_error_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.error_log_error_id_seq', 764, true);


--
-- Name: friends_friend_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.friends_friend_id_seq', 12, true);


--
-- Name: job_messages_job_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_messages_job_message_id_seq', 1, false);


--
-- Name: job_milestones_milestone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_milestones_milestone_id_seq', 1, false);


--
-- Name: jobs_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_job_id_seq', 1, false);


--
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_message_id_seq', 9, true);


--
-- Name: milestone_conditions_condition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.milestone_conditions_condition_id_seq', 1, false);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 5, true);


--
-- Name: pinned_jobs_pinned_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pinned_jobs_pinned_id_seq', 1, false);


--
-- Name: pinned_messages_pinned_msg_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pinned_messages_pinned_msg_id_seq', 1, true);


--
-- Name: promotions_promo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotions_promo_id_seq', 1, true);


--
-- Name: reports_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_report_id_seq', 2, true);


--
-- Name: sectors_sector_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sectors_sector_id_seq', 30, true);


--
-- Name: site_config_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_config_configs_id_seq', 3, true);


--
-- Name: site_review_site_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_review_site_review_id_seq', 13, true);


--
-- Name: user_bans_ban_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_bans_ban_id_seq', 4, true);


--
-- Name: user_listings_listing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_listings_listing_id_seq', 12, true);


--
-- Name: user_reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_reviews_review_id_seq', 1, false);


--
-- Name: user_warnings_warning_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_warnings_warning_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 25, true);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (activity_id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (announcement_id);


--
-- Name: appeal_abandoned_jobs appealed_abandon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appeal_abandoned_jobs
    ADD CONSTRAINT appealed_abandon_pkey PRIMARY KEY (aa_id);


--
-- Name: blocked_users blocked_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_pkey PRIMARY KEY (blocked_user_id);


--
-- Name: business_hours business_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_pkey PRIMARY KEY (business_hour_id);


--
-- Name: sectors categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT categories_pkey PRIMARY KEY (sector_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (conversation_id);


--
-- Name: deleted_messages deleted_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_messages
    ADD CONSTRAINT deleted_messages_pkey PRIMARY KEY (deleted_msg_id);


--
-- Name: error_log error_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_log
    ADD CONSTRAINT error_log_pkey PRIMARY KEY (error_id);


--
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (friend_id);


--
-- Name: job_messages job_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_messages
    ADD CONSTRAINT job_messages_pkey PRIMARY KEY (job_message_id);


--
-- Name: job_milestones job_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_milestones
    ADD CONSTRAINT job_milestones_pkey PRIMARY KEY (milestone_id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (job_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: milestone_conditions milestone_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestone_conditions
    ADD CONSTRAINT milestone_conditions_pkey PRIMARY KEY (condition_id);


--
-- Name: notifications nofitications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT nofitications_pkey PRIMARY KEY (notification_id);


--
-- Name: pinned_jobs pinned_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs
    ADD CONSTRAINT pinned_jobs_pkey PRIMARY KEY (pinned_id);


--
-- Name: pinned_messages pinned_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_messages
    ADD CONSTRAINT pinned_messages_pkey PRIMARY KEY (pinned_msg_id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (promo_id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);


--
-- Name: user_reviews review_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_reviews
    ADD CONSTRAINT review_tokens_pkey PRIMARY KEY (review_id);


--
-- Name: site_configs site_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_configs
    ADD CONSTRAINT site_config_pkey PRIMARY KEY (config_id);


--
-- Name: site_review site_review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_review
    ADD CONSTRAINT site_review_pkey PRIMARY KEY (site_review_id);


--
-- Name: blocked_users unique_blocked_users; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT unique_blocked_users UNIQUE (blocking_user, blocked_user);


--
-- Name: business_hours unique_business_hours; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT unique_business_hours UNIQUE (for_listing);


--
-- Name: sectors unique_category_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT unique_category_name UNIQUE (sector);


--
-- Name: dismissed_announcements unique_dismiss; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dismissed_announcements
    ADD CONSTRAINT unique_dismiss UNIQUE (dismissed_announcement, dismissed_by);


--
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (user_email);


--
-- Name: error_log unique_error; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_log
    ADD CONSTRAINT unique_error UNIQUE (error);


--
-- Name: friends unique_friends; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT unique_friends UNIQUE (friend_user_1, friend_user_2);


--
-- Name: pinned_jobs unique_pinned_jobs; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs
    ADD CONSTRAINT unique_pinned_jobs UNIQUE (pinned_job, pinned_by);


--
-- Name: user_reviews unique_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_reviews
    ADD CONSTRAINT unique_review UNIQUE (reviewer, reviewing, review_job_id);


--
-- Name: users unique_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- Name: user_bans user_bans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_pkey PRIMARY KEY (ban_id);


--
-- Name: user_listings user_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_listings
    ADD CONSTRAINT user_listings_pkey PRIMARY KEY (listing_id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_profile_id);


--
-- Name: user_settings user_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_setting_id);


--
-- Name: user_view_count user_view_count_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_count
    ADD CONSTRAINT user_view_count_username_key UNIQUE (viewing_user);


--
-- Name: user_warnings user_warnings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_warnings
    ADD CONSTRAINT user_warnings_pkey PRIMARY KEY (warning_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: unique_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_listing ON public.user_listings USING btree (listing_user, listing_sector) WHERE ((listing_status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[]));


--
-- Name: unique_pending_report; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_pending_report ON public.reports USING btree (reporter, report_type, reported_user, report_status, reported_id) WHERE ((report_status)::text = 'Pending'::text);


--
-- Name: activities activities_activity_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_activity_user_fkey FOREIGN KEY (activity_user) REFERENCES public.users(username);


--
-- Name: announcements announcements_announcer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_announcer_fkey FOREIGN KEY (announcer) REFERENCES public.users(username);


--
-- Name: appeal_abandoned_jobs appealed_abandon_appeal_abandoned_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appeal_abandoned_jobs
    ADD CONSTRAINT appealed_abandon_appeal_abandoned_job_id_fkey FOREIGN KEY (aa_id) REFERENCES public.jobs(job_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: blocked_users blocked_users_blocked_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocked_user_fkey FOREIGN KEY (blocked_user) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: blocked_users blocked_users_blocking_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocking_user_fkey FOREIGN KEY (blocking_user) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_hours business_hours_for_listing_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_for_listing_fkey FOREIGN KEY (for_listing) REFERENCES public.user_listings(listing_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_conversation_recipient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_conversation_recipient_fkey FOREIGN KEY (conversation_recipient) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_conversation_starter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_conversation_starter_fkey FOREIGN KEY (conversation_starter) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deleted_messages deleted_messages_deleted_message_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_messages
    ADD CONSTRAINT deleted_messages_deleted_message_fkey FOREIGN KEY (deleted_message) REFERENCES public.messages(message_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deleted_messages deleted_messages_message_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_messages
    ADD CONSTRAINT deleted_messages_message_deleted_by_fkey FOREIGN KEY (message_deleted_by) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dismissed_announcements dismissed_announcements_dismissed_annoucement_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dismissed_announcements
    ADD CONSTRAINT dismissed_announcements_dismissed_annoucement_fkey FOREIGN KEY (dismissed_announcement) REFERENCES public.announcements(announcement_id);


--
-- Name: dismissed_announcements dismissed_announcements_dismissed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dismissed_announcements
    ADD CONSTRAINT dismissed_announcements_dismissed_by_fkey FOREIGN KEY (dismissed_by) REFERENCES public.users(username);


--
-- Name: friends friends_friend_user_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_friend_user_1_fkey FOREIGN KEY (friend_user_1) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: friends friends_friend_user_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_friend_user_2_fkey FOREIGN KEY (friend_user_2) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_messages job_messages_job_message_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_messages
    ADD CONSTRAINT job_messages_job_message_creator_fkey FOREIGN KEY (job_message_creator) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_messages job_messages_job_message_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_messages
    ADD CONSTRAINT job_messages_job_message_parent_id_fkey FOREIGN KEY (job_message_parent_id) REFERENCES public.jobs(job_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_milestones job_milestones_milestone_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_milestones
    ADD CONSTRAINT job_milestones_milestone_job_id_fkey FOREIGN KEY (milestone_job_id) REFERENCES public.jobs(job_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jobs jobs_job_client_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_client_fkey FOREIGN KEY (job_client) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jobs jobs_job_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_user_fkey FOREIGN KEY (job_user) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_message_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_message_conversation_id_fkey FOREIGN KEY (message_conversation_id) REFERENCES public.conversations(conversation_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_message_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_message_creator_fkey FOREIGN KEY (message_creator) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: milestone_conditions milestone_conditions_condition_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestone_conditions
    ADD CONSTRAINT milestone_conditions_condition_parent_id_fkey FOREIGN KEY (condition_parent_id) REFERENCES public.job_milestones(milestone_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications nofitications_notification_recipient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT nofitications_notification_recipient_fkey FOREIGN KEY (notification_recipient) REFERENCES public.users(username);


--
-- Name: pinned_jobs pinned_jobs_pinned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs
    ADD CONSTRAINT pinned_jobs_pinned_by_fkey FOREIGN KEY (pinned_by) REFERENCES public.users(username);


--
-- Name: pinned_jobs pinned_jobs_pinned_job_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs
    ADD CONSTRAINT pinned_jobs_pinned_job_fkey FOREIGN KEY (pinned_id) REFERENCES public.jobs(job_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pinned_messages pinned_messages_message_pinned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_messages
    ADD CONSTRAINT pinned_messages_message_pinned_by_fkey FOREIGN KEY (message_pinned_by) REFERENCES public.users(username) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pinned_messages pinned_messages_pinned_mesage_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_messages
    ADD CONSTRAINT pinned_messages_pinned_mesage_fkey FOREIGN KEY (pinned_message) REFERENCES public.messages(message_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_reported_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_user_fkey FOREIGN KEY (reported_user) REFERENCES public.users(username);


--
-- Name: reports reports_reporter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_fkey FOREIGN KEY (reporter) REFERENCES public.users(username);


--
-- Name: user_reviews review_tokens_reviewer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_reviews
    ADD CONSTRAINT review_tokens_reviewer_fkey FOREIGN KEY (reviewer) REFERENCES public.users(username);


--
-- Name: user_bans user_bans_banned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_banned_by_fkey FOREIGN KEY (banned_by) REFERENCES public.users(username);


--
-- Name: user_bans user_bans_banned_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_banned_user_fkey FOREIGN KEY (banned_user) REFERENCES public.users(username);


--
-- Name: user_listings user_listings_listing_sector_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_listings
    ADD CONSTRAINT user_listings_listing_sector_fkey FOREIGN KEY (listing_sector) REFERENCES public.sectors(sector) ON UPDATE CASCADE;


--
-- Name: user_listings user_listings_listing_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_listings
    ADD CONSTRAINT user_listings_listing_user_fkey FOREIGN KEY (listing_user) REFERENCES public.users(username);


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_reviews user_reviews_review_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_reviews
    ADD CONSTRAINT user_reviews_review_list_id_fkey FOREIGN KEY (review_list_id) REFERENCES public.user_listings(listing_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_reviews user_reviews_reviewing_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_reviews
    ADD CONSTRAINT user_reviews_reviewing_fkey FOREIGN KEY (reviewing) REFERENCES public.users(username);


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_setting_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_view_count user_view_count_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_view_count
    ADD CONSTRAINT user_view_count_username_fkey FOREIGN KEY (viewing_user) REFERENCES public.users(username);


--
-- Name: user_warnings user_warnings_warned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_warnings
    ADD CONSTRAINT user_warnings_warned_by_fkey FOREIGN KEY (warned_by) REFERENCES public.users(username);


--
-- Name: user_warnings user_warnings_warned_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_warnings
    ADD CONSTRAINT user_warnings_warned_user_fkey FOREIGN KEY (warned_user) REFERENCES public.users(username);


--
-- PostgreSQL database dump complete
--

