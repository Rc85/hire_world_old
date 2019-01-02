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
-- Name: appealed_abandon_aa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appealed_abandon_aa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.appealed_abandon_aa_id_seq OWNER TO postgres;

--
-- Name: appealed_abandon_aa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appealed_abandon_aa_id_seq OWNED BY public.appeal_abandoned_jobs.aa_id;


--
-- Name: business_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_hours (
    business_hour_id integer NOT NULL,
    business_owner character varying,
    monday character varying,
    tuesday character varying,
    wednesday character varying,
    thursday character varying,
    friday character varying,
    saturday character varying,
    sunday character varying
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
    error_name character varying,
    error_message text,
    error_origin character varying,
    error_url character varying,
    error_occurrence integer DEFAULT 1
);


ALTER TABLE public.error_log OWNER TO postgres;

--
-- Name: error_logs_error_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.error_logs_error_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.error_logs_error_id_seq OWNER TO postgres;

--
-- Name: error_logs_error_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.error_logs_error_id_seq OWNED BY public.error_log.error_id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    job_id integer NOT NULL,
    job_client character varying NOT NULL,
    job_created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    job_stage character varying DEFAULT 'Inquire'::character varying,
    job_user character varying,
    job_status character varying DEFAULT 'New'::character varying,
    job_subject character varying NOT NULL,
    job_user_complete boolean,
    job_client_complete boolean,
    job_modified_date timestamp without time zone,
    job_listing_id integer,
    abandon_reason text
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
    belongs_to_job integer NOT NULL,
    message_body text NOT NULL,
    message_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    message_type character varying DEFAULT 'User'::character varying,
    message_sender character varying,
    message_recipient character varying,
    message_status character varying DEFAULT 'New'::character varying,
    is_reply boolean DEFAULT false,
    message_modified_date timestamp without time zone
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
-- Name: offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offers (
    offer_id integer NOT NULL,
    offer_type character varying,
    offer_term character varying,
    completed_by character varying,
    offer_price numeric,
    offer_currency character varying,
    offer_payment_type character varying,
    offer_payment_period character varying,
    offer_number_of_payments integer,
    offer_amount_type character varying,
    offer_payment_1 numeric,
    offer_payment_2 numeric,
    offer_payment_3 numeric,
    offer_payment_4 numeric,
    offer_payment_5 numeric,
    offer_payment_6 numeric,
    offer_for_job integer,
    offer_created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    offer_modified_date timestamp without time zone,
    offer_status character varying DEFAULT 'Pending'::character varying,
    offer_confidentiality boolean
);


ALTER TABLE public.offers OWNER TO postgres;

--
-- Name: offers_offer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.offers_offer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.offers_offer_id_seq OWNER TO postgres;

--
-- Name: offers_offer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.offers_offer_id_seq OWNED BY public.offers.offer_id;


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
    review_status character varying DEFAULT 'Active'::character varying
);


ALTER TABLE public.user_reviews OWNER TO postgres;

--
-- Name: review_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_tokens_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_tokens_token_id_seq OWNER TO postgres;

--
-- Name: review_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_tokens_token_id_seq OWNED BY public.user_reviews.review_id;


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
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    plan_id integer NOT NULL,
    plan_name character varying NOT NULL,
    plan_price integer,
    plan_created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    plan_status character varying DEFAULT 'Active'::character varying NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscription_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscription_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscription_plans_plan_id_seq OWNER TO postgres;

--
-- Name: subscription_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscription_plans_plan_id_seq OWNED BY public.subscription_plans.plan_id;


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
    listing_end_date timestamp without time zone,
    listing_purpose character varying
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
    user_city_code character varying,
    CONSTRAINT check_country CHECK (((user_country)::text = ANY ((ARRAY['Canada'::character varying, 'Mexico'::character varying, 'United States'::character varying])::text[]))),
    CONSTRAINT check_region CHECK (((user_region)::text = ANY ((ARRAY['British Columbia'::character varying, 'Alberta'::character varying, 'Saskatchewan'::character varying, 'Manitoba'::character varying, 'Ontario'::character varying, 'Newfoundland'::character varying, 'New Brunswick'::character varying, 'Prince Edward Island'::character varying, 'Yukon Territory'::character varying, 'Northwest Territory'::character varying, 'Quebec'::character varying, 'Nova Scotia'::character varying, 'Alabama'::character varying, 'Alaska'::character varying, 'American Samoa'::character varying, 'Arizona'::character varying, 'Arkansas'::character varying, 'California'::character varying, 'Colorado'::character varying, 'Connecticut'::character varying, 'Delaware'::character varying, 'District of Columbia'::character varying, 'Florida'::character varying, 'Georgia'::character varying, 'Guam'::character varying, 'Hawaii'::character varying, 'Idaho'::character varying, 'Illinois'::character varying, 'Indiana'::character varying, 'Iowa'::character varying, 'Kansas'::character varying, 'Kentucky'::character varying, 'Louisiana'::character varying, 'Maine'::character varying, 'Maryland'::character varying, 'Marshall Islands'::character varying, 'Massachusetts'::character varying, 'Michigan'::character varying, 'Micronesia'::character varying, 'Minnesota'::character varying, 'Mississippi'::character varying, 'Missouri'::character varying, 'Montana'::character varying, 'Nebraska'::character varying, 'Nevada'::character varying, 'New Hampshire'::character varying, 'New Jersey'::character varying, 'New Mexico'::character varying, 'New York'::character varying, 'North Carolina'::character varying, 'North Dakota'::character varying, 'Northern Mariana Islands'::character varying, 'Ohio'::character varying, 'Oklahoma'::character varying, 'Oregon'::character varying, 'Palau'::character varying, 'Pennsylvania'::character varying, 'Puerto Rico'::character varying, 'Rhode Island'::character varying, 'South Carolina'::character varying, 'South Dakota'::character varying, 'Tennessee'::character varying, 'Texas'::character varying, 'Utah'::character varying, 'Vermont'::character varying, 'Virgin Islands'::character varying, 'Virginia'::character varying, 'Washington'::character varying, 'West Virginia'::character varying, 'Wisconsin'::character varying, 'Wyoming'::character varying, 'Armed Forces Americas'::character varying, 'Armed Forces Europe, Canada, Africa, and Middle East'::character varying, 'Armed Forces Pacific'::character varying, 'Aguascalientes'::character varying, 'Baja California'::character varying, 'Baja California Sur'::character varying, 'Campeche'::character varying, 'Chiapas'::character varying, 'Chihuahua'::character varying, 'Ciudad de México'::character varying, 'Coahuila de Zaragoza'::character varying, 'Colima'::character varying, 'Durango'::character varying, 'Estado de México'::character varying, 'Guanajuato'::character varying, 'Guerrero'::character varying, 'Hidalgo'::character varying, 'Jalisco'::character varying, 'Michoacán de Ocampo'::character varying, 'Morelos'::character varying, 'Nayarit'::character varying, 'Nuevo León'::character varying, 'Oaxaca'::character varying, 'Puebla'::character varying, 'Querétaro de Arteaga'::character varying, 'Quintana Roo'::character varying, 'San Luis Potosí'::character varying, 'Sinaloa'::character varying, 'Sonora'::character varying, 'Tabasco'::character varying, 'Tamaulipas'::character varying, 'Tlaxcala'::character varying, 'Veracruz de Ignacio de la'::character varying, 'Yucatán'::character varying, 'Zacatecas'::character varying])::text[])))
);


