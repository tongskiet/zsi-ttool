

CREATE PROCEDURE [dbo].[role_dashboards_sel]
(
   @role_id  INT = null
)
AS
BEGIN
     SELECT role_dashboard_id, role_id, page_id, page_title, seq_no FROM role_dashboards_v WHERE role_id = @role_id 
	  UNION
	  SELECT NULL as role_dashboard_id, null as role_id, page_id, page_title, '' as seq_no FROM dashboards_v a
	    WHERE NOT EXISTS (select page_id FROM role_dashboards_v b where b.page_id = a.page_id AND b.role_id = @role_id);
END


