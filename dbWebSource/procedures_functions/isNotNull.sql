
CREATE FUNCTION [dbo].[isNotNull]
(
	 @value1  as varchar(255)
	,@value2  as varchar(255)
)
RETURNS varchar(255)
AS
BEGIN
	DECLARE @l_retval as varchar(255) = @value2;
	IF ISNULL(@value1,'')=''
	   SET @l_retval=NULL;
    
	RETURN @l_retval
END

