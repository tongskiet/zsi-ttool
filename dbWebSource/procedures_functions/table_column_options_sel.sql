create PROCEDURE [dbo].[table_column_options_sel]
(
	@table_name   varchar(50) 
)
AS
BEGIN
	SELECT column_name as value, column_name as text
	FROM information_schema.columns
	WHERE table_name = @table_name


 END;
