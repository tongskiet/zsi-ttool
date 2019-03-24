
CREATE VIEW [dbo].[cutsheets_v]
AS
SELECT        dbo.projects_v.region_name, lear_bm31.dbo.cutsheets.PROJECT_ID, lear_bm31.dbo.cutsheets.PROJECT_NAME, lear_bm31.dbo.cutsheets.OEM_ID, lear_bm31.dbo.cutsheets.LINE_NO, 
                         lear_bm31.dbo.cutsheets.HARNESS_NAME, lear_bm31.dbo.cutsheets.DEVICE_NAME, lear_bm31.dbo.cutsheets.TO_DEVICE_NAME, lear_bm31.dbo.cutsheets.GSYSTEM, lear_bm31.dbo.cutsheets.GSUBSYSTEM, 
                         lear_bm31.dbo.cutsheets.GDEVICE, lear_bm31.dbo.cutsheets.TO_GSYSTEM, lear_bm31.dbo.cutsheets.TO_GSUBSYSTEM, lear_bm31.dbo.cutsheets.TO_GDEVICE, lear_bm31.dbo.cutsheets.CIRCUIT_NAME, 
                         lear_bm31.dbo.cutsheets.GROUND_CIRCUIT, lear_bm31.dbo.cutsheets.COLOR, lear_bm31.dbo.cutsheets.WIRE_TYPE, lear_bm31.dbo.cutsheets.WIRE_GAUGE, lear_bm31.dbo.cutsheets.OEM_STANDARD, 
                         lear_bm31.dbo.cutsheets.WIRE_LENGTH, lear_bm31.dbo.cutsheets.OPTION_CODE, lear_bm31.dbo.cutsheets.WIRE_FUNCTION, lear_bm31.dbo.cutsheets.CIRCUIT_SUBSYSTEM, 
                         lear_bm31.dbo.cutsheets.INTEGRATED_FUNCTIONS, lear_bm31.dbo.cutsheets.CONTROLLING_MODULES, lear_bm31.dbo.cutsheets.TWISTED_WIRES, lear_bm31.dbo.cutsheets.INHOUSE_SHIELDED_CABLES, 
                         lear_bm31.dbo.cutsheets.TWIST_NAME, lear_bm31.dbo.cutsheets.IMAGE_NAME, lear_bm31.dbo.cutsheets.INLINE_TO, lear_bm31.dbo.cutsheets.CTSGFR_CODE, lear_bm31.dbo.cutsheets.CTSGFRCODE_SUFFIX, 
                         lear_bm31.dbo.cutsheets.PINOUT, lear_bm31.dbo.cutsheets.CLASSIFICATION, lear_bm31.dbo.cutsheets.INLINE_CONN_COLOR, lear_bm31.dbo.cutsheets.INLINE_CONN_CAVITIES, 
                         lear_bm31.dbo.cutsheets.INLINE_CONN_DESIGN_OPPORTUNITY, lear_bm31.dbo.cutsheets.INLINE_CONNECTION_FIXING_METHOD, lear_bm31.dbo.cutsheets.GENDER, lear_bm31.dbo.cutsheets.FAKRA_ORIENTATION, 
                         lear_bm31.dbo.cutsheets.CONNECTOR_SEALING, lear_bm31.dbo.cutsheets.SEAL, lear_bm31.dbo.cutsheets.SEALING_CONFIGURATION, lear_bm31.dbo.cutsheets.CONNECTOR_TYPES, 
                         lear_bm31.dbo.cutsheets.NO_OF_CAVITIES, lear_bm31.dbo.cutsheets.TPA, lear_bm31.dbo.cutsheets.CPA, lear_bm31.dbo.cutsheets.ENGAGEMENT_METHOD, lear_bm31.dbo.cutsheets.GREASE_ON_CONNECTOR, 
                         lear_bm31.dbo.cutsheets.TPA_METHOD, lear_bm31.dbo.cutsheets.SHORTING_BAR_ON_CONNECTOR, lear_bm31.dbo.cutsheets.STRAIN_RELIEF_METHOD, lear_bm31.dbo.cutsheets.SPECIAL_CONNECTORS, 
                         lear_bm31.dbo.cutsheets.CONNECTOR_PART_NUMBER, lear_bm31.dbo.cutsheets.CONNECTOR_SUPPLIER, lear_bm31.dbo.cutsheets.MALE, lear_bm31.dbo.cutsheets.FEMALE, 
                         lear_bm31.dbo.cutsheets.TERMINAL_TAB_SIZE_BY_CONNECTOR, lear_bm31.dbo.cutsheets.RING_EYELET_TYPE, lear_bm31.dbo.cutsheets.RING_EYELET_SEALING, lear_bm31.dbo.cutsheets.BOOT_COVERING, 
                         lear_bm31.dbo.cutsheets.BATTERY_LUG, lear_bm31.dbo.cutsheets.CRIMPED_METHOD, lear_bm31.dbo.cutsheets.FIXATION, lear_bm31.dbo.cutsheets.ANTI_ROTATIONAL_EYELET, lear_bm31.dbo.cutsheets.HOLE_SIZE, 
                         lear_bm31.dbo.cutsheets.OUTER_DIAMETER, lear_bm31.dbo.cutsheets.LTYPE, lear_bm31.dbo.cutsheets.CASE_GROUND_MODULE, lear_bm31.dbo.cutsheets.PLATING, lear_bm31.dbo.cutsheets.PRIMARY_LOCKING, 
                         lear_bm31.dbo.cutsheets.SYMMETRICAL_DESIGN, lear_bm31.dbo.cutsheets.TERMINAL_PART_NUMBER, lear_bm31.dbo.cutsheets.TERMINAL_SUPPLIER, lear_bm31.dbo.cutsheets.SEALING, 
                         lear_bm31.dbo.cutsheets.SPLICE_METHOD, lear_bm31.dbo.cutsheets.COVERING, lear_bm31.dbo.cutsheets.SPLICE_CONFIGURATION, lear_bm31.dbo.cutsheets.INTERIOR, lear_bm31.dbo.cutsheets.EXTERIOR, 
                         lear_bm31.dbo.cutsheets.TO_IMAGE_NAME, lear_bm31.dbo.cutsheets.TO_INLINE_TO, lear_bm31.dbo.cutsheets.TO_CTSGFR_CODE, lear_bm31.dbo.cutsheets.TO_CTSGFRCODE_SUFFIX, 
                         lear_bm31.dbo.cutsheets.TO_PINOUT, lear_bm31.dbo.cutsheets.TO_CLASSIFICATION, lear_bm31.dbo.