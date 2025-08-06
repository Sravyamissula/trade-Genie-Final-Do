-- Insert sample countries
INSERT INTO COUNTRIES (CODE, NAME, REGION, CURRENCY, TRADE_BLOC) VALUES
('USA', 'United States', 'North America', 'USD', 'USMCA'),
('CHN', 'China', 'Asia', 'CNY', 'RCEP'),
('DEU', 'Germany', 'Europe', 'EUR', 'EU'),
('JPN', 'Japan', 'Asia', 'JPY', 'CPTPP'),
('GBR', 'United Kingdom', 'Europe', 'GBP', 'CPTPP'),
('CAN', 'Canada', 'North America', 'CAD', 'USMCA'),
('FRA', 'France', 'Europe', 'EUR', 'EU'),
('ITA', 'Italy', 'Europe', 'EUR', 'EU'),
('KOR', 'South Korea', 'Asia', 'KRW', 'RCEP'),
('IND', 'India', 'Asia', 'INR', 'RCEP');

-- Insert sample products
INSERT INTO PRODUCTS (HS_CODE, DESCRIPTION, CATEGORY, UNIT_OF_MEASURE) VALUES
('8703.23', 'Motor cars with spark-ignition engine 1500-3000cc', 'Automotive', 'Units'),
('8471.30', 'Portable digital computers weighing <= 10kg', 'Electronics', 'Units'),
('2709.00', 'Petroleum oils, crude', 'Energy', 'Barrels'),
('1001.99', 'Wheat and meslin, other', 'Agriculture', 'Tonnes'),
('7208.10', 'Flat-rolled iron/steel products, hot-rolled', 'Metals', 'Tonnes'),
('3004.90', 'Medicaments for therapeutic/prophylactic uses', 'Pharmaceuticals', 'Kg'),
('6203.42', 'Men\'s trousers of cotton', 'Textiles', 'Units'),
('0901.21', 'Coffee, roasted, not decaffeinated', 'Food & Beverages', 'Kg'),
('8517.12', 'Telephones for cellular networks', 'Electronics', 'Units'),
('2710.19', 'Petroleum oils, other than crude', 'Energy', 'Litres');

-- Insert sample tariff data
INSERT INTO TARIFF_DATA (HS_CODE, PRODUCT_DESCRIPTION, ORIGIN_COUNTRY, DESTINATION_COUNTRY, TARIFF_RATE, EFFECTIVE_DATE) VALUES
('8703.23', 'Motor cars with spark-ignition engine 1500-3000cc', 'DEU', 'USA', 2.5, '2024-01-01'),
('8471.30', 'Portable digital computers weighing <= 10kg', 'CHN', 'USA', 0.0, '2024-01-01'),
('2709.00', 'Petroleum oils, crude', 'CAN', 'USA', 0.0, '2024-01-01'),
('1001.99', 'Wheat and meslin, other', 'USA', 'CHN', 65.0, '2024-01-01'),
('7208.10', 'Flat-rolled iron/steel products, hot-rolled', 'CHN', 'USA', 25.0, '2024-01-01'),
('3004.90', 'Medicaments for therapeutic/prophylactic uses', 'DEU', 'USA', 0.0, '2024-01-01'),
('6203.42', 'Men\'s trousers of cotton', 'CHN', 'USA', 16.6, '2024-01-01'),
('0901.21', 'Coffee, roasted, not decaffeinated', 'COL', 'USA', 0.0, '2024-01-01'),
('8517.12', 'Telephones for cellular networks', 'CHN', 'USA', 0.0, '2024-01-01'),
('2710.19', 'Petroleum oils, other than crude', 'CAN', 'USA', 5.25, '2024-01-01');

-- Insert sample trade risk analytics
INSERT INTO TRADE_RISK_ANALYTICS (COUNTRY_CODE, COUNTRY_NAME, RISK_SCORE, POLITICAL_RISK, ECONOMIC_RISK, CURRENCY_RISK, TRADE_VOLUME, RISK_FACTORS, RECOMMENDATIONS) VALUES
('USA', 'United States', 15.2, 12.0, 18.5, 15.1, 2500000000, 'Political polarization, trade policy uncertainty', 'Monitor trade policy changes, diversify supply chains'),
('CHN', 'China', 45.8, 55.0, 38.2, 44.3, 4200000000, 'Geopolitical tensions, regulatory changes, COVID-19 impacts', 'Establish local partnerships, monitor regulatory environment'),
('DEU', 'Germany', 22.1, 18.5, 25.8, 22.0, 1800000000, 'Energy dependency, supply chain disruptions', 'Diversify energy sources, strengthen supply chain resilience'),
('JPN', 'Japan', 28.5, 25.0, 32.1, 28.4, 950000000, 'Aging population, natural disasters, currency volatility', 'Long-term demographic planning, disaster preparedness'),
('GBR', 'United Kingdom', 35.2, 42.0, 28.5, 35.1, 750000000, 'Brexit impacts, political instability', 'Monitor Brexit developments, adapt to new trade rules');

-- Insert sample market intelligence
INSERT INTO MARKET_INTELLIGENCE (COUNTRY_CODE, PRODUCT_CODE, PRODUCT_NAME, TARIFF_RATE, TRADE_VOLUME, MARKET_SHARE, GROWTH_RATE, MARKET_TRENDS, COMPETITIVE_ANALYSIS) VALUES
('USA', '8703.23', 'Motor cars with spark-ignition engine 1500-3000cc', 2.5, 850000, 15.2, 3.5, 'Growing demand for SUVs and electric vehicles', 'German luxury brands dominate premium segment'),
('CHN', '8471.30', 'Portable digital computers weighing <= 10kg', 0.0, 45000000, 28.5, 8.2, 'Remote work driving laptop demand', 'Local brands gaining market share'),
('USA', '2709.00', 'Petroleum oils, crude', 0.0, 180000000, 12.8, -2.1, 'Shift towards renewable energy', 'Canadian suppliers preferred due to proximity'),
('CHN', '1001.99', 'Wheat and meslin, other', 65.0, 3500000, 8.5, 1.2, 'Food security concerns driving imports', 'US suppliers face high tariffs'),
('USA', '7208.10', 'Flat-rolled iron/steel products, hot-rolled', 25.0, 12000000, 22.1, -1.8, 'Infrastructure spending supporting demand', 'Tariffs protecting domestic industry');
