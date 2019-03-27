CREATE FUNCTION [dbo].[Split]
(
    @str NVARCHAR(MAX),
    @sep NCHAR(1)
)
RETURNS TABLE
AS
RETURN
(
    WITH Split(stpos,endpos)
    AS(
        SELECT 0 AS stpos, CHARINDEX(@sep,@str) AS endpos
        UNION ALL
        SELECT CAST(endpos AS INT)+1 as stpos, CHARINDEX(@sep,@str,endpos+1) as endpos
            FROM Split
            WHERE endpos > 0
    )
    SELECT 'Id' = ROW_NUMBER() OVER (ORDER BY (SELECT 1)),
        'Data' = SUBSTRING(@str,stpos,COALESCE(NULLIF(endpos,0),LEN(@str)+1)-stpos)
    FROM Split
)
