CREATE PROCEDURE [dbo].[reference_table_columns_sel](
   @specs_id int
  ,@property_id INT = NULL
)
AS
BEGIN
SET NOCOUNT ON
  DECLARE @stmt NVARCHAR(MAX)
  SET @stmt = 'SELECT column_name, table_column_name FROM dbo.reference_table_columns WHERE specs_id=' + CAST(@specs_id AS VARCHAR(20))
  
  IF ISNULL(@property_id,0) <> 0
     SET @stmt = @stmt + ' AND property_id = ' + CAST(@property_id AS VARCHAR(20))

  SET @stmt = @stmt + ' ORDER BY 2 '
  EXEC(@stmt);

END
--spec_properties @specs_id=40