ALTER TABLE public.user_profiles OWNER TO postgres;

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
    stripe_cust_id character varying,
    subscription_id character varying,
    subscription_end_date timestamp without time zone,
    plan_id character varying,
    CONSTRAINT check_user_account_type CHECK (((account_type)::text = ANY ((ARRAY['User'::character varying, 'Listing'::character varying, 'Business'::character varying])::text[]))),
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

ALTER TABLE ONLY public.appeal_abandoned_jobs ALTER COLUMN aa_id SET DEFAULT nextval('public.appealed_abandon_aa_id_seq'::regclass);


--
-- Name: business_hours business_hour_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours ALTER COLUMN business_hour_id SET DEFAULT nextval('public.business_hours_business_hour_id_seq'::regclass);


--
-- Name: error_log error_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_log ALTER COLUMN error_id SET DEFAULT nextval('public.error_logs_error_id_seq'::regclass);


--
-- Name: jobs job_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN job_id SET DEFAULT nextval('public.jobs_job_id_seq'::regclass);


--
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: offers offer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers ALTER COLUMN offer_id SET DEFAULT nextval('public.offers_offer_id_seq'::regclass);


--
-- Name: pinned_jobs pinned_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs ALTER COLUMN pinned_id SET DEFAULT nextval('public.pinned_jobs_pinned_id_seq'::regclass);


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
-- Name: subscription_plans plan_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.subscription_plans_plan_id_seq'::regclass);


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

ALTER TABLE ONLY public.user_reviews ALTER COLUMN review_id SET DEFAULT nextval('public.review_tokens_token_id_seq'::regclass);


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
-- Data for Name: business_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_hours (business_hour_id, business_owner, monday, tuesday, wednesday, thursday, friday, saturday, sunday) FROM stdin;
1	roger85	8:00 AM - 8:00 PM	8:00 AM - 8:00 PM	8:00 AM - 8:00 PM	8:00 AM - 8:00 PM	8:00 AM - 10:00 PM	Closed	Closed
\.


--
-- Data for Name: dismissed_announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dismissed_announcements (dismissed_announcement, dismissed_by) FROM stdin;
13	roger85
10	roger85
14	roger85
\.


