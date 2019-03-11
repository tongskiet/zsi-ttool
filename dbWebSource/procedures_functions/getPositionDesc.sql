CREATE FUNCTION [dbo].[getPositionDesc](
@position_id int
) 
RETURNS VARCHAR(100) 
AS
BEGIN
   DECLARE @l_role_name VARCHAR(100); 
      SELECT @l_role_name = position FROM dbo.positions where position_id = @position_id
      RETURN @l_role_name;
END;

