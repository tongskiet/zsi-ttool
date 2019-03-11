
CREATE FUNCTION [dbo].[countPageProcesses] 
(
	@page_id			as int
)
RETURNS INT
AS
BEGIN   
   DECLARE @l_retval    INT;
   SELECT @l_retval = COUNT(*) FROM dbo.page_processes WHERE page_id = @page_id

   RETURN @l_retval;
END;