--
-- Data for Name: error_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.error_log (error_id, error_name, error_message, error_origin, error_url, error_occurrence) FROM stdin;
1	TypeError	Cannot read property 'pathname' of undefined	Client	/api/auth/login	1
2	ReferenceError	Route is not defined	Client	/api/auth/login	1
3	ReferenceError	ViewUserLocation is not defined	Client	/api/get/user	1
5	ReferenceError	businessName is not defined	Client	/api/get/user	1
7	TypeError	Cannot read property 'username' of null	Client	/api/get/user	3
11	TypeError	Cannot read property 'listing_user' of undefined	Database Query	/api/message/submit	1
12	TypeError	Cannot read property 'listing_id' of undefined	Database Query	/api/message/submit	1
84	Invariant Violation	Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.	Client	/api/message/submit	2
133	Error	Request failed with status code 504	Client	/api/get/sectors	2
118	TypeError	Cannot read property 'indexOf' of undefined	Client	/api/get/jobs	2
126	TypeError	Cannot read property 'push' of undefined	Client	/api/job/pin	2
13	TypeError	Cannot read property 'username' of null	Client	/api/get/messages/received	4
4	ReferenceError	NavLink is not defined	Client	/api/get/user	4
96	error	syntax error at or near "undefined"	Database Query	/api/get/messages/all	1
15	TypeError	Cannot read property 'username' of null	Client	/api/get/offer	7
97	error	syntax error at or near "undefined"	\N	\N	1
24	error	bind message supplies 2 parameters, but prepared statement "" requires 1	Database Query	/api/get/message	21
98	error	column "message_sender" does not exist	\N	\N	1
99	error	column "message_date" does not exist	\N	\N	1
6	ReferenceError	props is not defined	Client	/api/get/user	3
10	Error	A cross-origin error was thrown. React doesn't have access to the actual error object in development. See https://fb.me/react-crossorigin-error for more information.	Client	/api/auth/login	2
101	TypeError	Cannot read property 'indexOf' of undefined	Client	/api/get/messages/all	4
64	ReferenceError	SlideToggle is not defined	Client	/api/auth/login	1
79	TypeError	Cannot read property 'length' of undefined	Client	/api/get/messages/all	17
63	TypeError	Cannot read property 'initialSettings' of null	Client	/api/auth/login	2
66	Error	Network Error	Client	/api/listing/edit	1
106	TypeError	Cannot read property 'message_count' of undefined	\N	\N	1
67	error	null value in column "listing_price_currency" violates not-null constraint	Database Query	/api/listing/edit	3
40	TypeError	Cannot convert undefined or null to object	Client	/api/get/message	3
107	TypeError	Cannot read property 'message_count' of undefined	\N	\N	1
70	TypeError	Cannot read property 'job_user' of undefined	Database Query	/api/job/cancel-abandon	1
108	TypeError	Cannot read property 'message_count' of undefined	\N	\N	1
131	Error	Request failed with status code 504	Client	/api/auth/login	5
73	TypeError	Cannot read property 'length' of undefined	Client	/api/get/messages/undefined	1
109	ReferenceError	pinnedArray is not defined	\N	\N	1
110	error	could not determine data type of parameter $3	\N	\N	1
111	error	could not determine data type of parameter $3	\N	\N	1
74	TypeError	Cannot read property 'length' of undefined	Client	/api/get/messages/received	5
112	ReferenceError	moment is not defined	Client	/api/get/messages/all	1
113	ReferenceError	Pagination is not defined	Client	/api/get/jobs	1
114	ReferenceError	InquiryRow is not defined	Client	/api/get/jobs	1
115	ReferenceError	pinned is not defined	Client	/api/get/jobs	3
120	ReferenceError	Alert is not defined	Client	/api/get/jobs	1
119	TypeError	pinned is not iterable	Database Query	/api/get/jobs	2
122	ReferenceError	job is not defined	Database Query	/api/get/jobs	1
125	TypeError	Cannot read property 'job_count' of undefined	Database Query	/api/get/jobs	1
127	TypeError	Cannot read property 'action' of undefined	Client	/api/get/sectors	1
128	ReferenceError	appealButton is not defined	Client	/api/get/jobs	1
129	error	syntax error at or near ")"	Database Query	/api/get/jobs	1
130	error	syntax error at or near "("	Database Query	/api/get/jobs	1
132	Error	Request failed with status code 504	Client	/api/get/user	1
30	Error	The job does not exist	Database Query	/api/get/offer	40
134	Error	Request failed with status code 504	Client	/api/get/jobs	1
139	error	duplicate key value violates unique constraint "unique_review"	Database Query	/api/job/complete/approve	1
141	ReferenceError	props is not defined	Client	/api/get/message	1
143	TypeError	Cannot read property 'user' of null	Client	/api/get/jobs	1
144	TypeError	Cannot read property 'username' of null	Client	/api/get/jobs	1
145	TypeError	Cannot read property 'review' of null	Client	/api/get/jobs	2
305	TypeError	Cannot read property 'length' of undefined	Client	/api/user/get/notifications	2
403	error	relation "saved_listings" does not exist	Database Query	/api/get/saved_listings	19
339	TypeError	Failed to construct 'Response': Please use the 'new' operator, this DOM object constructor cannot be called as a function.	Client	/api/get/listings	2
212	ReferenceError	message is not defined	Client	/api/auth/login	2
338	error	column "user_reviews.reviewing" must appear in the GROUP BY clause or be used in an aggregate function	Database Query	/api/get/listings	3
177	ReferenceError	Alert is not defined	Client	/api/get/messages/all	15
343	error	syntax error at or near "WHERE"	Database Query	/api/get/user	1
307	TypeError	Cannot read property '0' of undefined	Database Query	/api/get/jobs	6
313	ReferenceError	moment is not defined	Client	/api/get/user	1
314	error	column user_listings.listed_under does not exist	Database Query	/api/get/user	1
147	TypeError	Cannot read property '0' of undefined	Database Query	/api/user/review/submit	8
315	error	syntax error at or near "COMIT"	Database Query	/api/get/user	1
316	ReferenceError	then is not defined	Database Query	/api/get/user	1
164	TypeError	Cannot read property 'reviewer' of undefined	Database Query	/api/user/review/submit	1
148	TypeError	Cannot read property 'pinned_date' of undefined	Client	/api/user/review/submit	10
166	error	column pinned.pinned_job does not exist	Database Query	/api/get/jobs	1
167	error	missing FROM-clause entry for table "pinned_jobs"	Database Query	/api/get/jobs	2
396	error	null value in column "listing_title" violates not-null constraint	Database Query	/api/listing/toggle	2
175	error	argument of JOIN/ON must be type boolean, not type integer	Database Query	/api/user/profile-pic/upload	1
344	error	duplicate key value violates unique constraint "unique_report"	Database Query	/api/report/submit	1
345	error	unterminated quoted string at or near "'SELECT user_status FROM users WHERE user_id = $1"	Database Query	/api/message/submit	1
346	Error	You're temporarily banned	Database Query	/api/message/submit	1
274	ReferenceError	resp is not defined	Client	/api/auth/login	1
228	error	null value in column "notification_type" violates not-null constraint	Database Query	/api/admin/user/change-status	1
232	TypeError	Cannot read property 'username' of null	Client	/api/get/messages/all	1
276	Invariant Violation	Login(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null.	Client	/api/auth/login	1
334	Error	Request failed with status code 504	Client	api/get/user/notification-and-message-count	2
317	Error	That user is not listed	Database Query	/api/get/user	77
208	Error	You're not logged in	Database Query	/api/auth/login	38
347	Error	You're temporarily banned	Database Query	/api/listing/create	5
388	Error	You're temporarily banned	Database Query	/api/report/submit	2
229	error	duplicate key value violates unique constraint "unique_inquiry"	Database Query	/api/message/submit	5
235	error	duplicate key value violates unique constraint "unique_inquiry"	Database Query	/api/get/messages/:type	5
352	Error	You're temporarily banned	Database Query	/api/listing/toggle	1
401	error	column "listing_title" does not exist	Database Query	/api/admin/listings/get	1
329	Error	Request failed with status code 404	Client	/api/auth/login	4
176	Error	That user does not exist	Database Query	/api/auth/login	42
291	TypeError	bcrypt.compare(...) is not a function	Database Query	/api/auth/login	1
411	TypeError	Cannot read property 'map' of undefined	Client	/api/filter/listings	13
408	error	duplicate key value violates unique constraint "unique_email"	Database Query	/api/auth/register	1
303	Error	Network Error	Client	api/get/user/notification-and-message-count	5
393	error	null value in column "listing_user" violates not-null constraint	Database Query	/api/listing/toggle	2
395	error	null value in column "listing_price" violates not-null constraint	Database Query	/api/listing/toggle	1
294	TypeError	this.props.user.notifications is undefined	Client	/api/auth/login	3
293	TypeError	Cannot read property 'length' of undefined	Client	/api/auth/login	7
304	Error	Request failed with status code 404	Client	/api/user/get/notifications	1
397	ReferenceError	value is not defined	Database Query	/api/listing/toggle	1
402	ReferenceError	jobResults is not defined	\N	\N	1
410	error	syntax error at or near "WHERE"	Database Query	/api/filter/listings	1
412	error	column jobs.job_complete does not exist	Database Query	/api/filter/listings	1
414	error	column jobs.job_abandoned does not exist	Database Query	/api/filter/listings	1
279	Error	Network Error	Client	/api/auth/login	4
172	Error	Request failed with status code 500	Client	/api/user/profile-pic/upload	6
390	TypeError	Cannot read property 'user' of undefined	Client	/api/auth/login	2
283	Invariant Violation	Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.	Client	/api/auth/login	2
561	ReferenceError	faDollarSign is not defined	Client	/api/get/listings	2
416	error	column "job_abandoned" does not exist	Database Query	/api/filter/listings	3
422	error	missing FROM-clause entry for table "jobs"	Database Query	/api/filter/listings	2
434	ReferenceError	faDollarSign is not defined	Client	/api/get/user	1
442	ReferenceError	faListAlt is not defined	Client	/api/get/user	2
448	ReferenceError	faBuilding is not defined	Client	/api/get/user	2
450	ReferenceError	FontAwesomeIcon is not defined	Client	/api/get/user	2
452	ReferenceError	UncontrolledTooltip is not defined	Client	/api/get/user	2
454	TypeError	Cannot read property 'state' of undefined	Client	/api/get/user	2
457	Error	You need to activate your account	Database Query	/api/auth/login	2
404	TypeError	Failed to construct 'Response': Please use the 'new' operator, this DOM object constructor cannot be called as a function.	Client	/api/get/saved_listings	2
621	TypeError	Cannot read property 'user_level' of null	Client	/api/auth/privilege	2
465	error	syntax error at or near "undefined"	Database Query	/api/filter/listings	4
473	error	column "job_completed" does not exist	Database Query	/api/filter/listings	1
478	Invariant Violation	React.Children.only expected to receive a single React element child.	Client	/api/auth/login	1
485	Error	Request failed with status code 500	Client	/api/user/profile-pic/delete	1
623	error	column "undefined" of relation "user_profiles" does not exist	Database Query	/api/user/edit	1
486	TypeError	Cannot read property 'avatar_url' of null	Client	/api/auth/login	3
534	Error	Invalid API Key provided: sk_test_**********************76';	Database Query	/api/user/payment/submit	3
566	TypeError	Cannot read property 'listing_created_date' of undefined	Client	/api/auth/login	5
481	Error	Network Error	Client	/api/user/payment/submit	7
583	\N	\N	\N	\N	1
496	ReferenceError	validate is not defined	Database Query	/api/user/payment/submit	1
497	TypeError	validate.locationCheck is not a function	Database Query	/api/user/payment/submit	1
498	Error	Name is required	Database Query	/api/user/payment/submit	1
499	error	invalid input syntax for integer: "cus_EASs2EudzaSabm"	Database Query	/api/user/payment/submit	1
585	\N	\N	\N	\N	1
502	error	bind message supplies 6 parameters, but prepared statement "" requires 5	Database Query	/api/user/payment/submit	1
503	Error	Missing required param: shipping[name].	Database Query	/api/user/payment/submit	1
588	Error	No file found	Database Query	/api/user/profile-pic/upload	9
543	TypeError	Cannot read property 'avatar_url' of undefined	Client	/api/user/profile-pic/upload	12
606	TypeError	Cannot read property 'listing_status' of undefined	Client	/api/listing/toggle	1
542	Error	Invalid file	Database Query	/api/user/profile-pic/upload	3
514	ReferenceError	user is not defined	Database Query	/api/user/profile-pic/delete	1
625	TypeError	Cannot read property 'props' of undefined	Client	/api/auth/login	2
659	Error	Request failed with status code 404	Client	/api/user/payment/save	2
519	error	relation "site_review" does not exist	Database Query	/api/site/review	2
521	Error	Stripe: "id" must be a string, but got: object (on API request to `DELETE /subscriptions/{id}`)	Database Query	/api/user/subscription/cancel	1
522	Error	No such subscription: sub_EAUHhktC9aAgOc	Database Query	/api/user/subscription/cancel	1
523	Error	Stripe: "id" must be a string, but got: object (on API request to `POST /customers/{id}`)	Database Query	/api/user/payment/submit	1
524	TypeError	Cannot read property 'props' of undefined	Client	/api/get/listings	1
550	TypeError	Cannot read property 'action' of null	Client	api/get/user/notification-and-message-count	2
648	Error	Request failed with status code 404	Client	/api/get/payment	3
528	ReferenceError	FontAwesomeIcon is not defined	Client	/api/auth/login	1
529	ReferenceError	UncontrolledTooltip is not defined	Client	/api/auth/login	1
552	TypeError	Cannot read property 'action' of null	Client	/api/get/user/notification-and-message-count	2
554	ReferenceError	secondaryOptions is not defined	Client	/api/auth/login	2
651	Error	Request failed with status code 404	Client	/api/get/payments	1
611	ReferenceError	prop is not defined	Client	/api/get/user	1
556	ReferenceError	credential is not defined	Client	/api/auth/login	4
560	error	bind message supplies 10 parameters, but prepared statement "" requires 9	Database Query	/api/listing/toggle	1
652	ReferenceError	PaymentMethods is not defined	Client	/api/get/payments	1
475	ReferenceError	splitHours is not defined	Client	/api/get/business_hours	47
645	ReferenceError	RegionDropdown is not defined	Client	/api/auth/login	1
653	ReferenceError	editCardInfo is not defined	Client	/api/get/payments	3
616	Error	Request failed with status code 404	Client	/api/auth/privilege	1
646	TypeError	this.save is not a function	Client	/api/auth/login	1
617	TypeError	Cannot read property 'map' of undefined	Client	/api/auth/privilege	3
620	Error	Request failed with status code 404	Client	/api/admin/config/get	1
647	TypeError	_this2.CardExpiryElement.clear is not a function	Client	/api/user/payment/add	1
656	TypeError	Cannot read property 'edit' of null	Client	/api/get/payments	1
657	ReferenceError	SubmitButton is not defined	Client	/api/get/payments	1
658	TypeError	this.save is not a function	Client	/api/get/payments	1
661	Error	Network Error	Client	/api/user/payment/edit	1
662	TypeError	_this2.props.dispatch is not a function	Client	/api/user/payment/edit	1
664	TypeError	Cannot read property 'length' of undefined	Client	/api/get/payments	1
666	ReferenceError	AddressInput is not defined	Client	/api/auth/login	1
717	Invariant Violation	Objects are not valid as a React child (found: Invalid Date). If you meant to render a collection of children, use an array instead.\n    in section (created by SubscriptionSettings)\n    in SubscriptionSettings (created by Route)\n    in section (created by Dashboard)\n    in Dashboard (created by Route)\n    in Route (created by withRouter(Dashboard))\n    in withRouter(Dashboard) (created by Route)\n    in Route (created by App)\n    in Switch (created by App)\n    in section (created by App)\n    in div (created by App)\n    in App (created by Connect(App))\n    in Connect(App) (created by Route)\n    in Route (created by withRouter(Connect(App)))\n    in withRouter(Connect(App))\n    in Router (created by BrowserRouter)\n    in BrowserRouter\n    in Provider	Client	/api/auth/login	3
667	TypeError	Cannot read property 'id' of undefined	Database Query	/api/user/payment/add	4
671	error	column "user_id" does not exist	Database Query	/api/user/payment/add	1
672	Error	Request failed with status code 404	Client	/api/user/payment/submit	1
674	TypeError	Cannot read property 'map' of undefined	Client	/api/auth/login	4
678	TypeError	Cannot read property 'status' of null	Client	/api/auth/login	1
679	error	there is no parameter $1	Database Query	/api/user/settings/change	1
680	Error	No such token: card_1DkVCbBHXVLUMgqYjP5phhDW	Database Query	/api/user/subscription/add	1
681	error	interval field value out of range: "2327730345"	Database Query	/api/user/subscription/add	1
682	error	interval field value out of range: "2327632890"	Database Query	/api/user/subscription/add	1
683	error	interval field value out of range: "2327291085"	Database Query	/api/user/subscription/add	1
684	error	interval field value out of range: "2327190874"	Database Query	/api/user/subscription/add	1
685	error	invalid input syntax for type interval: ""PT646H23M21.594S""	Database Query	/api/user/subscription/add	1
686	ReferenceError	UpdateUser is not defined	Client	/api/listing/toggle	1
690	Error	Request failed with status code 404	Client	/api/get/user-notifications	1
692	ReferenceError	SubscriptionInfo is not defined	Client	/api/auth/login	1
693	Invariant Violation	Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.\n\nCheck the render method of `Route`.	Client	/api/auth/login	2
695	error	syntax error at or near "."	Database Query	/api/user/settings/change	1
696	error	missing FROM-clause entry for table "user_listing"	Database Query	/api/user/settings/change	1
697	Invariant Violation	Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.	Client	/api/get/payments	1
699	Invariant Violation	Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.	Client	/api/get/business_hours	1
700	ReferenceError	onloadCallback is not defined	Client	/api/auth/login	2
722	TypeError	Cannot read property 'toUpperCase' of undefined	Client	/api/auth/login	2
704	Error	This customer has no attached payment source	Database Query	/api/user/subscription/add	3
707	TypeError	Cannot read property 'is_subscribed' of undefined	Client	/api/auth/login	1
708	Error	Request failed with status code 404	Client	/api/user/get/subscription	2
757	ReferenceError	activityCount is not defined	Client	/api/get/user/activities	2
710	Error	Network Error	Client	/api/get/user/subscription	5
746	Error	Request failed with status code 404	Client	/api/get/user/overview	2
748	TypeError	Cannot read property '0' of undefined	Database Query	/api/user/settings/profile/save	1
714	TypeError	Cannot read property 'subscription' of null	Client	/api/auth/login	3
644	Error	Please pass either 'apiKey' or 'stripe' to StripeProvider. If you're using 'stripe' but don't have a Stripe instance yet, pass 'null' explicitly.	Client	/api/auth/login	2
673	TypeError	Cannot read property 'id' of undefined	Database Query	/api/user/subscription/add	3
736	ReferenceError	unsubscribeButton is not defined	Client	/api/auth/login	3
720	TypeError	Cannot read property 'created' of undefined	Client	/api/auth/login	3
730	TypeError	Cannot read property 'created' of undefined	Client	/api/get/user/subscription	1
731	TypeError	moment.unix(...).asDays is not a function	Database Query	/api/user/subscription/add	1
732	Error	Invalid integer: 142.96007175925925	Database Query	/api/user/subscription/add	1
733	ReferenceError	now is not defined	Database Query	/api/user/subscription/add	1
734	Error	Invalid integer: 142.95718302083333	Database Query	/api/user/subscription/add	1
721	TypeError	Cannot read property 'nickname' of undefined	Client	/api/auth/login	4
752	ReferenceError	activities is not defined	Client	/api/auth/login	1
753	ReferenceError	notificationCount is not defined	Getting user activities	/api/get/user/activities	1
735	TypeError	Cannot read property 'data' of undefined	Client	/api/get/user/notification-and-message-count	8
756	Error	Request failed with status code 504	Client	/api/get/user/notification-and-message-count	1
759	TypeError	Invalid attempt to spread non-iterable instance	Client	/api/get/user/activities?request=[object Object]	13
770	TypeError	Cannot read property 'map' of undefined	Client	/api/get/user/activities?request=[object Object]	1
771	ReferenceError	res is not defined	Client	/api/get/user/activities	1
774	ReferenceError	setTime is not defined	Client	/api/get/user/activities?request=[object Object]	1
775	Error	No such plan: plan_EFVAGdrFIrpHx5; a similar object exists in live mode, but a test mode key was used to make this request.	Database Query	/api/user/subscription/add	1
776	Error	No such plan: prod_EAIy7CpMYsJrEf	Database Query	/api/user/subscription/add	1
777	Invariant Violation	Objects are not valid as a React child (found: object with keys {active_users}). If you meant to render a collection of children, use an array instead.\n    in div (created by AdminOverview)\n    in div (created by TitledContainer)\n    in div (created by TitledContainer)\n    in TitledContainer (created by AdminOverview)\n    in div (created by AdminOverview)\n    in div (created by AdminOverview)\n    in div (created by AdminOverview)\n    in AdminOverview (created by Connect(AdminOverview))\n    in Connect(AdminOverview) (created by Route)\n    in Route (created by withRouter(Connect(AdminOverview)))\n    in withRouter(Connect(AdminOverview)) (created by Route)\n    in section (created by Admin)\n    in Admin (created by Connect(Admin))\n    in Connect(Admin) (created by Route)\n    in Route (created by withRouter(Connect(Admin)))\n    in withRouter(Connect(Admin)) (created by Route)\n    in Route (created by App)\n    in Switch (created by App)\n    in section (created by App)\n    in div (created by App)\n    in App (created by Connect(App))\n    in Connect(App) (created by Route)\n    in Route (created by withRouter(Connect(App)))\n    in withRouter(Connect(App))\n    in Router (created by BrowserRouter)\n    in BrowserRouter\n    in Provider	Client	/api/admin/get/overview	2
779	TypeError	Cannot read property 'active_users' of undefined	Client	/api/auth/privilege	1
780	TypeError	Cannot read property 'banned_users' of undefined	Client	/api/auth/privilege	1
781	Error	Request failed with status code 404	Client	/api/get/announcements	5
786	TypeError	_this3.state.announcementIds.contains is not a function	Client	/api/get/announcements	4
790	error	syntax error at or near "ANY"	Getting announcements	/api/get/announcements	2
792	error	bind message supplies 1 parameters, but prepared statement "" requires 0	Getting announcements	/api/get/announcements	1
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (job_id, job_client, job_created_date, job_stage, job_user, job_status, job_subject, job_user_complete, job_client_complete, job_modified_date, job_listing_id, abandon_reason) FROM stdin;
1	niceuser	2018-12-02 22:23:04.382615	Completed	roger85	Completed	test	t	t	2018-12-02 22:23:45.347918	1	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (message_id, belongs_to_job, message_body, message_date, message_type, message_sender, message_recipient, message_status, is_reply, message_modified_date) FROM stdin;
1	1	test	2018-12-02 22:23:04.382615	User	niceuser	roger85	Read	f	\N
2	1	test	2018-12-02 22:23:16.90792	User	roger85	niceuser	Read	t	\N
3	1	An offer has been sent to the other party.	2018-12-02 22:23:25.637979	Update	System	niceuser	Read	t	\N
4	1	You received an offer from the other party.	2018-12-02 22:23:25.637979	Update	System	roger85	Read	t	\N
5	1	You accepted the offer.	2018-12-02 22:23:30.754196	Update	System	roger85	Read	t	\N
6	1	Your offer has been accepted.	2018-12-02 22:23:30.754196	Update	System	niceuser	Read	t	\N
7	1	An approval to complete this job has been sent.	2018-12-02 22:23:40.921334	Update	System	roger85	Read	t	\N
8	1	The other party has requested approval to complete this job.	2018-12-02 22:23:40.921334	Confirmation	System	niceuser	Read	t	\N
9	1	Congratulations! You have successfully completed this job. Please take the time to submit a verified review for the other party.	2018-12-02 22:23:45.347918	Update	System	roger85	Read	t	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, notification_recipient, notification_message, notification_date, notification_status, notification_type) FROM stdin;
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offers (offer_id, offer_type, offer_term, completed_by, offer_price, offer_currency, offer_payment_type, offer_payment_period, offer_number_of_payments, offer_amount_type, offer_payment_1, offer_payment_2, offer_payment_3, offer_payment_4, offer_payment_5, offer_payment_6, offer_for_job, offer_created_date, offer_modified_date, offer_status, offer_confidentiality) FROM stdin;
1	User Determined	\N	\N	65	USD	Hour	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2018-12-02 22:23:25.637979	\N	Accepted	\N
\.


