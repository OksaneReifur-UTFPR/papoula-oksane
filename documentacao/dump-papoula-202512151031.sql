--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Ubuntu 16.6-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.6 (Ubuntu 16.6-0ubuntu0.24.04.1)

-- Started on 2025-12-15 10:31:23 -03

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
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16613)
-- Name: cargo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cargo (
    id_cargo integer NOT NULL,
    nome_cargo character varying(50) NOT NULL
);


ALTER TABLE public.cargo OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16616)
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    cpf_cliente character(11) NOT NULL,
    data_cadastro date NOT NULL
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16619)
-- Name: forma_pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forma_pagamento (
    id_formadepagamento integer NOT NULL,
    nome_formadepagamento character varying(50) NOT NULL
);


ALTER TABLE public.forma_pagamento OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16622)
-- Name: forma_pagamento_id_formadepagamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.forma_pagamento_id_formadepagamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forma_pagamento_id_formadepagamento_seq OWNER TO postgres;

--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 218
-- Name: forma_pagamento_id_formadepagamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.forma_pagamento_id_formadepagamento_seq OWNED BY public.forma_pagamento.id_formadepagamento;


--
-- TOC entry 219 (class 1259 OID 16623)
-- Name: funcionario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.funcionario (
    cpf_pessoa character(11) NOT NULL,
    salario numeric(10,2) NOT NULL,
    id_cargo integer NOT NULL
);


ALTER TABLE public.funcionario OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16626)
-- Name: pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagamento (
    id_pagamento integer NOT NULL,
    id_pedido integer NOT NULL,
    data_pagamento date NOT NULL,
    valor_total_pagamento numeric(10,2) NOT NULL
);


ALTER TABLE public.pagamento OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16629)
-- Name: pagamento_has_formadepagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagamento_has_formadepagamento (
    id_pagamentopedido integer NOT NULL,
    id_formadepagamento integer NOT NULL,
    valor_pago numeric(10,2) NOT NULL
);


ALTER TABLE public.pagamento_has_formadepagamento OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16632)
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagamento_id_pagamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagamento_id_pagamento_seq OWNER TO postgres;

--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 222
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagamento_id_pagamento_seq OWNED BY public.pagamento.id_pagamento;


--
-- TOC entry 223 (class 1259 OID 16633)
-- Name: pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido (
    id_pedido integer NOT NULL,
    cpf_cliente character(11) NOT NULL,
    data_pedido date NOT NULL
);


ALTER TABLE public.pedido OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16636)
-- Name: pedido_has_planta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_has_planta (
    id_pedido integer NOT NULL,
    id_planta integer NOT NULL,
    quantidade integer NOT NULL,
    preco_planta numeric(10,2) NOT NULL
);


ALTER TABLE public.pedido_has_planta OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16639)
-- Name: pedido_id_pedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_id_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_id_pedido_seq OWNER TO postgres;

--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 225
-- Name: pedido_id_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_id_pedido_seq OWNED BY public.pedido.id_pedido;


--
-- TOC entry 226 (class 1259 OID 16640)
-- Name: pessoa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pessoa (
    cpf_pessoa character(11) NOT NULL,
    nome_pessoa character varying(100) NOT NULL,
    data_nascimento_pessoa date NOT NULL,
    email_pessoa character varying(150),
    senha_pessoa character varying(255)
);


ALTER TABLE public.pessoa OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16643)
-- Name: planta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planta (
    id_planta integer NOT NULL,
    nome_popular character varying(100) NOT NULL,
    nome_cientifico character varying(100) NOT NULL,
    especie character varying(100),
    descricao text,
    preco_unitario numeric(10,2) NOT NULL,
    quantidade_estoque integer NOT NULL
);


ALTER TABLE public.planta OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16648)
-- Name: planta_id_planta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.planta_id_planta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planta_id_planta_seq OWNER TO postgres;

--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 228
-- Name: planta_id_planta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.planta_id_planta_seq OWNED BY public.planta.id_planta;


--
-- TOC entry 3326 (class 2604 OID 16649)
-- Name: forma_pagamento id_formadepagamento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forma_pagamento ALTER COLUMN id_formadepagamento SET DEFAULT nextval('public.forma_pagamento_id_formadepagamento_seq'::regclass);


