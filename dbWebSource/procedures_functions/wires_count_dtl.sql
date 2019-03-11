CREATE procedure [dbo].[wires_count_dtl] (
  @region     varchar(200)=null
 ,@no_years   int = 3
 ,@include_cyear char(1)='Y'
 ,@byRegion   varchar(1)='N' 
 ,@byMY       varchar(1)='N'
)
AS
BEGIN
SET NOCOUNT ON
   DECLARE @stmt nvarchar(4000)
   DECLARE @from nvarchar(4000)
   DECLARE @where nvarchar(4000)
   DECLARE @model_year_fr INT 
   DECLARE @model_year_to int =YEAR(GETDATE())
   DECLARE @group nvarchar(4000) = 'GROUP BY WIRE_GAUGE '
   DECLARE @comma varchar(1)=''
   DECLARE @cols VARCHAR(50)=''

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
      SET @group = ' GROUP BY ' + @cols + ', WIRE_GAUGE '
   
    set @stmt = 'SELECT COUNT(WIRE_GAUGE) small_wire_count,WIRE_GAUGE, ' + @cols + ' FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) <= .5 '

   IF ISNULL(@region,'')<>''
      SET @stmt = @stmt + ' AND REGION_NAME = ''' + @region + '''' 

   IF ISNULL(@model_year_fr,'')<>'' or ISNULL(@model_year_to,'')<>''
      SET @stmt = @stmt + ' AND MODEL_YEAR BETWEEN ' + CAST(isnull(@model_year_fr,@model_year_to) AS VARCHAR(20)) + ' AND ' + CAST(isnull(@model_year_to,@model_year_fr) AS VARCHAR(20))  

   SET @stmt = @stmt +  @group + ' ORDER BY ' + @cols
   exec(@stmt);

  
END
--[wires_count_dtl] @byMY='Y', @byRegion='Y',@model_year_fr = 2017



