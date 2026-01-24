--
-- PostgreSQL database dump
--

\restrict z8tblbapaWC0fjnjXESkBqhtIWl1ke6tBJOzyYjJPgCkTpKa7MCYasxZPnAwexa

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: allocation_target; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.allocation_target AS ENUM (
    'USAGE',
    'INVENTORY'
);


--
-- Name: asset_condition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.asset_condition AS ENUM (
    'Baru',
    'Baik',
    'Bekas Layak Pakai',
    'Rusak Ringan',
    'Rusak Berat',
    'Kanibal'
);


--
-- Name: asset_return_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.asset_return_status AS ENUM (
    'Menunggu Verifikasi',
    'Disetujui Sebagian',
    'Selesai Diverifikasi',
    'Ditolak'
);


--
-- Name: asset_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.asset_status AS ENUM (
    'Di Gudang',
    'Digunakan',
    'Dipegang (Custody)',
    'Dalam Perbaikan',
    'Keluar (Service)',
    'Rusak',
    'Diberhentikan',
    'Menunggu Pengembalian',
    'Habis Terpakai'
);


--
-- Name: attachment_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.attachment_type AS ENUM (
    'IMAGE',
    'PDF',
    'OTHER'
);


--
-- Name: bulk_tracking_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bulk_tracking_mode AS ENUM (
    'COUNT',
    'MEASUREMENT'
);


--
-- Name: customer_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.customer_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


--
-- Name: item_approval_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.item_approval_status AS ENUM (
    'APPROVED',
    'REJECTED',
    'PARTIAL',
    'STOCK_ALLOCATED',
    'PROCUREMENT_NEEDED'
);


--
-- Name: item_classification; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.item_classification AS ENUM (
    'ASSET',
    'MATERIAL'
);


--
-- Name: item_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.item_status AS ENUM (
    'Menunggu',
    'Disetujui Logistik',
    'Menunggu CEO',
    'Disetujui',
    'Proses Pembelian',
    'Dalam Pengiriman',
    'Tiba',
    'Selesai',
    'Ditolak',
    'Dibatalkan',
    'Siap Serah Terima',
    'Dalam Proses'
);


--
-- Name: loan_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.loan_request_status AS ENUM (
    'Menunggu Persetujuan',
    'Disetujui',
    'Dipinjam',
    'Dikembalikan',
    'Ditolak',
    'Terlambat',
    'Menunggu Pengembalian'
);


--
-- Name: location_context; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.location_context AS ENUM (
    'WAREHOUSE',
    'CUSTODY'
);


--
-- Name: movement_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.movement_type AS ENUM (
    'IN_PURCHASE',
    'IN_RETURN',
    'OUT_INSTALLATION',
    'OUT_HANDOVER',
    'OUT_BROKEN',
    'OUT_ADJUSTMENT',
    'OUT_USAGE_CUSTODY'
);


--
-- Name: order_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_type AS ENUM (
    'Regular Stock',
    'Urgent',
    'Project Based'
);


--
-- Name: return_item_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.return_item_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);