--
-- TOC entry 3327 (class 2604 OID 16650)
-- Name: pagamento id_pagamento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento ALTER COLUMN id_pagamento SET DEFAULT nextval('public.pagamento_id_pagamento_seq'::regclass);


--
-- TOC entry 3328 (class 2604 OID 16651)
-- Name: pedido id_pedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id_pedido SET DEFAULT nextval('public.pedido_id_pedido_seq'::regclass);


--
-- TOC entry 3329 (class 2604 OID 16652)
-- Name: planta id_planta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planta ALTER COLUMN id_planta SET DEFAULT nextval('public.planta_id_planta_seq'::regclass);


--
-- TOC entry 3502 (class 0 OID 16613)
-- Dependencies: 215
-- Data for Name: cargo; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cargo VALUES (2, 'cozinheiro');
INSERT INTO public.cargo VALUES (3, 'escravo(estagiario)');
INSERT INTO public.cargo VALUES (5, 'chefe');
INSERT INTO public.cargo VALUES (9, 'garagero');
INSERT INTO public.cargo VALUES (1, 'Gerente ');


--
-- TOC entry 3503 (class 0 OID 16616)
-- Dependencies: 216
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cliente VALUES ('11111111111', '2025-10-09');
INSERT INTO public.cliente VALUES ('12345678901', '2025-12-08');


--
-- TOC entry 3504 (class 0 OID 16619)
-- Dependencies: 217
-- Data for Name: forma_pagamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.forma_pagamento VALUES (1, 'dinheiro');
INSERT INTO public.forma_pagamento VALUES (2, 'pix');


--
-- TOC entry 3506 (class 0 OID 16623)
-- Dependencies: 219
-- Data for Name: funcionario; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.funcionario VALUES ('22222222222', 235.33, 3);
INSERT INTO public.funcionario VALUES ('12345678901', 425425.00, 2);
INSERT INTO public.funcionario VALUES ('11111111111', 15000.00, 1);


--
-- TOC entry 3507 (class 0 OID 16626)
-- Dependencies: 220
-- Data for Name: pagamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pagamento VALUES (1, 1, '2025-09-23', 100.50);
INSERT INTO public.pagamento VALUES (2, 1, '2025-09-23', 100.50);


--
-- TOC entry 3508 (class 0 OID 16629)
-- Dependencies: 221
-- Data for Name: pagamento_has_formadepagamento; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3510 (class 0 OID 16633)
-- Dependencies: 223
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pedido VALUES (1, '12345678901', '2025-09-23');


--
-- TOC entry 3511 (class 0 OID 16636)
-- Dependencies: 224
-- Data for Name: pedido_has_planta; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3513 (class 0 OID 16640)
-- Dependencies: 226
-- Data for Name: pessoa; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pessoa VALUES ('12345678901', 'Maria Silva', '1990-05-10', 'mariasilva@gmail.com', '1234');
INSERT INTO public.pessoa VALUES ('11111111111', 'oksane', '2025-09-28', 'oksanegerente@gmail.com', '123');
INSERT INTO public.pessoa VALUES ('22222222222', 'maju', '2009-05-23', 'maju@gmail.com', '1234');