--
-- Data for Name: pinned_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pinned_jobs (pinned_id, pinned_job, pinned_by, pinned_date) FROM stdin;
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
1	roger85	Review	/user/roger85	2018-11-28 23:36:54.049402	Dismissed	douchebag	23
3	roger85	Review	/user/roger85	2018-12-01 21:12:46.960112	Pending	douchebag	23
5	roger85	Review	\N	2018-12-01 21:15:12.490268	Dismissed	douchebag	23
6	niceuser	User	/user/roger85	2018-12-02 01:45:05.364138	Pending	roger85	\N
\.


--
-- Data for Name: sectors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sectors (sector_id, sector, sector_created_on, sector_created_by, sector_status) FROM stdin;
1	Artists	2018-08-18 18:26:59.643187	roger85	Open
29	Test sector	2018-11-11 01:19:01.513615	roger85	Delete
22	Securities	2018-10-18 00:33:57.326352	roger85	Close
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
1	Site	Active
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
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (plan_id, plan_name, plan_price, plan_created_date, plan_status) FROM stdin;
1	User	0	2018-11-02 20:29:59.317856	Active
3	Business	15	2018-11-02 20:29:59.317856	Active
2	Listing	7	2018-11-02 20:29:59.317856	Active
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

COPY public.user_listings (listing_id, listing_user, listing_created_date, listing_sector, listing_price, listing_price_type, listing_price_currency, listing_negotiable, listing_detail, listing_status, listing_renewed_date, listing_title, listing_end_date, listing_purpose) FROM stdin;
2	niceuser	2018-12-02 21:40:58.221678	Info Tech	18	Hour	USD	f	I'll take care of your flowers	Inactive	2018-12-02 21:40:58.221678	placeholder	\N	\N
4	payinguser2	2018-12-16 23:01:39.382042	Personal	200	Hour	CAD	f	Come join me.	Active	2018-12-16 23:01:39.382042	I provide HE, BBBJ, CIM, backdoor, and shower together	\N	For Hire
1	roger85	2018-12-02 15:38:10.555639	Info Tech	65	Hour	USD	f	Looking for work!	Active	2018-12-02 15:38:10.555639	Full stack web developer	\N	For Hire
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (user_profile_id, user_firstname, user_lastname, avatar_url, user_title, user_education, user_bio, user_github, user_twitter, user_facebook, user_website, user_linkedin, user_instagram, user_city, user_region, user_country, user_business_name, user_worldwide, user_phone, user_address, user_city_code) FROM stdin;
3	Steve	Lilliac	/images/profile.png	Renovator	\N	\N	\N	\N	\N	\N	\N	\N	Denver	Colorado	United States	\N	\N	\N	\N	\N
2	Mandy	White	/user_files/2/profile_pic.jpg	Florist	\N	\N	\N	\N	\N	\N	\N	\N	Vancouver	British Columbia	Canada	\N	\N	\N	3475 E 27th Ave	V5R1P8
22	Abu	Shakira	/user_files/22/profile_pic.jpg	Gigolo	\N	\N	\N	\N	\N	\N	\N	\N	Lake City	Louisiana	United States	\N	\N	249-295-2952	249 Horny Rd.	25251
20	Mike	Cruz	/user_files/20/profile_pic.jpg	Realtor	\N	\N	\N	\N	\N	\N	\N	\N	Vancouver	British Columbia	Canada	\N	\N	\N	\N	\N
23	anon	anon	/images/profile.png	none	\N	\N	\N	\N	\N	\N	\N	\N	allala	British Columbia	Canada	\N	\N	\N	\N	\N
21	Abdu	Amar	/images/profile.png	Auto Mechanic	\N	\N	\N	\N	\N	\N	\N	\N	some city	Baja California	Mexico	\N	\N	\N	somehwere in mexico	25251
1	Roger	Chin	/user_files/1/profile_pic_1545873879352.jpg	Web Developer	BCIT	Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda ullam repellat maiores aperiam debitis iure, repudiandae maxime pariatur nam rerum quasi numquam aliquid illo temporibus amet officiis, veritatis ipsum? Illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur similique quae tenetur repellat earum voluptate, reiciendis doloribus. Pariatur atque porro sunt autem quod harum soluta necessitatibus tempora hic. Molestias, harum! Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic molestiae nihil, optio accusantium repellat ex cupiditate commodi similique facere minus maxime explicabo dolorum neque veniam corrupti ipsa debitis. Pariatur, necessitatibus. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus voluptatem, a molestias aperiam obcaecati doloribus harum veritatis suscipit asperiores hic exercitationem molestiae aliquid soluta minima! Laborum placeat saepe dolores! Enim.	https://www.github.com	https://www.twitter.com	https://www.facebook.com	https://www.rogerchin.me	https://www.linkedin.com	https://www.instagram.com	Vancouver	British Columbia	Canada	RC Web Development	\N	604-889-8353	3475 E 27th Ave	V5R1P8
\.


