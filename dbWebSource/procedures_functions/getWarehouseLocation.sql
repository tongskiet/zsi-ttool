

CREATE FUNCTION [dbo].[getWarehouseLocation] 
(
	@warehouse_id			as int
)
RETURNS varchar(50)
AS
BEGIN   
   DECLARE @l_retval   varchar(50);
   SELECT @l_retval = warehouse_location FROM dbo.warehouses where warehouse_id = @warehouse_id
   RETURN @l_retval;
END;

