CREATE procedure [dbo].[overall_wires_usage_summary] (
  @region     varchar(200)=null
 ,@no_years   int = 3
 ,@include_cyear char(1)='Y'
 ,@byRegion   varchar(1)='N' 
 ,@byMY       varchar(1)='N')
AS
BEGIN
SET NOCOUNT ON
   DECLARE @stmt nvarchar(4000)
   DECLARE @stmt2 nvarchar(4000)
   DECLARE @from nvarchar(4000)
   DECLARE @where nvarchar(4000)
   DECLARE @group nvarchar(4000) 
   DECLARE @comma varchar(1)=''
   DECLARE @cols VARCHAR(500)=''
   DECLARE @model_year_fr INT 
   DECLARE @model_year_to int =YEAR(GETDATE())

	IF @include_cyear = 'Y'
		SET @model_year_fr = @model_year_to - @no_years
	ELSE
		SET @model_year_fr = @model_year_to - (@no_years+1) 

   IF @byRegion = 'Y' 
   BEGIN
      SET @cols = @cols +  ' REGION_NAME '
	  SET @comma = ','
   END
   
   IF @byMY = 'Y'
      SET @cols = @cols + @comma +  ' MODEL_YEAR '

   IF @byRegion = 'Y' OR @byMY = 'Y'
      SET @group = ' GROUP BY ' + @cols 


   set @stmt = 'SELECT COUNT(WIRE_GAUGE) small_wire_count, 0 big_wire_count, ' + @cols + '  FROM dbo.wires_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) < .5'
   set @stmt2 = ' SELECT 0 small_wire_count, COUNT(WIRE_GAUGE) big_wire_count, ' + @cols + ' FROM dbo.wires_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) >= .5'

   SET @stmt = @stmt +  @group + ' UNION ' + @stmt2 +  @group
   SET @stmt = 'SELECT ' + @cols + ', sum(big_wire_count) total_big_wires, sum(small_wire_count) total_small_wires, (sum(big_wire_count) + sum(small_wire_count)) total_wire_count  FROM (' + @stmt + ') x GROUP BY ' + @cols + ' ORDER BY ' + @cols
   exec(@stmt);
   
END

--[overall_wires_usage_summary] @byMY='Y', @byRegion='N',@model_year_fr = 2017