--
-- Data for Name: user_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_reviews (review_id, reviewer, review_token, review_date, token_status, reviewing, review, review_rating, review_modified_date, review_job_id, review_status) FROM stdin;
1	roger85	U2FsdGVkX1%2BxnE%2BlK4vF6v51Byy7J0xoXwgJjnUfE3M%3D	2018-11-25 03:38:28.999314	Valid	niceuser	\N	\N	\N	2	Active
4	roger85	U2FsdGVkX1%2BkJQaAL51iG0td56MJ%2BZcARpGRLI%2BoKSc%3D	2018-11-25 22:23:10.132438	Valid	niceuser	\N	\N	\N	18	Active
6	roger85	U2FsdGVkX1%2BV1hY0M%2FCAYIvr%2BBVChIcDiWmJAqE2dvw%3D	2018-11-25 22:26:28.800411	Valid	niceuser	\N	\N	\N	21	Active
7	niceuser	U2FsdGVkX19PnJxRKyaw%2Fna1wo5nzLjBh%2BjDhmQpEy4%3D	2018-11-25 22:26:28.800411	Valid	roger85	\N	\N	\N	21	Active
8	roger85	U2FsdGVkX18wze7zm67T%2F0ehFhre0%2BBYF1h7AR7HBBU%3D	2018-11-25 22:34:53.480417	Valid	niceuser	\N	\N	\N	23	Active
9	niceuser	U2FsdGVkX19KcTaVLkYXLOLxlD8PPoX8%2B96INNkPZ0Q%3D	2018-11-25 22:34:53.480417	Valid	roger85	\N	\N	\N	23	Active
10	roger85	U2FsdGVkX1%2Bb8EfrmsIG8tH3%2FGTQprwSV%2BJj8tP5F3E%3D	2018-11-25 22:35:57.713405	Valid	niceuser	\N	\N	\N	24	Active
11	niceuser	U2FsdGVkX1%2B1DbdFkwmlTuplZNZlv1dB3qDDPcG8QDE%3D	2018-11-25 22:35:57.713405	Valid	roger85	\N	\N	\N	24	Active
2	niceuser	U2FsdGVkX18wxdOnwrUtJ7QwVLM8QF0hHGR1H0kx9UY%3D	2018-11-25 03:38:28.999314	Invalid	roger85	test	5	\N	2	Active
5	niceuser	U2FsdGVkX1%2FF7SOnkcVunmwcmhK76nOaOEdPPQni7fY%3D	2018-11-25 22:23:10.132438	Invalid	roger85	awesome	5	2018-11-25 23:33:11.675737	18	Active
23	douchebag	\N	2018-11-26 17:33:10.036567	Valid	roger85	worked with this fucker, he sucks and doesn't do his job properly.	1	\N	\N	Active
24	niceuser	U2FsdGVkX1%2BZGl0YTTqieXfyPY44LQMxBkYXgkxP7DI%3D	2018-12-02 22:23:45.347918	Invalid	roger85	Perfect work once again!	5	\N	1	Active
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_settings (user_setting_id, hide_email, display_fullname, email_notifications, allow_messaging, display_business_hours) FROM stdin;
3	f	f	f	t	f
20	f	f	f	t	f
2	f	f	f	f	f
21	f	f	f	t	f
22	f	f	f	t	f
23	f	f	f	t	f
1	\N	\N	\N	t	t
\.


