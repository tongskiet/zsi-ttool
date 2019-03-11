CREATE VIEW dbo.dashboards_v
AS
SELECT * FROM dbo.pages where page_title like '%dashboard%'