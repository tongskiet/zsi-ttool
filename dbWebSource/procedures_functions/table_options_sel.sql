CREATE PROCEDURE [dbo].[table_options_sel]
AS
BEGIN
	 select name as value, name as text from sys.objects where type IN ('u','v')  order by name
 END;

