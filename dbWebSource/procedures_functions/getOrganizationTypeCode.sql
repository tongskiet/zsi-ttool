
CREATE FUNCTION [dbo].[getOrganizationTypeCode] 
(
	@organization_type_id			as int
)
RETURNS nvarchar(50)
AS
BEGIN   
   DECLARE @l_retval   nvarchar(50);
   SELECT TOP 1 @l_retval = organization_type_code FROM dbo.organization_types where organization_type_id = @organization_type_id
   RETURN @l_retval;
END;

