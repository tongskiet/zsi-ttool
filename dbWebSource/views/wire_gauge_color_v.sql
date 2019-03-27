CREATE VIEW dbo.wire_gauge_color_v
AS
SELECT        dbo.wire_gauge_color.wire_gauge, dbo.wire_gauge_color.color_id
FROM            dbo.wire_gauge_color LEFT OUTER JOIN
                         dbo.color_references ON dbo.wire_gauge_color.color_id = dbo.color_references.color_id
