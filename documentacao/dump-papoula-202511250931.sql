--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Ubuntu 14.18-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.18 (Ubuntu 14.18-0ubuntu0.22.04.1)

-- Started on 2025-11-25 09:31:25 -03

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 213 (class 1259 OID 25219)
-- Name: cargo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cargo (
    id_cargo integer NOT NULL,
    nome_cargo character varying(50) NOT NULL
);


--
-- TOC entry 212 (class 1259 OID 25209)
-- Name: cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente (
    cpf_cliente character(11) NOT NULL,
    data_cadastro date NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 25279)
-- Name: forma_pagamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forma_pagamento (
    id_formadepagamento integer NOT NULL,
    nome_formadepagamento character varying(50) NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 25278)
-- Name: forma_pagamento_id_formadepagamento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forma_pagamento_id_formadepagamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3439 (class 0 OID 0)
-- Dependencies: 220
-- Name: forma_pagamento_id_formadepagamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forma_pagamento_id_formadepagamento_seq OWNED BY public.forma_pagamento.id_formadepagamento;


--
-- TOC entry 214 (class 1259 OID 25224)
-- Name: funcionario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funcionario (
    cpf_pessoa character(11) NOT NULL,
    salario numeric(10,2) NOT NULL,
    id_cargo integer NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 25267)
-- Name: pagamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagamento (
    id_pagamento integer NOT NULL,
    id_pedido integer NOT NULL,
    data_pagamento date NOT NULL,
    valor_total_pagamento numeric(10,2) NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 25285)
-- Name: pagamento_has_formadepagamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagamento_has_formadepagamento (
    id_pagamentopedido integer NOT NULL,
    id_formadepagamento integer NOT NULL,
    valor_pago numeric(10,2) NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 25266)
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pagamento_id_pagamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3440 (class 0 OID 0)
-- Dependencies: 218
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pagamento_id_pagamento_seq OWNED BY public.pagamento.id_pagamento;


--
-- TOC entry 216 (class 1259 OID 25240)
-- Name: pedido; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido (
    id_pedido integer NOT NULL,
    cpf_cliente character(11) NOT NULL,
    data_pedido date NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 25251)
-- Name: pedido_has_planta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido_has_planta (
    id_pedido integer NOT NULL,
    id_planta integer NOT NULL,
    quantidade integer NOT NULL,
    preco_planta numeric(10,2) NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 25239)
-- Name: pedido_id_pedido_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedido_id_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3441 (class 0 OID 0)
-- Dependencies: 215
-- Name: pedido_id_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedido_id_pedido_seq OWNED BY public.pedido.id_pedido;


--
-- TOC entry 211 (class 1259 OID 25204)
-- Name: pessoa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pessoa (
    cpf_pessoa character(11) NOT NULL,
    nome_pessoa character varying(100) NOT NULL,
    data_nascimento_pessoa date NOT NULL
);


--
-- TOC entry 210 (class 1259 OID 25193)
-- Name: planta; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 209 (class 1259 OID 25192)
-- Name: planta_id_planta_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.planta_id_planta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3442 (class 0 OID 0)
-- Dependencies: 209
-- Name: planta_id_planta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.planta_id_planta_seq OWNED BY public.planta.id_planta;


--
-- TOC entry 3251 (class 2604 OID 25282)
-- Name: forma_pagamento id_formadepagamento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forma_pagamento ALTER COLUMN id_formadepagamento SET DEFAULT nextval('public.forma_pagamento_id_formadepagamento_seq'::regclass);


--
-- TOC entry 3250 (class 2604 OID 25270)
-- Name: pagamento id_pagamento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamento ALTER COLUMN id_pagamento SET DEFAULT nextval('public.pagamento_id_pagamento_seq'::regclass);


--
-- TOC entry 3249 (class 2604 OID 25243)
-- Name: pedido id_pedido; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id_pedido SET DEFAULT nextval('public.pedido_id_pedido_seq'::regclass);


--
-- TOC entry 3248 (class 2604 OID 25196)
-- Name: planta id_planta; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planta ALTER COLUMN id_planta SET DEFAULT nextval('public.planta_id_planta_seq'::regclass);


