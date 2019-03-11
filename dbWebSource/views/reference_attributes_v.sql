CREATE VIEW dbo.reference_attributes_v
AS
SELECT        dbo.attributes_v.*, dbo.reference_table_columns.column_name
FROM            dbo.reference_table_columns INNER JOIN
                         dbo.attributes_v ON dbo.reference_table_columns.table_column_name = dbo.attributes_v.property_name
