
CREATE procedure [dbo].[dynamic_wires_usage_summary] (
  @criteria_id		int
 ,@region			varchar(200)=null
 ,@no_years			int = 3
 ,@include_cyear	char(1)='N'
 ,@byOEM            varchar(1)='N'
 ,@byVehicle_type   varchar(1)='N'
 ,@byRegion			varchar(1)='N' 
 ,@byMY				varchar(1)='N'
 ,@report_type_id   int=1
 )
AS
BEGIN
SET NOCOUNT ON
   DECLARE @stmt nvarchar(4000)
   DECLARE @stmt2 nvarchar(4000)
   DECLARE @from nvarchar(4000)
   DECLARE @where nvarchar(4000)
   DECLARE @group nvarchar(4000) 
   DECLARE @comma varchar(1)=''
   DECLARE @cols VARCHAR(50)=''
   DECLARE @criteria_cols VARCHAR(500)=''
   DECLARE @model_year_fr INT 
   DECLARE @model_year_to int 
   DECLARE @ctr int = 0
   DECLARE @rec int
   DECLARE @and   nvarchar(4000)=''
   DECLARE @and2  nvarchar(MAX)=''
   DECLARE @criteria_col_id int
   DECLARE @col_name NVARCHAR(100)
   DECLARE @operator_value nvarchar(20)
   DECLARE @col_value nvarchar(100)
   DECLARE @col_value2 nvarchar(100)
   DECLARE @small_wire_gauge decimal(6,2)

   CREATE TABLE #col_values (
		id					int identity
		,criteria_column_id int
		,column_name        nvarchar(100)
		,operator_value     nvarchar(20)
		,col_value          nvarchar(100)
		,col_value2         nvarchar(100)
	)
	INSERT INTO #col_values SELECT criteria_column_id, column_name, operator_value, column_value, column_value2 FROM dbo.criteria_columns WHERE criteria_id = @criteria_id and ISNULL(operator_value,'')<>'' ; 
	SET @model_year_to = YEAR(GETDATE())

	IF @include_cyear = 'Y'
		SET @model_year_fr = (@model_year_to - @no_years) + 1
	ELSE
		SET @model_year_fr = (@model_year_to - @no_years) 
   
	SET @and = @and + ' AND MODEL_YEAR BETWEEN ' + CAST(isnull(@model_year_fr,@model_year_to) AS VARCHAR(20)) + ' AND ' + CAST(isnull(@model_year_to,@model_year_fr) AS VARCHAR(20))  

	SELECT @rec = COUNT(*) FROM #col_values
	WHILE @ctr < @rec
	BEGIN
	    SET @ctr = @ctr + 1
		SELECT
		@criteria_col_id   =criteria_column_id
		,@col_name          =column_name       
		,@operator_value    =operator_value    
		,@col_value         =col_value         
		,@col_value2        =col_value2        
		FROM #col_values where id=@ctr;

		IF @operator_value = 'ISNULL'
		   SET @and2 = @and2 + ' AND ISNULL(' + @col_name + ','''') <> '''' '
        ELSE
		BEGIN
		IF @operator_value =  'BETWEEN' 
			SET @and2 = @and2 + ' AND ' + @col_name + ' ' +  @operator_value + ' ' + @col_value + ' AND ' + @col_value2 
        ELSE
		BEGIN
			DECLARE @ERRNUM INT
			DECLARE @cval   DECIMAL(5,2)
		    IF @operator_value <>  'IN' 
			BEGIN
				BEGIN TRY
					SET @cval = convert(decimal(5,2),@col_value)
				END TRY
				BEGIN CATCH
					SELECT @ERRNUM = ERROR_NUMBER() 
				END CATCH
                IF ISNULL(@ERRNUM,0) <> 0 
 			        SET @and2 = @and2 + ' AND ' + @col_name + ' ' + @operator_value + ''''+ rtrim(@col_value) +''''
                ELSE
				    SET @and2 = @and2 + ' AND ' + @col_name + ' ' + @operator_value + @col_value 

            END
            ELSE
			    SET @and2 = @and2 + ' AND ' + @col_name + ' IN (' +   STUFF((SELECT concat(''',''',attribute_value) 
			                                                                FROM dbo.criteria_column_values
			                             					                WHERE criteria_column_id = @criteria_col_id
					                                                            FOR XML PATH('')),2,2,'') + ''')'
		END
		END
   END

   SELECT @criteria_cols = STUFF((SELECT concat(',',column_name)
					FROM dbo.criteria_columns
					WHERE criteria_id = @criteria_id
					and is_output='Y'
					FOR XML PATH('')),1,1,'')
   
   IF @byRegion = 'Y' 
   BEGIN
      SET @cols = isnull(@cols,'') + @comma +  ' REGION_NAME '
	  SET @comma = ','
   END
 
   IF ISNULL(@region,'') <> ''
	  SET @and = @and + ' AND REGION_NAME = ''' + @region + '''' 
 
   IF @byMY = 'Y'
      SET @cols = isnull(@cols,'') + @comma +  ' MODEL_YEAR '

   IF @byRegion = 'Y' OR @byMY = 'Y'
      SET @group = ' GROUP BY ' + @cols 

   SELECT @small_wire_gauge=wire_gauge FROM dbo.reference_small_wire_gauge

--[dynamic_wires_usage_summary] @byMY='Y', @byRegion='N',@criteria_id=7, @report_type_id=1
   IF @report_type_id = 1 -- complex 1 sum small/sum others
	   BEGIN
		  SET @stmt  = 'SELECT COUNT(WIRE_GAUGE) small_wire_count, 0 big_wire_count' + concat(dbo.isNotNull(@cols,','),@cols) + ' FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) < '+ CAST(@small_wire_gauge as VARCHAR(20)) + @and + isnull(@and2,'')
		  SET @stmt2 = 'SELECT 0 small_wire_count, COUNT(WIRE_GAUGE) big_wire_count' + concat(dbo.isNotNull(@cols,','),@cols) + ' FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) >= '+ CAST(@small_wire_gauge as VARCHAR(20)) + @and + isnull(@and2,'')
	      SET @stmt = @stmt +  @group + ' UNION ' + @stmt2 +  @group
		  SET @stmt = 'SELECT ' + @cols + ', sum(big_wire_count) total_big_wires, sum(small_wire_count) total_small_wires, (sum(big_wire_count) + sum(small_wire_count)) total_wire_count  FROM (' + @stmt + ') x GROUP BY ' + @cols + ' ORDER BY ' + @cols
	   END

--[dynamic_wires_usage_summary] @byMY='Y', @byRegion='Y',@criteria_id=7, @report_type_id=2
     IF @report_type_id = 2 -- complex 2  detailed small wires / sum other wires
	   BEGIN
		  SET @stmt  = 'SELECT COUNT(WIRE_GAUGE) small_wire_count, 0 big_wire_count, CONVERT(decimal(5,2),WIRE_GAUGE) wires ' + concat(dbo.isNotNull(@cols,','),@cols)  + ' FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) < '+ CAST(@small_wire_gauge as VARCHAR(20)) + @and + isnull(@and2,'')
		  SET @stmt2 = 'SELECT 0 small_wire_count, COUNT(WIRE_GAUGE) big_wire_count, 0 wires' + concat(dbo.isNotNull(@cols,','),@cols) + ' FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) >= '+ CAST(@small_wire_gauge as VARCHAR(20)) + @and + isnull(@and2,'')
		  SET @stmt = @stmt +  @group + ', wire_gauge UNION ' + @stmt2 +  @group 
		  SET @stmt = 'SELECT ' + @cols + ', sum(big_wire_count) total_big_wires, sum(small_wire_count) total_small_wires, (sum(big_wire_count) + sum(small_wire_count)) total_wire_count, wires  FROM (' + @stmt + ') x GROUP BY wires ' + concat(dbo.isNotNull(@cols,','),@cols) + '  ORDER BY ' + @cols
	   END

--[dynamic_wires_usage_summary] @byMY='Y', @byRegion='Y',@criteria_id=7, @report_type_id=3
     IF @report_type_id = 3 -- complex 2  detailed other wires / sum small wires
	   BEGIN
		  SET @stmt  = 'SELECT COUNT(WIRE_GAUGE) small_wire_count, 0 big_wire_count, 0 wires ' + concat(dbo.isNotNull(@cols,','),@cols)  + ' FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) < '+ CAST(@small_wire_gauge as VARCHAR(20)) + @and + isnull(@and2,'')
		  SET @stmt2 = 'SELECT 0 small_wire_count, COUNT(WIRE_GAUGE) big_wire_count, CONVERT(decimal(5,2),WIRE_GAUGE) wires' + concat(dbo.isNotNull(@cols,','),@cols)  + ' FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) >= '+ CAST(@small_wire_gauge as VARCHAR(20)) + @and + isnull(@and2,'')
		  SET @stmt = @stmt +  @group + ' UNION ' + @stmt2 +  @group + ',wire_gauge'
		  SET @stmt = 'SELECT ' + @cols + ', sum(big_wire_count) total_big_wires, sum(small_wire_count) total_small_wires, (sum(big_wire_count) + sum(small_wire_count)) total_wire_count, wires  FROM (' + @stmt + ') x GROUP BY wires ' + concat(dbo.isNotNull(@cols,','),@cols)  + ' ORDER BY ' + @cols
	   END

    SET @cols = isnull(@criteria_cols,'') + concat(dbo.isNotNull(@criteria_cols,','),@cols)

--[dynamic_wires_usage_summary] @byMY='Y', @byRegion='Y',@criteria_id=9, @report_type_id=4
	IF @report_type_id = 4 -- Sum of small wires
	BEGIN
		set @stmt = 'SELECT COUNT(WIRE_GAUGE) wire_count ' + concat(dbo.isNotNull(@cols,','),@cols) + '  FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) < ' + CAST(@small_wire_gauge as VARCHAR(20)) + @and + isnull(@and2,'')
		set @stmt = @stmt + ' GROUP BY ' + @cols + ' ORDER BY ' + @cols
		
	END

--[dynamic_wires_usage_summary] @byMY='Y', @byRegion='Y',@criteria_id=7, @report_type_id=5 
	IF @report_type_id = 5 -- Sum of other wires 
	BEGIN
		set @stmt = 'SELECT COUNT(WIRE_GAUGE) wire_count ' + concat(dbo.isNotNull(@cols,','),@cols) + '  FROM dbo.cutsheets_v WHERE CONVERT(decimal(5,2),WIRE_GAUGE) >= ' + CAST(@small_wire_gauge as VARCHAR(20)) + @and + isnull(@and2,'')
		set @stmt = @stmt + ' GROUP BY ' + @cols + ' ORDER BY ' + @cols
   END

--[dynamic_wires_usage_summary] @byMY='Y', @byRegion='Y',@criteria_id=7, @report_type_id=6   
   IF @report_type_id = 6
   BEGIN
      set @stmt = 'SELECT COUNT(WIRE_GAUGE) wire_count ' + concat(dbo.isNotNull(@cols,','),@cols) + '  FROM dbo.cutsheets_v WHERE ISNULL(CONVERT(decimal(5,2),WIRE_GAUGE),0)<>0 ' + @and + isnull(@and2,'')
	  set @stmt = @stmt + ' GROUP BY ' + @cols + ' ORDER BY ' + @cols
   END

   EXEC(@stmt);
   
END

-- select * from dbo.criteria_columns
-- select * from dbo.criterias
-- delete from criteria_columns where isnull(column_name,'')=''




