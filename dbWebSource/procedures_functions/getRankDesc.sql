CREATE FUNCTION [dbo].[getRankDesc](
@rank_id int
) 
RETURNS VARCHAR(100) 
AS
BEGIN
   DECLARE @l_role_name VARCHAR(100); 
      SELECT @l_role_name = rank_desc FROM dbo.ranks where rank_id = @rank_id
      RETURN @l_role_name;
END;