--
-- TOC entry 3514 (class 0 OID 16643)
-- Dependencies: 227
-- Data for Name: planta; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.planta VALUES (6, 'Orquídea Phalaenopsis', 'Phalaenopsis amabilis', 'Orquídea', 'Planta ornamental de flores elegantes e longa duração.', 89.90, 20);
INSERT INTO public.planta VALUES (7, 'Orquídea Cattleya', 'Cattleya labiata', 'Orquídea', 'Orquídea de flores grandes e muito perfumadas.', 99.90, 15);
INSERT INTO public.planta VALUES (8, 'Orquídea Dendrobium', 'Dendrobium nobile', 'Orquídea', 'Espécie resistente com floração abundante.', 79.90, 18);
INSERT INTO public.planta VALUES (9, 'Orquídea Vanda', 'Vanda coerulea', 'Orquídea', 'Orquídea exótica que necessita de muita luz.', 129.90, 10);
INSERT INTO public.planta VALUES (10, 'Orquídea Oncidium', 'Oncidium flexuosum', 'Orquídea', 'Conhecida como orquídea chuva-de-ouro.', 85.90, 12);
INSERT INTO public.planta VALUES (11, 'Rosa Vermelha', 'Rosa gallica', 'Rosa', 'Rosa clássica de flores vermelhas e perfumadas.', 39.90, 50);
INSERT INTO public.planta VALUES (12, 'Rosa Branca', 'Rosa alba', 'Rosa', 'Rosa ornamental de coloração branca.', 34.90, 40);
INSERT INTO public.planta VALUES (13, 'Rosa Amarela', 'Rosa foetida', 'Rosa', 'Rosa de tom amarelo vibrante.', 36.90, 45);
INSERT INTO public.planta VALUES (14, 'Rosa Cor-de-Rosa', 'Rosa chinensis', 'Rosa', 'Rosa delicada muito usada em jardins.', 37.90, 38);
INSERT INTO public.planta VALUES (15, 'Rosa Miniatura', 'Rosa multiflora', 'Rosa', 'Rosa de pequeno porte ideal para vasos.', 29.90, 60);
INSERT INTO public.planta VALUES (16, 'Tulipa', 'Tulipa gesneriana', 'Bulbo', 'Planta bulbosa com flores coloridas.', 24.90, 100);
INSERT INTO public.planta VALUES (17, 'Narciso', 'Narcissus poeticus', 'Bulbo', 'Flor bulbosa muito perfumada.', 19.90, 90);
INSERT INTO public.planta VALUES (18, 'Lírio', 'Lilium candidum', 'Bulbo', 'Flor elegante e bastante perfumada.', 29.90, 70);
INSERT INTO public.planta VALUES (19, 'Amarílis', 'Hippeastrum hybridum', 'Bulbo', 'Planta bulbosa de flores grandes.', 34.90, 65);
INSERT INTO public.planta VALUES (20, 'Jacinto', 'Hyacinthus orientalis', 'Bulbo', 'Planta bulbosa muito aromática.', 22.90, 80);
INSERT INTO public.planta VALUES (21, 'Gladíolo Vermelho', 'Gladiolus communis', 'Gladiolo', 'Planta ornamental de hastes longas.', 18.90, 55);
INSERT INTO public.planta VALUES (22, 'Gladíolo Branco', 'Gladiolus italicus', 'Gladiolo', 'Gladíolo de flores brancas elegantes.', 17.90, 50);
INSERT INTO public.planta VALUES (23, 'Gladíolo Rosa', 'Gladiolus hortulanus', 'Gladiolo', 'Espécie ornamental muito usada em jardins.', 19.90, 48);
INSERT INTO public.planta VALUES (24, 'Gladíolo Amarelo', 'Gladiolus dalenii', 'Gladiolo', 'Gladíolo de coloração vibrante.', 18.50, 52);
INSERT INTO public.planta VALUES (25, 'Gladíolo Roxo', 'Gladiolus tristis', 'Gladiolo', 'Gladíolo de tonalidade diferenciada.', 20.90, 40);
INSERT INTO public.planta VALUES (26, 'Begônia', 'Begonia tuberhybrida', 'Flor Tuberosa', 'Flores vibrantes e decorativas, comuns em jardins de sombra.', 15.90, 50);
INSERT INTO public.planta VALUES (27, 'Dália', 'Dahlia pinnata', 'Flor Tuberosa', 'Planta ornamental com flores grandes e coloridas, perfeita para arranjos.', 20.90, 30);
INSERT INTO public.planta VALUES (28, 'Canna', 'Canna indica', 'Flor Tuberosa', 'Planta tropical de flores exóticas e coloridas, muito resistente ao calor.', 18.50, 40);
INSERT INTO public.planta VALUES (29, 'Caládio', 'Caladium bicolor', 'Flor Tuberosa', 'Flor ornamental com folhas coloridas, ideal para ambientes sombreados.', 22.90, 25);
INSERT INTO public.planta VALUES (30, 'Freesia', 'Freesia refracta', 'Flor Tuberosa', 'Flor perfumada com cores vibrantes, muito usada em arranjos florais.', 12.50, 35);


--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 218
-- Name: forma_pagamento_id_formadepagamento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.forma_pagamento_id_formadepagamento_seq', 1, false);


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 222
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagamento_id_pagamento_seq', 2, true);


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 225
-- Name: pedido_id_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_id_pedido_seq', 1, true);


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 228
-- Name: planta_id_planta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.planta_id_planta_seq', 30, true);


