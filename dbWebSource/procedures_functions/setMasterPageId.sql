create FUNCTION [dbo].[setMasterPageId] 
(
	@page_name	as varchar(100)
)
RETURNS INT
AS
BEGIN   
	DECLARE @l_retval    INT;
	DECLARE @master_tmpl_id INT;
	DECLARE @master_default_id INT;
	SELECT @master_tmpl_id=master_page_id from master_pages where master_page_name = '_popup'
	SELECT @master_default_id=master_page_id from master_pages where master_page_name = '_layout'

	IF ( LTRIM(@page_name) like 'tmpl%' )
		SET @l_retval= @master_tmpl_id;
	ELSE 
		SET @l_retval =@master_default_id;


   RETURN @l_retval;
END;