--
-- Name: tracking_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tracking_method AS ENUM (
    'INDIVIDUAL',
    'BULK'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'Super Admin',
    'Admin Logistik',
    'Admin Purchase',
    'Leader',
    'Staff'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _DivisionCategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_DivisionCategories" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


--
-- Name: _InstalledAssets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_InstalledAssets" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _MaintenanceAssets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_MaintenanceAssets" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id bigint NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id integer NOT NULL,
    user_name character varying(255) NOT NULL,
    action character varying(255) NOT NULL,
    details text NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id text NOT NULL,
    reference_id text,
    asset_id text,
    customer_id text,
    request_id text
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: asset_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    is_customer_installable boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: asset_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asset_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asset_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asset_categories_id_seq OWNED BY public.asset_categories.id;


--
-- Name: asset_return_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_return_items (
    id integer NOT NULL,
    return_id text NOT NULL,
    asset_id text NOT NULL,
    returned_condition public.asset_condition NOT NULL,
    notes text,
    status public.return_item_status NOT NULL,
    verification_notes text
);


--
-- Name: asset_return_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asset_return_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asset_return_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asset_return_items_id_seq OWNED BY public.asset_return_items.id;


--
-- Name: asset_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_returns (
    id text NOT NULL,
    doc_number character varying(50) NOT NULL,
    return_date timestamp(3) without time zone NOT NULL,
    loan_request_id text NOT NULL,
    returned_by_id integer NOT NULL,
    returned_by_name character varying(255) NOT NULL,
    status public.asset_return_status NOT NULL,
    verified_by_id integer,
    verified_by_name character varying(255),
    verification_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: asset_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_types (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(255) NOT NULL,
    classification public.item_classification,
    tracking_method public.tracking_method,
    unit_of_measure character varying(50),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: asset_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asset_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asset_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asset_types_id_seq OWNED BY public.asset_types.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assets (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    category_id integer NOT NULL,
    type_id integer,
    brand character varying(255) NOT NULL,
    serial_number character varying(255),
    mac_address character varying(100),
    purchase_price numeric(15,2),
    vendor character varying(255),
    po_number character varying(100),
    invoice_number character varying(100),
    purchase_date date,
    warranty_end_date date,
    status public.asset_status NOT NULL,
    condition public.asset_condition NOT NULL,
    location character varying(255),
    location_detail text,
    current_user_id integer,
    current_user_name character varying(255),
    initial_balance numeric(10,2),
    current_balance numeric(10,2),
    quantity integer DEFAULT 1,
    wo_ro_int_number character varying(100),
    is_dismantled boolean DEFAULT false NOT NULL,
    dismantle_id text,
    dismantle_info jsonb,
    notes text,
    registration_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    recorded_by_id integer NOT NULL,
    last_modified_date timestamp(3) without time zone NOT NULL,
    last_modified_by_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    url text NOT NULL,
    type public.attachment_type NOT NULL,
    size integer,
    mime_type character varying(100),
    entity_type character varying(50) NOT NULL,
    entity_id text NOT NULL,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    asset_id text,
    customer_id text,
    installation_id text,
    maintenance_id text,
    dismantle_id text
);


--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    status public.customer_status NOT NULL,
    installation_date date NOT NULL,
    service_package character varying(255) NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: dismantles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dismantles (
    id text NOT NULL,
    doc_number character varying(50) NOT NULL,
    request_number character varying(50),
    asset_id text NOT NULL,
    asset_name character varying(255) NOT NULL,
    dismantle_date timestamp(3) without time zone NOT NULL,
    technician_id integer NOT NULL,
    technician_name character varying(255) NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_id text NOT NULL,
    customer_address text NOT NULL,
    retrieved_condition public.asset_condition NOT NULL,
    notes text,
    acknowledger_id integer,
    acknowledger_name character varying(255),
    status public.item_status NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.divisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: divisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.divisions_id_seq OWNED BY public.divisions.id;


--
-- Name: handover_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.handover_items (
    id integer NOT NULL,
    handover_id text NOT NULL,
    asset_id text,
    item_name character varying(255) NOT NULL,
    item_type_brand character varying(255) NOT NULL,
    condition_notes text NOT NULL,
    quantity integer NOT NULL,
    unit character varying(50),
    checked boolean DEFAULT false NOT NULL,
    is_locked boolean DEFAULT false NOT NULL
);


--
-- Name: handover_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.handover_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: handover_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.handover_items_id_seq OWNED BY public.handover_items.id;


--
-- Name: handovers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.handovers (
    id text NOT NULL,
    doc_number character varying(50) NOT NULL,
    handover_date timestamp(3) without time zone NOT NULL,
    menyerahkan_id integer NOT NULL,
    menyerahkan_name character varying(255) NOT NULL,
    penerima_id integer NOT NULL,
    penerima_name character varying(255) NOT NULL,
    mengetahui_id integer NOT NULL,
    mengetahui_name character varying(255) NOT NULL,
    wo_ro_int_number character varying(100),
    status public.item_status NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: installation_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installation_materials (
    id integer NOT NULL,
    installation_id text NOT NULL,
    material_asset_id text,
    item_name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit character varying(50) NOT NULL
);


--
-- Name: installation_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.installation_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: installation_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.installation_materials_id_seq OWNED BY public.installation_materials.id;


--
-- Name: installations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installations (
    id text NOT NULL,
    doc_number character varying(50) NOT NULL,
    request_number character varying(50),
    installation_date timestamp(3) without time zone NOT NULL,
    technician_id integer NOT NULL,
    technician_name character varying(255) NOT NULL,
    customer_id text NOT NULL,
    customer_name character varying(255) NOT NULL,
    notes text NOT NULL,
    status public.item_status NOT NULL,
    acknowledger_id integer,
    acknowledger_name character varying(255),
    created_by_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: installed_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installed_materials (
    id integer NOT NULL,
    customer_id text NOT NULL,
    material_asset_id text,
    item_name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit character varying(50) NOT NULL,
    installation_date timestamp(3) without time zone NOT NULL
);


--
-- Name: installed_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.installed_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: installed_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.installed_materials_id_seq OWNED BY public.installed_materials.id;


--
-- Name: loan_asset_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_asset_assignments (
    id integer NOT NULL,
    loan_request_id text NOT NULL,
    loan_item_id integer NOT NULL,
    asset_id text NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    returned_at timestamp(3) without time zone
);


--
-- Name: loan_asset_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_asset_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_asset_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_asset_assignments_id_seq OWNED BY public.loan_asset_assignments.id;


--
-- Name: loan_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_items (
    id integer NOT NULL,
    loan_request_id text NOT NULL,
    item_name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit character varying(50),
    keterangan text NOT NULL,
    return_date date,
    approval_status public.item_approval_status,
    approved_quantity integer,
    rejection_reason text
);


--
-- Name: loan_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_items_id_seq OWNED BY public.loan_items.id;


--
-- Name: loan_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_requests (
    id text NOT NULL,
    requester_id integer NOT NULL,
    requester_name character varying(255) NOT NULL,
    division_id integer NOT NULL,
    division_name character varying(255) NOT NULL,
    request_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public.loan_request_status NOT NULL,
    notes text,
    approver_id integer,
    approver_name character varying(255),
    approval_date timestamp(3) without time zone,
    rejection_reason text,
    actual_return_date timestamp(3) without time zone,
    handover_id text,
    returned_asset_ids jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: maintenance_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_materials (
    id integer NOT NULL,
    maintenance_id text NOT NULL,
    material_asset_id text,
    item_name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit character varying(50) NOT NULL
);


--
-- Name: maintenance_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maintenance_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maintenance_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maintenance_materials_id_seq OWNED BY public.maintenance_materials.id;


--
-- Name: maintenance_replacements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_replacements (
    id integer NOT NULL,
    maintenance_id text NOT NULL,
    old_asset_id text NOT NULL,
    new_asset_id text NOT NULL,
    retrieved_asset_condition public.asset_condition NOT NULL
);


--
-- Name: maintenance_replacements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maintenance_replacements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maintenance_replacements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maintenance_replacements_id_seq OWNED BY public.maintenance_replacements.id;


--
-- Name: maintenances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenances (
    id text NOT NULL,
    doc_number character varying(50) NOT NULL,
    request_number character varying(50),
    maintenance_date timestamp(3) without time zone NOT NULL,
    technician_id integer NOT NULL,
    technician_name character varying(255) NOT NULL,
    customer_id text NOT NULL,
    customer_name character varying(255) NOT NULL,
    problem_description text NOT NULL,
    actions_taken text NOT NULL,
    work_types text[],
    priority character varying(50),
    status public.item_status NOT NULL,
    completed_by_id integer,
    completed_by_name character varying(255),
    completion_date timestamp(3) without time zone,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    recipient_id integer NOT NULL,
    actor_name character varying(255) NOT NULL,
    reference_id text,
    is_read boolean DEFAULT false NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action_data jsonb
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: request_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_activities (
    id bigint NOT NULL,
    request_id text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    author_id integer NOT NULL,
    author_name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    parent_id bigint,
    payload jsonb NOT NULL
);


--
-- Name: request_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.request_activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: request_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.request_activities_id_seq OWNED BY public.request_activities.id;


--
-- Name: request_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_items (
    id integer NOT NULL,
    request_id text NOT NULL,
    item_name character varying(255) NOT NULL,
    item_type_brand character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit character varying(50),
    keterangan text NOT NULL,
    available_stock integer,
    category_id integer,
    type_id integer,
    approval_status public.item_approval_status,
    approved_quantity integer,
    rejection_reason text,
    purchase_price numeric(15,2),
    vendor character varying(255),
    po_number character varying(100),
    invoice_number character varying(100),
    purchase_date date,
    warranty_end_date date,
    purchase_filled_by_id integer,
    purchase_fill_date timestamp(3) without time zone,
    registered_quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: request_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.request_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: request_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.request_items_id_seq OWNED BY public.request_items.id;


--
-- Name: requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requests (
    id text NOT NULL,
    doc_number character varying(50),
    requester_id integer NOT NULL,
    requester_name character varying(255) NOT NULL,
    division_id integer NOT NULL,
    division_name character varying(255) NOT NULL,
    request_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_type public.order_type NOT NULL,
    allocation_target public.allocation_target,
    justification text,
    project_name character varying(255),
    status public.item_status NOT NULL,
    total_value numeric(15,2),
    logistic_approver_id integer,
    logistic_approver_name character varying(255),
    logistic_approval_date timestamp(3) without time zone,
    final_approver_id integer,
    final_approver_name character varying(255),
    final_approval_date timestamp(3) without time zone,
    rejected_by_id integer,
    rejected_by_name character varying(255),
    rejected_by_division character varying(255),
    rejection_date timestamp(3) without time zone,
    rejection_reason text,
    actual_shipment_date timestamp(3) without time zone,
    arrival_date timestamp(3) without time zone,
    completion_date timestamp(3) without time zone,
    completed_by_id integer,
    completed_by_name character varying(255),
    is_prioritized_by_ceo boolean DEFAULT false NOT NULL,
    ceo_disposition_date timestamp(3) without time zone,
    ceo_follow_up_sent boolean DEFAULT false NOT NULL,
    last_follow_up_at timestamp(3) without time zone,
    is_registered boolean DEFAULT false NOT NULL,
    partially_registered_items jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: standard_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standard_items (
    id integer NOT NULL,
    type_id integer NOT NULL,
    name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    bulk_type public.bulk_tracking_mode,
    unit_of_measure character varying(50),
    base_unit_of_measure character varying(50),
    quantity_per_unit integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: standard_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.standard_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: standard_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.standard_items_id_seq OWNED BY public.standard_items.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id bigint NOT NULL,
    asset_name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public.movement_type NOT NULL,
    quantity numeric(10,2) NOT NULL,
    balance_after numeric(10,2) NOT NULL,
    reference_id character varying(255),
    actor_id integer NOT NULL,
    actor_name character varying(255) NOT NULL,
    notes text,
    location_context public.location_context,
    related_asset_id text
);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_movements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: stock_thresholds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_thresholds (
    id integer NOT NULL,
    item_name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    category_id integer,
    threshold_value integer NOT NULL,
    alert_enabled boolean DEFAULT true NOT NULL,
    created_by_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: stock_thresholds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_thresholds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_thresholds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_thresholds_id_seq OWNED BY public.stock_thresholds.id;


--
-- Name: system_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_configs (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text NOT NULL,
    data_type character varying(20) NOT NULL,
    category character varying(50) NOT NULL,
    description text,
    is_public boolean DEFAULT false NOT NULL,
    updated_by_id integer,
    updated_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: system_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_configs_id_seq OWNED BY public.system_configs.id;


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    id integer NOT NULL,
    user_id integer NOT NULL,
    email_notifications boolean DEFAULT true NOT NULL,
    push_notifications boolean DEFAULT true NOT NULL,
    whatsapp_notifications boolean DEFAULT false NOT NULL,
    default_dashboard_view character varying(50),
    items_per_page integer DEFAULT 20 NOT NULL,
    theme character varying(20) DEFAULT 'light'::character varying NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_preferences_id_seq OWNED BY public.user_preferences.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    division_id integer,
    permissions text[],
    password_reset_token text,
    password_reset_expires timestamp(3) without time zone,
    password_reset_requested boolean DEFAULT false NOT NULL,
    password_reset_request_date timestamp(3) without time zone,
    last_login_at timestamp(3) without time zone,
    "refreshToken" text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: whatsapp_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_logs (
    id bigint NOT NULL,
    target_group character varying(100) NOT NULL,
    group_name character varying(255) NOT NULL,
    message text NOT NULL,
    reference_id text,
    reference_type character varying(50),
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    sent_at timestamp(3) without time zone,
    error_message text,
    sent_by_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_logs_id_seq OWNED BY public.whatsapp_logs.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: asset_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories ALTER COLUMN id SET DEFAULT nextval('public.asset_categories_id_seq'::regclass);


--
-- Name: asset_return_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_return_items ALTER COLUMN id SET DEFAULT nextval('public.asset_return_items_id_seq'::regclass);


--
-- Name: asset_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_types ALTER COLUMN id SET DEFAULT nextval('public.asset_types_id_seq'::regclass);


--
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- Name: divisions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions ALTER COLUMN id SET DEFAULT nextval('public.divisions_id_seq'::regclass);


--
-- Name: handover_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handover_items ALTER COLUMN id SET DEFAULT nextval('public.handover_items_id_seq'::regclass);


--
-- Name: installation_materials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_materials ALTER COLUMN id SET DEFAULT nextval('public.installation_materials_id_seq'::regclass);


--
-- Name: installed_materials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installed_materials ALTER COLUMN id SET DEFAULT nextval('public.installed_materials_id_seq'::regclass);


--
-- Name: loan_asset_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_asset_assignments ALTER COLUMN id SET DEFAULT nextval('public.loan_asset_assignments_id_seq'::regclass);


--
-- Name: loan_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_items ALTER COLUMN id SET DEFAULT nextval('public.loan_items_id_seq'::regclass);


--
-- Name: maintenance_materials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_materials ALTER COLUMN id SET DEFAULT nextval('public.maintenance_materials_id_seq'::regclass);


--
-- Name: maintenance_replacements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_replacements ALTER COLUMN id SET DEFAULT nextval('public.maintenance_replacements_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: request_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_activities ALTER COLUMN id SET DEFAULT nextval('public.request_activities_id_seq'::regclass);


--
-- Name: request_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_items ALTER COLUMN id SET DEFAULT nextval('public.request_items_id_seq'::regclass);


--
-- Name: standard_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_items ALTER COLUMN id SET DEFAULT nextval('public.standard_items_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: stock_thresholds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_thresholds ALTER COLUMN id SET DEFAULT nextval('public.stock_thresholds_id_seq'::regclass);


--
-- Name: system_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_configs ALTER COLUMN id SET DEFAULT nextval('public.system_configs_id_seq'::regclass);


--
-- Name: user_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_preferences_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: whatsapp_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_logs ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_logs_id_seq'::regclass);


--
-- Data for Name: _DivisionCategories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_DivisionCategories" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _InstalledAssets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_InstalledAssets" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _MaintenanceAssets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_MaintenanceAssets" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9440cea9-e57e-4201-9dad-477c69c0da6a	a3bdc7f8ebc2c7339efe649f06e2a8e40bafcebe645585eb5f74e2273fefb15d	2026-01-22 06:13:15.52842+00	20260122061314_init_start_fresh	\N	\N	2026-01-22 06:13:14.541256+00	1
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, "timestamp", user_id, user_name, action, details, entity_type, entity_id, reference_id, asset_id, customer_id, request_id) FROM stdin;
\.


--
-- Data for Name: asset_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asset_categories (id, name, is_customer_installable, created_at, updated_at) FROM stdin;
1	Network Equipment	t	2026-01-22 10:27:04.245	2026-01-22 10:27:04.245
2	Computer Hardware	f	2026-01-22 10:27:04.264	2026-01-22 10:27:04.264
3	Office Equipment	f	2026-01-22 10:27:04.277	2026-01-22 10:27:04.277
4	Cable & Accessories	t	2026-01-22 10:27:04.292	2026-01-22 10:27:04.292
\.


--
-- Data for Name: asset_return_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asset_return_items (id, return_id, asset_id, returned_condition, notes, status, verification_notes) FROM stdin;
\.


--
-- Data for Name: asset_returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asset_returns (id, doc_number, return_date, loan_request_id, returned_by_id, returned_by_name, status, verified_by_id, verified_by_name, verification_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asset_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asset_types (id, category_id, name, classification, tracking_method, unit_of_measure, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assets (id, name, category_id, type_id, brand, serial_number, mac_address, purchase_price, vendor, po_number, invoice_number, purchase_date, warranty_end_date, status, condition, location, location_detail, current_user_id, current_user_name, initial_balance, current_balance, quantity, wo_ro_int_number, is_dismantled, dismantle_id, dismantle_info, notes, registration_date, recorded_by_id, last_modified_date, last_modified_by_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attachments (id, name, url, type, size, mime_type, entity_type, entity_id, uploaded_at, asset_id, customer_id, installation_id, maintenance_id, dismantle_id) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, name, address, phone, email, status, installation_date, service_package, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dismantles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dismantles (id, doc_number, request_number, asset_id, asset_name, dismantle_date, technician_id, technician_name, customer_name, customer_id, customer_address, retrieved_condition, notes, acknowledger_id, acknowledger_name, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.divisions (id, name, created_at, updated_at) FROM stdin;
1	Manajemen	2026-01-22 09:50:40.348	2026-01-21 17:00:00
2	Logistik	2026-01-22 10:27:03.987	2026-01-22 10:27:03.987
3	Purchase	2026-01-22 10:27:04.082	2026-01-22 10:27:04.082
\.


--
-- Data for Name: handover_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.handover_items (id, handover_id, asset_id, item_name, item_type_brand, condition_notes, quantity, unit, checked, is_locked) FROM stdin;
\.


--
-- Data for Name: handovers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.handovers (id, doc_number, handover_date, menyerahkan_id, menyerahkan_name, penerima_id, penerima_name, mengetahui_id, mengetahui_name, wo_ro_int_number, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: installation_materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.installation_materials (id, installation_id, material_asset_id, item_name, brand, quantity, unit) FROM stdin;
\.


--
-- Data for Name: installations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.installations (id, doc_number, request_number, installation_date, technician_id, technician_name, customer_id, customer_name, notes, status, acknowledger_id, acknowledger_name, created_by_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: installed_materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.installed_materials (id, customer_id, material_asset_id, item_name, brand, quantity, unit, installation_date) FROM stdin;
\.


--
-- Data for Name: loan_asset_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_asset_assignments (id, loan_request_id, loan_item_id, asset_id, assigned_at, returned_at) FROM stdin;
\.


--
-- Data for Name: loan_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_items (id, loan_request_id, item_name, brand, quantity, unit, keterangan, return_date, approval_status, approved_quantity, rejection_reason) FROM stdin;
\.


--
-- Data for Name: loan_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_requests (id, requester_id, requester_name, division_id, division_name, request_date, status, notes, approver_id, approver_name, approval_date, rejection_reason, actual_return_date, handover_id, returned_asset_ids, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: maintenance_materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenance_materials (id, maintenance_id, material_asset_id, item_name, brand, quantity, unit) FROM stdin;
\.


--
-- Data for Name: maintenance_replacements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenance_replacements (id, maintenance_id, old_asset_id, new_asset_id, retrieved_asset_condition) FROM stdin;
\.


--
-- Data for Name: maintenances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenances (id, doc_number, request_number, maintenance_date, technician_id, technician_name, customer_id, customer_name, problem_description, actions_taken, work_types, priority, status, completed_by_id, completed_by_name, completion_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, message, type, recipient_id, actor_name, reference_id, is_read, "timestamp", action_data) FROM stdin;
\.


--
-- Data for Name: request_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.request_activities (id, request_id, "timestamp", author_id, author_name, type, parent_id, payload) FROM stdin;
\.


--
-- Data for Name: request_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.request_items (id, request_id, item_name, item_type_brand, quantity, unit, keterangan, available_stock, category_id, type_id, approval_status, approved_quantity, rejection_reason, purchase_price, vendor, po_number, invoice_number, purchase_date, warranty_end_date, purchase_filled_by_id, purchase_fill_date, registered_quantity, created_at) FROM stdin;
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requests (id, doc_number, requester_id, requester_name, division_id, division_name, request_date, order_type, allocation_target, justification, project_name, status, total_value, logistic_approver_id, logistic_approver_name, logistic_approval_date, final_approver_id, final_approver_name, final_approval_date, rejected_by_id, rejected_by_name, rejected_by_division, rejection_date, rejection_reason, actual_shipment_date, arrival_date, completion_date, completed_by_id, completed_by_name, is_prioritized_by_ceo, ceo_disposition_date, ceo_follow_up_sent, last_follow_up_at, is_registered, partially_registered_items, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: standard_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.standard_items (id, type_id, name, brand, bulk_type, unit_of_measure, base_unit_of_measure, quantity_per_unit, created_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_movements (id, asset_name, brand, date, type, quantity, balance_after, reference_id, actor_id, actor_name, notes, location_context, related_asset_id) FROM stdin;
\.


--
-- Data for Name: stock_thresholds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_thresholds (id, item_name, brand, category_id, threshold_value, alert_enabled, created_by_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_configs (id, key, value, data_type, category, description, is_public, updated_by_id, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (id, user_id, email_notifications, push_notifications, whatsapp_notifications, default_dashboard_view, items_per_page, theme, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, division_id, permissions, password_reset_token, password_reset_expires, password_reset_requested, password_reset_request_date, last_login_at, "refreshToken", is_active, created_at, updated_at) FROM stdin;
6	Super Admin	admin@trinity.com	$2b$10$oeiua78mBoklCvvu698pL.AnKAlO2PFmbqjF1qKNZM./yic9luRMq	Super Admin	2	\N	\N	\N	f	\N	\N	\N	t	2026-01-22 10:43:37.601	2026-01-22 10:43:37.601
\.


--
-- Data for Name: whatsapp_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_logs (id, target_group, group_name, message, reference_id, reference_type, status, sent_at, error_message, sent_by_id, created_at) FROM stdin;
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: asset_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asset_categories_id_seq', 4, true);


--
-- Name: asset_return_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asset_return_items_id_seq', 1, false);


--
-- Name: asset_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asset_types_id_seq', 1, false);


--
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attachments_id_seq', 1, false);


--
-- Name: divisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.divisions_id_seq', 3, true);


--
-- Name: handover_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.handover_items_id_seq', 1, false);


--
-- Name: installation_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.installation_materials_id_seq', 1, false);


--
-- Name: installed_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.installed_materials_id_seq', 1, false);


--
-- Name: loan_asset_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_asset_assignments_id_seq', 1, false);


--
-- Name: loan_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_items_id_seq', 1, false);


--
-- Name: maintenance_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maintenance_materials_id_seq', 1, false);


--
-- Name: maintenance_replacements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maintenance_replacements_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: request_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.request_activities_id_seq', 1, false);


--
-- Name: request_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.request_items_id_seq', 1, false);


--
-- Name: standard_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.standard_items_id_seq', 1, false);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 1, false);


--
-- Name: stock_thresholds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_thresholds_id_seq', 1, false);


--
-- Name: system_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_configs_id_seq', 1, false);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_preferences_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.whatsapp_logs_id_seq', 1, false);


--
-- Name: _DivisionCategories _DivisionCategories_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_DivisionCategories"
    ADD CONSTRAINT "_DivisionCategories_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _InstalledAssets _InstalledAssets_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_InstalledAssets"
    ADD CONSTRAINT "_InstalledAssets_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _MaintenanceAssets _MaintenanceAssets_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_MaintenanceAssets"
    ADD CONSTRAINT "_MaintenanceAssets_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: asset_categories asset_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_pkey PRIMARY KEY (id);


--
-- Name: asset_return_items asset_return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_return_items
    ADD CONSTRAINT asset_return_items_pkey PRIMARY KEY (id);


--
-- Name: asset_returns asset_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_returns
    ADD CONSTRAINT asset_returns_pkey PRIMARY KEY (id);


--
-- Name: asset_types asset_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: dismantles dismantles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dismantles
    ADD CONSTRAINT dismantles_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);


--
-- Name: handover_items handover_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handover_items
    ADD CONSTRAINT handover_items_pkey PRIMARY KEY (id);


--
-- Name: handovers handovers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handovers
    ADD CONSTRAINT handovers_pkey PRIMARY KEY (id);


--
-- Name: installation_materials installation_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_materials
    ADD CONSTRAINT installation_materials_pkey PRIMARY KEY (id);


--
-- Name: installations installations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installations
    ADD CONSTRAINT installations_pkey PRIMARY KEY (id);


--
-- Name: installed_materials installed_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installed_materials
    ADD CONSTRAINT installed_materials_pkey PRIMARY KEY (id);


--
-- Name: loan_asset_assignments loan_asset_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_asset_assignments
    ADD CONSTRAINT loan_asset_assignments_pkey PRIMARY KEY (id);


--
-- Name: loan_items loan_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_items
    ADD CONSTRAINT loan_items_pkey PRIMARY KEY (id);


--
-- Name: loan_requests loan_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_requests
    ADD CONSTRAINT loan_requests_pkey PRIMARY KEY (id);


--
-- Name: maintenance_materials maintenance_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_materials
    ADD CONSTRAINT maintenance_materials_pkey PRIMARY KEY (id);


--
-- Name: maintenance_replacements maintenance_replacements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_replacements
    ADD CONSTRAINT maintenance_replacements_pkey PRIMARY KEY (id);


--
-- Name: maintenances maintenances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: request_activities request_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_activities
    ADD CONSTRAINT request_activities_pkey PRIMARY KEY (id);


--
-- Name: request_items request_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_items
    ADD CONSTRAINT request_items_pkey PRIMARY KEY (id);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- Name: standard_items standard_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_items
    ADD CONSTRAINT standard_items_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stock_thresholds stock_thresholds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_thresholds
    ADD CONSTRAINT stock_thresholds_pkey PRIMARY KEY (id);


--
-- Name: system_configs system_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_configs
    ADD CONSTRAINT system_configs_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_logs whatsapp_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_logs
    ADD CONSTRAINT whatsapp_logs_pkey PRIMARY KEY (id);


--
-- Name: _DivisionCategories_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_DivisionCategories_B_index" ON public."_DivisionCategories" USING btree ("B");


--
-- Name: _InstalledAssets_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_InstalledAssets_B_index" ON public."_InstalledAssets" USING btree ("B");


--
-- Name: _MaintenanceAssets_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_MaintenanceAssets_B_index" ON public."_MaintenanceAssets" USING btree ("B");


--
-- Name: activity_logs_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_entity_type_entity_id_idx ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: activity_logs_timestamp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_timestamp_idx ON public.activity_logs USING btree ("timestamp");


--
-- Name: activity_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_user_id_idx ON public.activity_logs USING btree (user_id);


--
-- Name: asset_categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX asset_categories_name_key ON public.asset_categories USING btree (name);


--
-- Name: asset_return_items_asset_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX asset_return_items_asset_id_idx ON public.asset_return_items USING btree (asset_id);


--
-- Name: asset_return_items_return_id_asset_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX asset_return_items_return_id_asset_id_key ON public.asset_return_items USING btree (return_id, asset_id);


--
-- Name: asset_returns_doc_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX asset_returns_doc_number_idx ON public.asset_returns USING btree (doc_number);


--
-- Name: asset_returns_doc_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX asset_returns_doc_number_key ON public.asset_returns USING btree (doc_number);


--
-- Name: asset_returns_loan_request_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX asset_returns_loan_request_id_idx ON public.asset_returns USING btree (loan_request_id);


--
-- Name: asset_types_category_id_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX asset_types_category_id_name_key ON public.asset_types USING btree (category_id, name);


--
-- Name: asset_types_classification_tracking_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX asset_types_classification_tracking_method_idx ON public.asset_types USING btree (classification, tracking_method);


--
-- Name: assets_brand_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assets_brand_name_idx ON public.assets USING btree (brand, name);


--
-- Name: assets_current_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assets_current_user_id_idx ON public.assets USING btree (current_user_id);


--
-- Name: assets_mac_address_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assets_mac_address_idx ON public.assets USING btree (mac_address);


--
-- Name: assets_name_brand_notes_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assets_name_brand_notes_idx ON public.assets USING btree (name, brand, notes);


--
-- Name: assets_serial_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assets_serial_number_idx ON public.assets USING btree (serial_number);


--
-- Name: assets_status_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assets_status_category_id_idx ON public.assets USING btree (status, category_id);


--
-- Name: attachments_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_entity_type_entity_id_idx ON public.attachments USING btree (entity_type, entity_id);


--
-- Name: attachments_uploaded_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_uploaded_at_idx ON public.attachments USING btree (uploaded_at);


--
-- Name: customers_name_address_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_name_address_idx ON public.customers USING btree (name, address);


--
-- Name: customers_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_status_idx ON public.customers USING btree (status);


--
-- Name: dismantles_asset_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dismantles_asset_id_idx ON public.dismantles USING btree (asset_id);


--
-- Name: dismantles_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dismantles_customer_id_idx ON public.dismantles USING btree (customer_id);


--
-- Name: dismantles_doc_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dismantles_doc_number_idx ON public.dismantles USING btree (doc_number);


--
-- Name: dismantles_doc_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX dismantles_doc_number_key ON public.dismantles USING btree (doc_number);


--
-- Name: divisions_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX divisions_name_key ON public.divisions USING btree (name);


--
-- Name: handover_items_asset_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX handover_items_asset_id_idx ON public.handover_items USING btree (asset_id);


--
-- Name: handover_items_handover_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX handover_items_handover_id_idx ON public.handover_items USING btree (handover_id);


--
-- Name: handovers_doc_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX handovers_doc_number_idx ON public.handovers USING btree (doc_number);


--
-- Name: handovers_doc_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX handovers_doc_number_key ON public.handovers USING btree (doc_number);


--
-- Name: handovers_handover_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX handovers_handover_date_idx ON public.handovers USING btree (handover_date);


--
-- Name: installation_materials_installation_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX installation_materials_installation_id_idx ON public.installation_materials USING btree (installation_id);


--
-- Name: installations_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX installations_customer_id_idx ON public.installations USING btree (customer_id);


--
-- Name: installations_doc_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX installations_doc_number_idx ON public.installations USING btree (doc_number);


--
-- Name: installations_doc_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX installations_doc_number_key ON public.installations USING btree (doc_number);


--
-- Name: installed_materials_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX installed_materials_customer_id_idx ON public.installed_materials USING btree (customer_id);


--
-- Name: loan_asset_assignments_asset_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loan_asset_assignments_asset_id_idx ON public.loan_asset_assignments USING btree (asset_id);


--
-- Name: loan_asset_assignments_loan_request_id_loan_item_id_asset_i_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX loan_asset_assignments_loan_request_id_loan_item_id_asset_i_key ON public.loan_asset_assignments USING btree (loan_request_id, loan_item_id, asset_id);


--
-- Name: loan_items_loan_request_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loan_items_loan_request_id_idx ON public.loan_items USING btree (loan_request_id);


--
-- Name: loan_requests_requester_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loan_requests_requester_id_idx ON public.loan_requests USING btree (requester_id);


--
-- Name: loan_requests_status_request_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loan_requests_status_request_date_idx ON public.loan_requests USING btree (status, request_date);


--
-- Name: maintenance_materials_maintenance_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_materials_maintenance_id_idx ON public.maintenance_materials USING btree (maintenance_id);


--
-- Name: maintenance_replacements_maintenance_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_replacements_maintenance_id_idx ON public.maintenance_replacements USING btree (maintenance_id);


--
-- Name: maintenances_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenances_customer_id_idx ON public.maintenances USING btree (customer_id);


--
-- Name: maintenances_doc_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenances_doc_number_idx ON public.maintenances USING btree (doc_number);


--
-- Name: maintenances_doc_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX maintenances_doc_number_key ON public.maintenances USING btree (doc_number);


--
-- Name: maintenances_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenances_priority_idx ON public.maintenances USING btree (priority);


--
-- Name: notifications_recipient_id_is_read_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_recipient_id_is_read_idx ON public.notifications USING btree (recipient_id, is_read);


--
-- Name: notifications_timestamp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_timestamp_idx ON public.notifications USING btree ("timestamp");


--
-- Name: request_activities_request_id_timestamp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX request_activities_request_id_timestamp_idx ON public.request_activities USING btree (request_id, "timestamp");


--
-- Name: request_items_item_name_item_type_brand_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX request_items_item_name_item_type_brand_idx ON public.request_items USING btree (item_name, item_type_brand);


--
-- Name: request_items_request_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX request_items_request_id_idx ON public.request_items USING btree (request_id);


--
-- Name: requests_doc_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requests_doc_number_idx ON public.requests USING btree (doc_number);


--
-- Name: requests_doc_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX requests_doc_number_key ON public.requests USING btree (doc_number);


--
-- Name: requests_is_registered_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requests_is_registered_idx ON public.requests USING btree (is_registered);


--
-- Name: requests_requester_id_division_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requests_requester_id_division_id_idx ON public.requests USING btree (requester_id, division_id);


--
-- Name: requests_status_request_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requests_status_request_date_idx ON public.requests USING btree (status, request_date);


--
-- Name: standard_items_name_brand_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX standard_items_name_brand_idx ON public.standard_items USING btree (name, brand);


--
-- Name: standard_items_type_id_name_brand_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX standard_items_type_id_name_brand_key ON public.standard_items USING btree (type_id, name, brand);


--
-- Name: stock_movements_actor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_actor_id_idx ON public.stock_movements USING btree (actor_id);


--
-- Name: stock_movements_asset_name_brand_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_asset_name_brand_date_idx ON public.stock_movements USING btree (asset_name, brand, date);


--
-- Name: stock_movements_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_date_idx ON public.stock_movements USING btree (date);


--
-- Name: stock_movements_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_type_idx ON public.stock_movements USING btree (type);


--
-- Name: stock_thresholds_alert_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_thresholds_alert_enabled_idx ON public.stock_thresholds USING btree (alert_enabled);


--
-- Name: stock_thresholds_item_name_brand_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_thresholds_item_name_brand_idx ON public.stock_thresholds USING btree (item_name, brand);


--
-- Name: stock_thresholds_item_name_brand_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stock_thresholds_item_name_brand_key ON public.stock_thresholds USING btree (item_name, brand);


--
-- Name: system_configs_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX system_configs_category_idx ON public.system_configs USING btree (category);


--
-- Name: system_configs_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX system_configs_key_idx ON public.system_configs USING btree (key);


--
-- Name: system_configs_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX system_configs_key_key ON public.system_configs USING btree (key);


--
-- Name: user_preferences_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_preferences_user_id_key ON public.user_preferences USING btree (user_id);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_division_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_division_id_idx ON public.users USING btree (role, division_id);


--
-- Name: whatsapp_logs_reference_id_reference_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_logs_reference_id_reference_type_idx ON public.whatsapp_logs USING btree (reference_id, reference_type);


--
-- Name: whatsapp_logs_sent_by_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_logs_sent_by_id_idx ON public.whatsapp_logs USING btree (sent_by_id);


--
-- Name: whatsapp_logs_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_logs_status_created_at_idx ON public.whatsapp_logs USING btree (status, created_at);


--
-- Name: _DivisionCategories _DivisionCategories_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_DivisionCategories"
    ADD CONSTRAINT "_DivisionCategories_A_fkey" FOREIGN KEY ("A") REFERENCES public.asset_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DivisionCategories _DivisionCategories_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_DivisionCategories"
    ADD CONSTRAINT "_DivisionCategories_B_fkey" FOREIGN KEY ("B") REFERENCES public.divisions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _InstalledAssets _InstalledAssets_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_InstalledAssets"
    ADD CONSTRAINT "_InstalledAssets_A_fkey" FOREIGN KEY ("A") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _InstalledAssets _InstalledAssets_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_InstalledAssets"
    ADD CONSTRAINT "_InstalledAssets_B_fkey" FOREIGN KEY ("B") REFERENCES public.installations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MaintenanceAssets _MaintenanceAssets_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_MaintenanceAssets"
    ADD CONSTRAINT "_MaintenanceAssets_A_fkey" FOREIGN KEY ("A") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MaintenanceAssets _MaintenanceAssets_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_MaintenanceAssets"
    ADD CONSTRAINT "_MaintenanceAssets_B_fkey" FOREIGN KEY ("B") REFERENCES public.maintenances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_return_items asset_return_items_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_return_items
    ADD CONSTRAINT asset_return_items_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_return_items asset_return_items_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_return_items
    ADD CONSTRAINT asset_return_items_return_id_fkey FOREIGN KEY (return_id) REFERENCES public.asset_returns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asset_returns asset_returns_loan_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_returns
    ADD CONSTRAINT asset_returns_loan_request_id_fkey FOREIGN KEY (loan_request_id) REFERENCES public.loan_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_returns asset_returns_verified_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_returns
    ADD CONSTRAINT asset_returns_verified_by_id_fkey FOREIGN KEY (verified_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: asset_types asset_types_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_types
    ADD CONSTRAINT asset_types_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.asset_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assets assets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.asset_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: assets assets_recorded_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_recorded_by_id_fkey FOREIGN KEY (recorded_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: assets assets_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.asset_types(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attachments attachments_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attachments attachments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attachments attachments_dismantle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_dismantle_id_fkey FOREIGN KEY (dismantle_id) REFERENCES public.dismantles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attachments attachments_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_installation_id_fkey FOREIGN KEY (installation_id) REFERENCES public.installations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attachments attachments_maintenance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dismantles dismantles_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dismantles
    ADD CONSTRAINT dismantles_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dismantles dismantles_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dismantles
    ADD CONSTRAINT dismantles_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: handover_items handover_items_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handover_items
    ADD CONSTRAINT handover_items_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: handover_items handover_items_handover_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handover_items
    ADD CONSTRAINT handover_items_handover_id_fkey FOREIGN KEY (handover_id) REFERENCES public.handovers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: handovers handovers_mengetahui_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handovers
    ADD CONSTRAINT handovers_mengetahui_id_fkey FOREIGN KEY (mengetahui_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: handovers handovers_menyerahkan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handovers
    ADD CONSTRAINT handovers_menyerahkan_id_fkey FOREIGN KEY (menyerahkan_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: handovers handovers_penerima_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.handovers
    ADD CONSTRAINT handovers_penerima_id_fkey FOREIGN KEY (penerima_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: installation_materials installation_materials_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_materials
    ADD CONSTRAINT installation_materials_installation_id_fkey FOREIGN KEY (installation_id) REFERENCES public.installations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: installations installations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installations
    ADD CONSTRAINT installations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: installations installations_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installations
    ADD CONSTRAINT installations_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: installed_materials installed_materials_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installed_materials
    ADD CONSTRAINT installed_materials_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loan_asset_assignments loan_asset_assignments_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_asset_assignments
    ADD CONSTRAINT loan_asset_assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loan_asset_assignments loan_asset_assignments_loan_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_asset_assignments
    ADD CONSTRAINT loan_asset_assignments_loan_request_id_fkey FOREIGN KEY (loan_request_id) REFERENCES public.loan_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loan_items loan_items_loan_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_items
    ADD CONSTRAINT loan_items_loan_request_id_fkey FOREIGN KEY (loan_request_id) REFERENCES public.loan_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loan_requests loan_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_requests
    ADD CONSTRAINT loan_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: maintenance_materials maintenance_materials_maintenance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_materials
    ADD CONSTRAINT maintenance_materials_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_replacements maintenance_replacements_maintenance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_replacements
    ADD CONSTRAINT maintenance_replacements_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenances maintenances_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: maintenances maintenances_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: request_activities request_activities_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_activities
    ADD CONSTRAINT request_activities_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: request_items request_items_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_items
    ADD CONSTRAINT request_items_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: requests requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: standard_items standard_items_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_items
    ADD CONSTRAINT standard_items_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.asset_types(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_related_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_related_asset_id_fkey FOREIGN KEY (related_asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_thresholds stock_thresholds_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_thresholds
    ADD CONSTRAINT stock_thresholds_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.asset_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_thresholds stock_thresholds_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_thresholds
    ADD CONSTRAINT stock_thresholds_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_division_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict z8tblbapaWC0fjnjXESkBqhtIWl1ke6tBJOzyYjJPgCkTpKa7MCYasxZPnAwexa