--
-- Data for Name: user_view_count; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_view_count (viewing_user, view_count) FROM stdin;
roger85	752
payinguser2	13
niceuser	10
\.


--
-- Data for Name: user_warnings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_warnings (warning_id, warning, warning_date, warned_by, warned_user) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, user_password, user_email, user_created_on, user_status, account_type, user_this_login, user_last_login, user_level, registration_key, reg_key_expire_date, is_subscribed, stripe_cust_id, subscription_id, subscription_end_date, plan_id) FROM stdin;
20	newuser	$2b$10$mQXOh6TuVzEO3v/56fl6HOXVEKMMjqIghQQkyw6wYS6GYxQn5cWWC	rogerchin1985@gmail.com	2018-12-02 20:05:19.148015	Active	User	2018-12-23 16:25:01.782332	2018-12-16 03:25:14.395	0	U2FsdGVkX185kxIsRVDrXGUlAZFk3zXvinsVonujB9riZaVAd5LaXH53vlmrfuLQ	2018-12-03 23:31:56.334803	f	\N	\N	\N	\N
1	roger85	$2b$10$z4XMgEDiFmDSJyD/zOSyiO7deH9Ql1.J/DlklBisM2LwC/e002QqO	rogerchin85@gmail.com	2018-11-15 22:36:02.429469	Active	Listing	2019-01-01 12:05:40.964874	2018-12-29 19:49:10.836	99	U2FsdGVkX19MYpIksa3zVa8PVfGmsjtSQ0qTldysg1mKm1hFTsUASJmOBC8MK7L5	2018-11-16 22:38:35.385272	t	cus_EBGVDMBmNoyQnx	sub_EFo5FIUNW7ukxp	2019-01-19 00:00:00	plan_EAIyF94Yhy1BLB
3	douchebag	$2b$10$5ky8eb0ckcJmaPwAu7Edbuk7FeFb7jo5hR161iHHikF9sXfUSvEZu	steve-lilliac@fakegmail.com	2018-11-26 17:30:25.600295	Suspend	User	2018-12-01 22:44:42.490799	2018-11-27 18:26:44.036	0	U2FsdGVkX1/LD8prWMMkru7R1tzxYopXrGPZThObFFh1gWwkiuCDI0/t2GY7SVPD	2018-11-27 17:30:25.600295	f	\N	\N	\N	\N
23	cannot_register	$2b$10$DT1jYcUlwte1RBRrPMkdx.RSQOkmOZ6QU.xQmwbArzOLXUODp7jJa	anon@anon.com	2018-12-16 18:04:41.926394	Active	User	\N	\N	0	U2FsdGVkX1/O89RMv8T3RHFvTYW6+NZ/Pv0MUehg7hU=	2018-12-17 18:04:41.926394	f	\N	\N	\N	\N
2	niceuser	$2b$10$Wr/A4rJtpLIt6Kv2oCaNGetM79eFNF/49QAf1ul2/FofapOD8JiDK	niceuser@nice.com	2018-11-24 22:58:15.672353	Active	Listing	2018-12-26 14:50:03.043606	2018-12-25 02:48:39.346	0	U2FsdGVkX18uQ845PC7lKh2iZ1Fha91xaQNLUdh7UMAg4N5O13PEZ6dcmtfLvuK6	2018-11-25 22:58:15.672353	t	cus_EEFj0YW9924tr0	sub_EEdrhHn65JIdmc	2019-01-27 17:00:16.278834	plan_EAIyF94Yhy1BLB
21	payinguser	$2b$10$3aLCXj5lgpa9vousmAfbjebV5gPezvQcm/rxgUPv/Pr/ngFQ0h9BK	abdu1010101@gmail.com	2018-12-16 17:38:35.540182	Active	User	2018-12-16 18:09:23.275716	\N	0	U2FsdGVkX1+6DNiBk2FLpJN2XPVH9XSbc763n2DLsoq9TtdDYNS47HA2W+3vaPzZ	2018-12-17 17:38:35.540182	f	\N	\N	\N	\N
22	payinguser2	$2b$10$rXQ2jPkBYPkQ6fg4TXlFwOtgqGPkEwr/yeiur1fobItj9YhkaYv6a	abu201812@gmail.com	2018-12-16 17:46:16.080273	Active	Listing	2018-12-16 20:09:57.082279	\N	0	U2FsdGVkX1/QEnxnzz2nlxbNWdpVjUx4OxN9ox4sM7ONqjYCwwMEZDQflYlAVuq8	2018-12-17 17:46:16.080273	t	cus_EAzF9Bk1S30kh5	sub_EAzFLglAvRQs10	2019-01-18 23:45:36.127497	\N
\.


