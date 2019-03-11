
CREATE VIEW [dbo].[role_dashboards_v]
AS
SELECT r.role_dashboard_id, r.role_id, r.page_id, p.page_title, p.page_name, seq_no FROM dbo.role_dashboards r inner join pages p on r.page_id=p.page_id 

