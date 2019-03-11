CREATE PROCEDURE [dbo].[reference_table_column_values_sel](
   @column_name NVARCHAR(100)
)
AS
BEGIN
SET NOCOUNT ON
  SELECT DISTINCT attribute_name attribute_id, attribute_name FROM dbo.reference_attributes_v WHERE column_name=@column_name order by 2
END
--reference_table_column_values_sel @column_name='WIRE_GAUGE'