--
-- Name: activities_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activities_activity_id_seq', 12, true);


--
-- Name: announcements_annoucement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_annoucement_id_seq', 14, true);


--
-- Name: appealed_abandon_aa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appealed_abandon_aa_id_seq', 1, false);


--
-- Name: business_hours_business_hour_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_hours_business_hour_id_seq', 10, true);


--
-- Name: error_logs_error_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.error_logs_error_id_seq', 792, true);


--
-- Name: jobs_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_job_id_seq', 1, true);


--
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_message_id_seq', 9, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 1, false);


--
-- Name: offers_offer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.offers_offer_id_seq', 1, true);


--
-- Name: pinned_jobs_pinned_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pinned_jobs_pinned_id_seq', 1, false);


--
-- Name: promotions_promo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotions_promo_id_seq', 1, true);


--
-- Name: reports_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_report_id_seq', 6, true);


--
-- Name: review_tokens_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_tokens_token_id_seq', 24, true);


--
-- Name: sectors_sector_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sectors_sector_id_seq', 29, true);


--
-- Name: site_config_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_config_configs_id_seq', 2, true);


--
-- Name: site_review_site_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_review_site_review_id_seq', 7, true);


--
-- Name: subscription_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscription_plans_plan_id_seq', 3, true);


--
-- Name: user_bans_ban_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_bans_ban_id_seq', 4, true);


