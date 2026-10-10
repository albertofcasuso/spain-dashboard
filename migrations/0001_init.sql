-- España en Datos — initial schema + seed
PRAGMA foreign_keys = ON;

CREATE TABLE `geographies` (
  `id` text PRIMARY KEY NOT NULL,
  `code` text NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL,
  `ine_code` text
);
CREATE UNIQUE INDEX `geographies_code_unique` ON `geographies` (`code`);

CREATE TABLE `indicators` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `unit` text NOT NULL,
  `frequency` text NOT NULL,
  `source_name` text NOT NULL,
  `source_url` text NOT NULL,
  `series_code` text NOT NULL,
  `chart_eligible` integer DEFAULT true NOT NULL
);
CREATE UNIQUE INDEX `indicators_slug_unique` ON `indicators` (`slug`);

CREATE TABLE `observations` (
  `id` text PRIMARY KEY NOT NULL,
  `indicator_id` text NOT NULL,
  `geography_id` text NOT NULL,
  `date` text NOT NULL,
  `value` real NOT NULL,
  `data_type` text,
  `retrieved_at` text NOT NULL,
  FOREIGN KEY (`indicator_id`) REFERENCES `indicators`(`id`),
  FOREIGN KEY (`geography_id`) REFERENCES `geographies`(`id`)
);
CREATE UNIQUE INDEX `observations_indicator_geo_date_uq` ON `observations` (`indicator_id`, `geography_id`, `date`);

INSERT INTO `geographies` (`id`, `code`, `name`, `type`, `ine_code`)
VALUES ('geo-es', 'ES', 'España', 'country', '00');

INSERT INTO `indicators` (
  `id`, `slug`, `name`, `description`, `unit`, `frequency`,
  `source_name`, `source_url`, `series_code`, `chart_eligible`
) VALUES
(
  'ind-ipc',
  'ipc.general',
  'IPC',
  'Índice de Precios de Consumo, índice general, variación anual. Base 2025. Total Nacional.',
  '% variación anual',
  'monthly',
  'INE',
  'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176802',
  'IPC290750',
  1
),
(
  'ind-paro',
  'unemployment.rate',
  'Paro',
  'Tasa de paro EPA, ambos sexos, Total Nacional.',
  '% tasa de paro',
  'quarterly',
  'INE',
  'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176918',
  'EPA452434',
  1
),
(
  'ind-pib',
  'gdp.growth',
  'PIB',
  'Producto interior bruto a precios de mercado, variación anual en volumen, corregida de estacionalidad y calendario.',
  '% variación anual',
  'quarterly',
  'INE',
  'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736164439',
  'CNTR6654',
  1
),
(
  'ind-euribor',
  'euribor.12m',
  'Euríbor 12m',
  'Euríbor a un año, media mensual.',
  '%',
  'monthly',
  'Banco de España',
  'https://www.bde.es/webbe/es/estadisticas/temas/tipos-interes.html',
  'D_1NBAF472',
  1
),
(
  'ind-poblacion',
  'population.total',
  'Población',
  'Población residente Total Nacional (Estadística Continua de Población), todas las edades.',
  'personas',
  'quarterly',
  'INE',
  'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177095',
  'ECP320',
  1
),
(
  'ind-vivienda',
  'housing.price',
  'Vivienda',
  'Índice de Precios de la Vivienda (IPV), general nacional, variación anual.',
  '% variación anual',
  'quarterly',
  'INE',
  'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736157476',
  'IPV1376',
  1
);
