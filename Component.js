jQuery.sap.declare("zmclaren.prd.Component");
jQuery.sap.require("zmclaren.prd.MyRouter");


sap.ui.core.UIComponent.extend("zmclaren.prd.Component", {
	metadata: {
		name: "McLaren",
		version: "1.0",
		includes: ["css/style.css"],
		dependencies: {
			libs: ["sap.m", "sap.ui.layout"],
			components: []
		},

		rootView: "zmclaren.prd.view.MasterContainer",

		config: {
			fullWidth : "true",
			resourceBundle: "i18n/messageBundle.properties",
			serviceConfig: {
				name: "ZPRODUCTION_UX_SRV",
				serviceUrl: "/sap/opu/odata/sap/ZPRODUCTION_UX_SRV/"
			}
		},

		routing: {
			config: {
				routerClass: zmclaren.prd.MyRouter,
				viewType: "XML",
				viewPath: "zmclaren.prd.view",
				targetAggregation: "pages",
				clearTarget: false
			},
			routes: [{
					pattern: "",
					name: "home",
					view: "Home",
					targetControl: "idMasterContainer",
					viewLevel: 0
				}, 
				{
					// pattern: "main",
					pattern: "ProductionOrders/{plant}/{workcentre}",
					name: "app",
					view: "App",
					targetControl: "idMasterContainer",
					subroutes: [{
						// pattern: "main",
						pattern: "ProductionOrders/{plant}/{workcentre}", // /WorkCentreCollection(PlantID='9000',WorkCentreID='GA020')/ToProdOrderHdr/
						name: "main",
						view: "Master",
						targetAggregation: "masterPages",
						targetControl: "idAppControl",
						viewLevel: 1,
						subroutes: [{
							pattern: "{entity}",
							name: "detail",
							view: "Detail",
							targetAggregation: "detailPages",
							viewLevel: 2
						}]
					} 
					// ,{
					// 	name: "catchallMaster",
					// 	view: "Master",
					// 	targetAggregation: "masterPages",
					// 	targetControl: "idAppControl",
					// 	subroutes: [{
					// 		pattern: ":all*:",
					// 		name: "catchallDetail",
					// 		view: "NotFound",
					// 		transition: "show",
					// 		targetAggregation: "detailPages",
					// 		viewLevel: 2
					// 	}]
					// }
					]
				},
				// Second MD Pages
				{
					pattern: "Operations/{workcentre}/{prodorder}/{operator}",
					// pattern: "Operations/{workcentre}/{prodorder}",
					// pattern: "operations",
					name: "app2",
					view: "App2",
					targetControl: "idMasterContainer",
					subroutes: [{
						// pattern: "operations",
						pattern: "Operations/{workcentre}/{prodorder}/{operator}", // /WorkCentreCollection(PlantID='9000',WorkCentreID='GA020')/ToProdOrderHdr/
						// pattern: "Operations/{workcentre}/{prodorder}",
						name: "masteroperations",
						view: "MasterOperations",
						targetAggregation: "masterPages",
						targetControl: "idAppControl",
						viewLevel: 3,
						subroutes: [{
							pattern: "{workcentre}/{ordernumber}/{plannumber}/{operationcounter}/{operation}/{operator}",
							// pattern: "Operations/operation",
							name: "detailoperations",
							view: "DetailOperations",
							targetAggregation: "detailPages",
							viewLevel: 4
						}]
					}
					// , {
					// 	name: "catchallMaster",
					// 	view: "MasterOperations",
					// 	targetAggregation: "masterPages",
					// 	targetControl: "idApp2Control",
					// 	subroutes: [{
					// 		pattern: ":all*:",
					// 		name: "catchallDetail",
					// 		view: "NotFound",
					// 		transition: "show",
					// 		targetAggregation: "detailPages",
					// 		viewLevel: 4
					// 	}]
					// }
					]
				}

			]
		}
	},

	init: function() {
		
		jQuery.sap.require("zmclaren.prd.util.formatter");
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var mConfig = this.getMetadata().getConfig();

		// Always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var oRootPath = jQuery.sap.getModulePath("zmclaren.prd");

		// Set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, mConfig.resourceBundle].join("/")
		});
		this.setModel(i18nModel, "i18n");

		var sServiceUrl = mConfig.serviceConfig.serviceUrl;

		//This code is only needed for testing the application when there is no local proxy available
		var bIsMocked = jQuery.sap.getUriParameters().get("responderOn") === "true";
		// Start the mock server for the domain model
		if (bIsMocked) {
			this._startMockServer(sServiceUrl);
		}

		// Create and set domain model to the component
		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
			json: true,
			loadMetadataAsync: true,
			defaultOperationMode: "Client",
			defaultCountMode: "None",
			useBatch: false
		});
		
		oModel.setSizeLimit(300);
		
		oModel.attachMetadataFailed(function() {
			this.getEventBus().publish("Component", "MetadataFailed");
		}, this);
		this.setModel(oModel);

		// Set device model
		var oDeviceModel = new sap.ui.model.json.JSONModel({
			isTouch: sap.ui.Device.support.touch,
			isNoTouch: !sap.ui.Device.support.touch,
			isPhone: sap.ui.Device.system.phone,
			isNoPhone: !sap.ui.Device.system.phone,
			listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
			listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
		});
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");

		this.getRouter().initialize();
	},

	_startMockServer: function(sServiceUrl) {
		jQuery.sap.require("sap.ui.core.util.MockServer");
		var oMockServer = new sap.ui.core.util.MockServer({
			rootUri: sServiceUrl
		});

		var iDelay = +(jQuery.sap.getUriParameters().get("responderDelay") || 0);
		sap.ui.core.util.MockServer.config({
			autoRespondAfter: iDelay
		});

		oMockServer.simulate("model/metadata.xml", "model/");
		oMockServer.start();

		sap.m.MessageToast.show("Running in demo mode with mock data.", {
			duration: 4000
		});
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	}
});