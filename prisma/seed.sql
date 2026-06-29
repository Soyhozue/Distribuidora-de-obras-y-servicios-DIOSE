-- Categories
INSERT INTO "Category" ("id", "name", "slug") VALUES
  ('cat_herramientas', 'Herramientas', 'herramientas'),
  ('cat_materiales', 'Materiales', 'materiales'),
  ('cat_electricidad', 'Electricidad', 'electricidad'),
  ('cat_plomeria', 'Plomería', 'plomeria'),
  ('cat_pintura', 'Pintura', 'pintura'),
  ('cat_seguridad', 'Seguridad', 'seguridad');

-- Brands
INSERT INTO "Brand" ("id", "name", "slug") VALUES
  ('brand_dewalt', 'DEWALT', 'dewalt'),
  ('brand_milwaukee', 'MILWAUKEE', 'milwaukee'),
  ('brand_truper', 'TRUPER', 'truper'),
  ('brand_holcim', 'HOLCIM', 'holcim'),
  ('brand_comex', 'COMEX', 'comex'),
  ('brand_stanley', 'STANLEY', 'stanley'),
  ('brand_condumex', 'CONDUMEX', 'condumex'),
  ('brand_fluke', 'FLUKE', 'fluke'),
  ('brand_surtek', 'SURTEK', 'surtek'),
  ('brand_bvp', 'BVP', 'bvp'),
  ('brand_deacero', 'DEACERO', 'deacero');

-- Products
INSERT INTO "Product" ("id", "sku", "name", "description", "price", "unit", "stock", "stockStatus", "images", "categoryId", "brandId", "featured", "updatedAt") VALUES
  ('prod_1', 'DCD778C2', 'Taladro Percutor 20V MAX', 'Taladro percutor inalámbrico con sistema FLEXVOLT ADVANTAGE, ideal para concreto y mampostería. Incluye batería 20V MAX 2.0 Ah y cargador rápido.', 2450.00, NULL, 12, 'EN_STOCK', ARRAY[]::TEXT[], 'cat_herramientas', 'brand_dewalt', true, CURRENT_TIMESTAMP),
  ('prod_2', 'MWK-SC7', 'Sierra Circular 7-1/4"', NULL, 3800.00, NULL, 7, 'STOCK_BAJO', ARRAY[]::TEXT[], 'cat_herramientas', 'brand_milwaukee', true, CURRENT_TIMESTAMP),
  ('prod_3', 'HLM-C50', 'Cemento Portland 50 kg', NULL, 320.00, NULL, 85, 'EN_STOCK', ARRAY[]::TEXT[], 'cat_materiales', 'brand_holcim', true, CURRENT_TIMESTAMP),
  ('prod_4', 'TRP-MR25', 'Manguera Reforzada 25 m', NULL, 680.00, NULL, 34, 'EN_STOCK', ARRAY[]::TEXT[], 'cat_plomeria', 'brand_truper', true, CURRENT_TIMESTAMP),
  ('prod_5', 'DEA-V38', 'Varilla Corrugada 3/8"', NULL, 185.00, NULL, 0, 'AGOTADO', ARRAY[]::TEXT[], 'cat_materiales', 'brand_deacero', false, CURRENT_TIMESTAMP),
  ('prod_6', 'CMX-PB19', 'Pintura Interior Blanco 19 L', NULL, 890.00, NULL, 34, 'EN_STOCK', ARRAY[]::TEXT[], 'cat_pintura', 'brand_comex', false, CURRENT_TIMESTAMP),
  ('prod_7', 'STN-LI12', 'Llave Inglesa 12"', NULL, 340.00, NULL, 22, 'EN_STOCK', ARRAY[]::TEXT[], 'cat_herramientas', 'brand_stanley', false, CURRENT_TIMESTAMP),
  ('prod_8', 'CDX-T12', 'Cable THW 12 AWG', NULL, 145.00, '/m', 500, 'EN_STOCK', ARRAY[]::TEXT[], 'cat_electricidad', 'brand_condumex', false, CURRENT_TIMESTAMP),
  ('prod_9', 'FLK-MD', 'Multímetro Digital Pro', NULL, 1200.00, NULL, 5, 'STOCK_BAJO', ARRAY[]::TEXT[], 'cat_electricidad', 'brand_fluke', false, CURRENT_TIMESTAMP);
