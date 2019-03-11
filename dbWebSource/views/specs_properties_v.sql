create VIEW dbo.specs_properties_v as
(
   select * from lear_bms03.dbo.spec_properties_tree_v where ISNULL(input_type,'')<>''  and specs_id=40
)