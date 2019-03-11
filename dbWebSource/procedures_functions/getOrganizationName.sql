

CREATE FUNCTION [dbo].[getOrganizationName] 
(
	@organization_id			as int
)
RETURNS varchar(50)
AS
BEGIN   
   DECLARE @l_retval   varchar(50);
   SELECT @l_retval = organization_name FROM dbo.organizations where organization_id = @organization_id
   RETURN @l_retval;
END;

