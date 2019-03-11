create FUNCTION [dbo].[TrimAll] 
(
   @text AS NVARCHAR(MAX)
)
RETURNS NVARCHAR(MAX)
AS
BEGIN   

declare @key  nvarchar(20)=' ';
declare @maxRepeatedKey nvarchar(100)='';

set @text = ltrim(rtrim(@text))

declare @aCount int =0;
declare @bCount int =0;

WHILE ( @aCount < 1000)  
BEGIN  
	declare @charFound int = charindex( @key,@text);
	IF(@charFound > 0 )
		BEGIN
			SET @maxRepeatedKey = @key;
			SET @key = @key + @key;
		END
	ELSE 
		set @aCount =1000
   set @aCount  = @aCount +1;
end

SET @bCount = len(replace(@maxRepeatedKey,' ','`'))

WHILE (@bCount > 1 )  
BEGIN  
	SET @text=REPLACE(@text,RIGHT(@maxRepeatedKey,@bCount),' ')
    set @bCount  = @bCount  - 1;
end

return @text

END