--
-- TOC entry 3424 (class 0 OID 25219)
-- Dependencies: 213
-- Data for Name: cargo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cargo VALUES (2, 'cozinheiro');
INSERT INTO public.cargo VALUES (3, 'escravo(estagiario)');
INSERT INTO public.cargo VALUES (5, 'chefe');
INSERT INTO public.cargo VALUES (9, 'garagero');
INSERT INTO public.cargo VALUES (1, 'Gerente ');


--
-- TOC entry 3423 (class 0 OID 25209)
-- Dependencies: 212
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cliente VALUES ('12345678901', '2025-09-23');
INSERT INTO public.cliente VALUES ('11111111111', '2025-10-09');


--
-- TOC entry 3432 (class 0 OID 25279)
-- Dependencies: 221
-- Data for Name: forma_pagamento; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.forma_pagamento VALUES (1, 'dinheiro');
INSERT INTO public.forma_pagamento VALUES (2, 'pix');


--
-- TOC entry 3425 (class 0 OID 25224)
-- Dependencies: 214
-- Data for Name: funcionario; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.funcionario VALUES ('12345678901', 2500.00, 1);
INSERT INTO public.funcionario VALUES ('22222222222', 235.33, 3);


--
-- TOC entry 3430 (class 0 OID 25267)
-- Dependencies: 219
-- Data for Name: pagamento; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.pagamento VALUES (1, 1, '2025-09-23', 100.50);
INSERT INTO public.pagamento VALUES (2, 1, '2025-09-23', 100.50);


--
-- TOC entry 3433 (class 0 OID 25285)
-- Dependencies: 222
-- Data for Name: pagamento_has_formadepagamento; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3427 (class 0 OID 25240)
-- Dependencies: 216
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.pedido VALUES (1, '12345678901', '2025-09-23');


--
-- TOC entry 3428 (class 0 OID 25251)
-- Dependencies: 217
-- Data for Name: pedido_has_planta; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.pedido_has_planta VALUES (1, 1, 2, 10.50);


--
-- TOC entry 3422 (class 0 OID 25204)
-- Dependencies: 211
-- Data for Name: pessoa; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.pessoa VALUES ('12345678901', 'Maria Silva', '1990-05-10');
INSERT INTO public.pessoa VALUES ('11111111111', 'oksane', '2025-09-28');
INSERT INTO public.pessoa VALUES ('22222222222', 'maju', '2009-05-23');


--
-- TOC entry 3421 (class 0 OID 25193)
-- Dependencies: 210
-- Data for Name: planta; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.planta VALUES (1, 'Lirio', 'Bulbo', 'Seila', 'Bonita', 10.00, 20);
INSERT INTO public.planta VALUES (2, 'Rosa', 'Rosa rubiginosa', 'Rosaceae', 'Planta com flores vermelhas', 10.50, 100);
INSERT INTO public.planta VALUES (3, 'Rosa', 'Rosa rubiginosa', 'Rosaceae', 'Planta com flores vermelhas', 10.50, 100);
INSERT INTO public.planta VALUES (4, 'Rosa', 'Rosa rubiginosa', 'Rosaceae', 'Planta com flores vermelhas', 10.50, 100);
INSERT INTO public.planta VALUES (5, 'tdrhhs', 'rhrsh', 'serhsrthfg', 'srtrthsrhsrtgfhsrggf', 23.00, 344);


--
-- TOC entry 3443 (class 0 OID 0)
-- Dependencies: 220
-- Name: forma_pagamento_id_formadepagamento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forma_pagamento_id_formadepagamento_seq', 1, false);


--
-- TOC entry 3444 (class 0 OID 0)
-- Dependencies: 218
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pagamento_id_pagamento_seq', 2, true);


--
-- TOC entry 3445 (class 0 OID 0)
-- Dependencies: 215
-- Name: pedido_id_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedido_id_pedido_seq', 1, true);


--
-- TOC entry 3446 (class 0 OID 0)
-- Dependencies: 209
-- Name: planta_id_planta_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.planta_id_planta_seq', 5, true);


--
-- TOC entry 3259 (class 2606 OID 25223)
-- Name: cargo cargo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargo
    ADD CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo);


