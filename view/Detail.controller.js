jQuery.sap.require("zmclaren.prd.util.formatter");
jQuery.sap.require("zmclaren.prd.util.messages");
jQuery.sap.require("zmclaren.prd.util.TaktClock");

sap.ui.core.mvc.Controller.extend("zmclaren.prd.view.Detail", {

	onInit: function() {
		this._oView = this.getView();
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		if (sap.ui.Device.system.phone) {
			//Do not wait for the master when in mobile phone resolution
			this.oInitialLoadFinishedDeferred.resolve();
		} else {
			this.getView().setBusy(true);
			var oEventBus = this.getEventBus();
			oEventBus.subscribe("Component", "MetadataFailed", this.onMetadataFailed, this);
			oEventBus.subscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);
		}

		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
	},
	
	 onAfterRendering: function() {
	// 	$("#prodOrdersShell").removeClass("sapMShellAppWidthLimited");
	/*global zmclaren*/
	  zmclaren.prd.util.TaktClock.onRemoveActionHandler();
	 },	

	onMasterLoaded: function(sChannel, sEvent) {
		this.getView().setBusy(false);
		this.oInitialLoadFinishedDeferred.resolve();
		
		//Set Option List Height
		this.setOptionListHeight();
	},

	onMetadataFailed: function() {
		this.getView().setBusy(false);
		this.oInitialLoadFinishedDeferred.resolve();
		this.showEmptyView();
	},

	onRouteMatched: function(oEvent) {
		try{
			var oParameters = oEvent.getParameters();
	
			jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {
				var oView = this.getView();
	
				// When navigating in the Detail page, update the binding context 
				if (oParameters.name !== "detail") {
					return;
				}
	
				var sEntityPath = "/" + oParameters.arguments.entity;
				//Get Parameters
				var pModel = new sap.ui.model.json.JSONModel({"pNav": sEntityPath});
				oView.setModel(pModel, "pModel");
				
				this.bindView(sEntityPath);
			}, this));
		}
		catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	bindView: function(sEntityPath) {
		var oView = this.getView();
		oView.bindElement(sEntityPath);

		//Check if the data is already on the client
		if (!oView.getModel().getData(sEntityPath)) {

			// Check that the entity specified was found.
			oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {
				var oData = oView.getModel().getData(sEntityPath);
				if (!oData) {
					this.showEmptyView();
					this.fireDetailNotFound();
				} else {
					this.fireDetailChanged(sEntityPath);
				}
			}, this));

		} else {
			this.fireDetailChanged(sEntityPath);
		}

	},

	showEmptyView: function() {
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "zmclaren.prd.view.NotFound",
			targetViewType: "XML"
		});
	},

	fireDetailChanged: function(sEntityPath) {
		this._oView.byId("idVinCheck").setValue("");
		this._oView.byId("idVinCheck").focus();
		this._oView.byId("idBtnVinSelect").setEnabled(true);
		this.getEventBus().publish("Detail", "Changed", {
			sEntityPath: sEntityPath
		});
	},

	fireDetailNotFound: function() {
		this.getEventBus().publish("Detail", "NotFound");
	},

	onNavBack: function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavBack("main");
	},

	onDetailSelect: function(oEvent) {
		sap.ui.core.UIComponent.getRouterFor(this).navTo("detail", {
			entity: oEvent.getSource().getBindingContext().getPath().slice(1),
			tab: oEvent.getParameter("selectedKey")
		}, true);
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},
	
	onSelect: function(oEvent) {
		try 
		{
			// this.getEventBus().publish("ClearMasterOperationsSearch", "ClearSearch");
			this.getEventBus().publish("Detail", "CheckBeforeLoadOperators");
			var _oView = this.getView();
			
			if (this.checkVIN())
			{
				sap.ui.getCore().getModel("Operators").setProperty("/ProductionOrder", _oView.byId("detailOHProdOrders").getTitle().split(" ")[2]);
				sap.ui.getCore().getModel("Operators").setProperty("/Model", _oView.byId("detailOHProdOrders").getNumber().split(" ")[1]);
				_oView.byId("idVinCheck").setValueState("None");
				_oView.byId("idVinCheck").setValueStateText("");
				
				var sPath = _oView.oModels.pModel.oData.pNav;
				var aPar = sPath.split("'");
				
				// Update Start Prod Order data
				this.updateStartProdOrder(sPath);
				
				this.getRouter().navTo("app2", {
					from: "detail",
					// plant: aPar[1], //Fixed for now but will change in the future
					workcentre: aPar[3], //this.getView().byId("workcentreId").getValue()
					prodorder: this.getView().byId("detailOHProdOrders").getTitle().split(" ")[2],
					operator: "1"
				});
				_oView.byId("idVinCheck").setValue("");
				this._oView.byId("idBtnVinSelect").setEnabled(false);
			}
			else
			{
				_oView.byId("idVinCheck").setValueState("Error");
				_oView.byId("idVinCheck").setValueStateText("VIN number does not match!");
				_oView.byId("idVinCheck").focus();
			}
		}catch(oError){
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	// Update Start Prod Order
	updateStartProdOrder : function(sPath){
		try{
			var data = {
			        "OperatorName": sap.ui.getCore().getModel("Operators").getData().Operators[0].UName
				};
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
				var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				     defaultBindingMode: "OneWay",
			     	 useBatch: false,
			     	 defaultCountMode: "Inline",
				     loadMetadataAsync: false
				});
		// /ProdOrderHdrCollection(PlantID='9000',WorkCentreID='GA010',OrderNumber='1000001')
			var uri = sPath;
			oDataModel.update(uri, data, 
			{
	        	success : function(oData, oResponse, aErrorResponse){
					// sap.m.MessageToast.show("Test");
	        	},
	        	error : function(oError){
	        		zmclaren.prd.util.messages.showErrorMessage(oError);
	        	}
	        });
		}catch(oError){
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	//Set Option List Height
	setOptionListHeight : function(){
		//Top Bar 48px / ObjectHeader 166px / Form Vin 80px / List Bar 48px / Footer 48px / Something 65 / Total 455
		var windowSize = $(window).height();
		var space;
		// if(sap.ui.getCore().byId("mainShell") === undefined){
		// 	space = 455;
		// }
		// else{
		// 	space = 499;
		// }
		space = 455;
		this.getView().byId("idSCOptionList").setHeight((windowSize - space)+"px");		
	},
	
	checkVIN: function(oEvent){
		var _oView = this.getView();
		if (_oView.byId("oaVIN").getText().toString().toUpperCase() === _oView.byId("idVinCheck").getValue().toString().toUpperCase()){
			return true;
		}
		else{
			return false;	
		}
	},
	
	handleConfirmLogOff : function(){
		this.getRouter().navTo("home", {});
		location.reload();
	},
	
	handleCancelLogOff : function(){
		this._confirmLogOffDialog.close();
	},
	
	//Log Off Operators
	onLogOffOperators : function(){
		try {
    		// create value confirm dialog
			if (!this._confirmLogOffDialog) {
				this._confirmLogOffDialog = sap.ui.xmlfragment(
					"zmclaren.prd.view.DialogConfirmLogOff",
					this
				);
				this.getView().addDependent(this._confirmLogOffDialog);
			}
	
			// open value confirm
			this._confirmLogOffDialog.open();
		}
		catch(oError) {
			sap.m.MessageToast.show("Error!");
		    var errCode;
		    if(oError.status){
		    	if(oError.status != "error"){
		    		errCode = oError.status;
		    	}
		    }
		    if(oError.response){
		    	errCode = oError.response.statusCode;
		    }
		    if (oError.statusCode){
		    	errCode = oError.statusCode;
		    }
		    if(errCode == "503")
		    {
		    	sap.m.MessageToast.show("Error! Reloading...");
				this.getRouter().navTo("home", {});
				location.reload();		    	
		    }
		    zmclaren.prd.util.messages.showErrorMessage(oError);
		}		
	},

	onExit: function(oEvent) {
		var oEventBus = this.getEventBus();
		oEventBus.unsubscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);
		oEventBus.unsubscribe("Component", "MetadataFailed", this.onMetadataFailed, this);
	}
});