--
-- Name: user_listings_listing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_listings_listing_id_seq', 4, true);


--
-- Name: user_warnings_warning_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_warnings_warning_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 23, true);


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
-- Name: error_log error_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_log
    ADD CONSTRAINT error_logs_pkey PRIMARY KEY (error_id);


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
-- Name: notifications nofitications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT nofitications_pkey PRIMARY KEY (notification_id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (offer_id);


--
-- Name: pinned_jobs pinned_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs
    ADD CONSTRAINT pinned_jobs_pkey PRIMARY KEY (pinned_id);


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
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (plan_id);


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
    ADD CONSTRAINT unique_error UNIQUE (error_name, error_message, error_url);


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
-- Name: business_hours unique_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT unique_user UNIQUE (business_owner);


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
-- Name: no_duplication_abandon_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX no_duplication_abandon_request ON public.messages USING btree (belongs_to_job, message_type) WHERE ((message_type)::text = 'Abandonment'::text);


--
-- Name: no_duplication_completion_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX no_duplication_completion_request ON public.messages USING btree (belongs_to_job, message_body, message_type) WHERE ((message_body = 'The other party has requested approval to complete this job.'::text) AND ((message_type)::text = 'Confirmation'::text));


--
-- Name: unique_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_listing ON public.user_listings USING btree (listing_user, listing_sector) WHERE ((listing_status)::text <> 'Delete'::text);


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
    ADD CONSTRAINT appealed_abandon_appeal_abandoned_job_id_fkey FOREIGN KEY (appeal_abandoned_job_id) REFERENCES public.jobs(job_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_hours business_hours_business_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_business_owner_fkey FOREIGN KEY (business_owner) REFERENCES public.users(username);


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
-- Name: jobs jobs_job_client_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_client_fkey FOREIGN KEY (job_client) REFERENCES public.users(username);


--
-- Name: jobs jobs_job_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_service_id_fkey FOREIGN KEY (job_listing_id) REFERENCES public.user_listings(listing_id);


--
-- Name: jobs jobs_job_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_user_fkey FOREIGN KEY (job_user) REFERENCES public.users(username);


--
-- Name: messages messages_belongs_to_job_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_belongs_to_job_fkey FOREIGN KEY (belongs_to_job) REFERENCES public.jobs(job_id) ON DELETE CASCADE;


--
-- Name: messages messages_message_recipient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_message_recipient_fkey FOREIGN KEY (message_recipient) REFERENCES public.users(username);


--
-- Name: notifications nofitications_notification_recipient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT nofitications_notification_recipient_fkey FOREIGN KEY (notification_recipient) REFERENCES public.users(username);


--
-- Name: offers offers_offer_for_job_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_offer_for_job_fkey FOREIGN KEY (offer_for_job) REFERENCES public.jobs(job_id);


--
-- Name: pinned_jobs pinned_jobs_pinned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs
    ADD CONSTRAINT pinned_jobs_pinned_by_fkey FOREIGN KEY (pinned_by) REFERENCES public.users(username);


--
-- Name: pinned_jobs pinned_jobs_pinned_job_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pinned_jobs
    ADD CONSTRAINT pinned_jobs_pinned_job_fkey FOREIGN KEY (pinned_job) REFERENCES public.jobs(job_id);


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