--
-- TOC entry 3257 (class 2606 OID 25213)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (cpf_cliente);


--
-- TOC entry 3269 (class 2606 OID 25284)
-- Name: forma_pagamento forma_pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forma_pagamento
    ADD CONSTRAINT forma_pagamento_pkey PRIMARY KEY (id_formadepagamento);


--
-- TOC entry 3261 (class 2606 OID 25228)
-- Name: funcionario funcionario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT funcionario_pkey PRIMARY KEY (cpf_pessoa);


--
-- TOC entry 3271 (class 2606 OID 25289)
-- Name: pagamento_has_formadepagamento pagamento_has_formadepagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamento_has_formadepagamento
    ADD CONSTRAINT pagamento_has_formadepagamento_pkey PRIMARY KEY (id_pagamentopedido, id_formadepagamento);


--
-- TOC entry 3267 (class 2606 OID 25272)
-- Name: pagamento pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamento
    ADD CONSTRAINT pagamento_pkey PRIMARY KEY (id_pagamento);


--
-- TOC entry 3265 (class 2606 OID 25255)
-- Name: pedido_has_planta pedido_has_planta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_has_planta
    ADD CONSTRAINT pedido_has_planta_pkey PRIMARY KEY (id_pedido, id_planta);


--
-- TOC entry 3263 (class 2606 OID 25245)
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id_pedido);


--
-- TOC entry 3255 (class 2606 OID 25208)
-- Name: pessoa pessoa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pessoa
    ADD CONSTRAINT pessoa_pkey PRIMARY KEY (cpf_pessoa);


--
-- TOC entry 3253 (class 2606 OID 25200)
-- Name: planta planta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planta
    ADD CONSTRAINT planta_pkey PRIMARY KEY (id_planta);


--
-- TOC entry 3272 (class 2606 OID 25214)
-- Name: cliente fk_cliente_pessoa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_pessoa FOREIGN KEY (cpf_cliente) REFERENCES public.pessoa(cpf_pessoa);


--
-- TOC entry 3274 (class 2606 OID 25234)
-- Name: funcionario fk_funcionario_cargo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT fk_funcionario_cargo FOREIGN KEY (id_cargo) REFERENCES public.cargo(id_cargo);


--
-- TOC entry 3273 (class 2606 OID 25229)
-- Name: funcionario fk_funcionario_pessoa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT fk_funcionario_pessoa FOREIGN KEY (cpf_pessoa) REFERENCES public.pessoa(cpf_pessoa);


--
-- TOC entry 3278 (class 2606 OID 25273)
-- Name: pagamento fk_pagamento_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamento
    ADD CONSTRAINT fk_pagamento_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- TOC entry 3280 (class 2606 OID 25295)
-- Name: pagamento_has_formadepagamento fk_pagamentoforma_forma; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamento_has_formadepagamento
    ADD CONSTRAINT fk_pagamentoforma_forma FOREIGN KEY (id_formadepagamento) REFERENCES public.forma_pagamento(id_formadepagamento);


--
-- TOC entry 3279 (class 2606 OID 25290)
-- Name: pagamento_has_formadepagamento fk_pagamentoforma_pagamento; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamento_has_formadepagamento
    ADD CONSTRAINT fk_pagamentoforma_pagamento FOREIGN KEY (id_pagamentopedido) REFERENCES public.pagamento(id_pagamento);


--
-- TOC entry 3275 (class 2606 OID 25246)
-- Name: pedido fk_pedido_cliente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_cliente FOREIGN KEY (cpf_cliente) REFERENCES public.cliente(cpf_cliente);


--
-- TOC entry 3276 (class 2606 OID 25256)
-- Name: pedido_has_planta fk_pedidoplanta_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_has_planta
    ADD CONSTRAINT fk_pedidoplanta_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- TOC entry 3277 (class 2606 OID 25261)
-- Name: pedido_has_planta fk_pedidoplanta_planta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_has_planta
    ADD CONSTRAINT fk_pedidoplanta_planta FOREIGN KEY (id_planta) REFERENCES public.planta(id_planta);


-- Completed on 2025-11-25 09:31:25 -03

--
-- PostgreSQL database dump complete
--