--
-- TOC entry 3331 (class 2606 OID 16654)
-- Name: cargo cargo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cargo
    ADD CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo);


--
-- TOC entry 3333 (class 2606 OID 16656)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (cpf_cliente);


--
-- TOC entry 3335 (class 2606 OID 16658)
-- Name: forma_pagamento forma_pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forma_pagamento
    ADD CONSTRAINT forma_pagamento_pkey PRIMARY KEY (id_formadepagamento);


--
-- TOC entry 3337 (class 2606 OID 16660)
-- Name: funcionario funcionario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT funcionario_pkey PRIMARY KEY (cpf_pessoa);


--
-- TOC entry 3341 (class 2606 OID 16662)
-- Name: pagamento_has_formadepagamento pagamento_has_formadepagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento_has_formadepagamento
    ADD CONSTRAINT pagamento_has_formadepagamento_pkey PRIMARY KEY (id_pagamentopedido, id_formadepagamento);


--
-- TOC entry 3339 (class 2606 OID 16664)
-- Name: pagamento pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento
    ADD CONSTRAINT pagamento_pkey PRIMARY KEY (id_pagamento);


--
-- TOC entry 3345 (class 2606 OID 16666)
-- Name: pedido_has_planta pedido_has_planta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_has_planta
    ADD CONSTRAINT pedido_has_planta_pkey PRIMARY KEY (id_pedido, id_planta);


--
-- TOC entry 3343 (class 2606 OID 16668)
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id_pedido);


--
-- TOC entry 3347 (class 2606 OID 16670)
-- Name: pessoa pessoa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pessoa
    ADD CONSTRAINT pessoa_pkey PRIMARY KEY (cpf_pessoa);


--
-- TOC entry 3349 (class 2606 OID 16672)
-- Name: planta planta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planta
    ADD CONSTRAINT planta_pkey PRIMARY KEY (id_planta);


--
-- TOC entry 3350 (class 2606 OID 16673)
-- Name: cliente fk_cliente_pessoa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_pessoa FOREIGN KEY (cpf_cliente) REFERENCES public.pessoa(cpf_pessoa);


--
-- TOC entry 3351 (class 2606 OID 16678)
-- Name: funcionario fk_funcionario_cargo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT fk_funcionario_cargo FOREIGN KEY (id_cargo) REFERENCES public.cargo(id_cargo);


--
-- TOC entry 3352 (class 2606 OID 16683)
-- Name: funcionario fk_funcionario_pessoa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT fk_funcionario_pessoa FOREIGN KEY (cpf_pessoa) REFERENCES public.pessoa(cpf_pessoa);


--
-- TOC entry 3353 (class 2606 OID 16688)
-- Name: pagamento fk_pagamento_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento
    ADD CONSTRAINT fk_pagamento_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- TOC entry 3354 (class 2606 OID 16693)
-- Name: pagamento_has_formadepagamento fk_pagamentoforma_forma; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento_has_formadepagamento
    ADD CONSTRAINT fk_pagamentoforma_forma FOREIGN KEY (id_formadepagamento) REFERENCES public.forma_pagamento(id_formadepagamento);


--
-- TOC entry 3355 (class 2606 OID 16698)
-- Name: pagamento_has_formadepagamento fk_pagamentoforma_pagamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento_has_formadepagamento
    ADD CONSTRAINT fk_pagamentoforma_pagamento FOREIGN KEY (id_pagamentopedido) REFERENCES public.pagamento(id_pagamento);


--
-- TOC entry 3356 (class 2606 OID 16703)
-- Name: pedido fk_pedido_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_cliente FOREIGN KEY (cpf_cliente) REFERENCES public.cliente(cpf_cliente);


--
-- TOC entry 3357 (class 2606 OID 16708)
-- Name: pedido_has_planta fk_pedidoplanta_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_has_planta
    ADD CONSTRAINT fk_pedidoplanta_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- TOC entry 3358 (class 2606 OID 16713)
-- Name: pedido_has_planta fk_pedidoplanta_planta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_has_planta
    ADD CONSTRAINT fk_pedidoplanta_planta FOREIGN KEY (id_planta) REFERENCES public.planta(id_planta);


-- Completed on 2025-12-15 10:31:23 -03

--
-- PostgreSQL database dump complete
--

