CREATE VIEW dbo.criterias_v
AS
SELECT        dbo.criterias.criteria_id, dbo.criterias.criteria_title, dbo.criterias.pcriteria_id, dbo.criterias.seq_no, dbo.criterias.is_active, dbo.criterias.trend_menu_id, dbo.criterias.chart_type, dbo.criterias.option_id, dbo.criterias.proc_name, 
                         dbo.criterias.created_by, dbo.criterias.created_date, dbo.criterias.updated_by, dbo.criterias.updated_date, dbo.wire_options.option_name
FROM            dbo.criterias LEFT OUTER JOIN
                         dbo.wire_options ON dbo.criterias.option_id = dbo.wire_options.option_id
