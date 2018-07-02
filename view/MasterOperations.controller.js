jQuery.sap.require("zmclaren.prd.util.messages");
jQuery.sap.require("sap.ca.ui.message.message");
jQuery.sap.require("zmclaren.prd.util.TaktClock");
var bFlagBDR;
var sName;

sap.ui.core.mvc.Controller.extend("zmclaren.prd.view.MasterOperations", {
	
	oOperationsModel: new sap.ui.model.json.JSONModel(),

	onInit: function() {
		//Check if the model is defined
		if(sap.ui.getCore().getModel("Operators") === undefined)
		{
			this.getRouter().navTo("home", {});
			location.reload();
		}
		this._oView = this.getView();
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
		this._oRouter = this._oComponent.getRouter();
		
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		var oEventBus = this.getEventBus();
		oEventBus.subscribe("DetailOperations", "TabChanged", this.onDetailTabChanged, this);
		oEventBus.subscribe("ConfirmBDR", "BDRConfirmed", this.onBDRConfirmed, this);
		oEventBus.subscribe("ConfirmBDR", "BDRNotConfirmed", this.onBDRNotConfirmed, this);
		oEventBus.subscribe("Detail", "CheckBeforeLoadOperators", this.onBeforeLoad, this);
		oEventBus.subscribe("DetailOperations", "DataCollectionIcon", this.onChangeDataCollectionIcon, this);
		oEventBus.subscribe("DetailOperations", "DataCollectionAllIcon", this.onChangeDataCollectionAllIcon, this);

		var oList = this._oView.byId("listOperations");
		oList.attachEvent("updateFinished", function() {
			this.oInitialLoadFinishedDeferred.resolve();
			oEventBus.publish("MasterOperations", "InitialLoadFinished");
		}, this);

		//On phone devices, there is nothing to select from the list. There is no need to attach events.
		if (sap.ui.Device.system.phone) {
			return;
		}

		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

		oEventBus.subscribe("DetailOperations", "Changed", this.onDetailChanged, this);
		oEventBus.subscribe("DetailOperations", "NotFound", this.onNotFound, this);
		this.startTime(); 
	// ----- Included by Sai - 29/05/2018 - TAKT Clock
	   
	//   this.timer();
	 // -----End of TAKT clock changes  
		bFlagBDR = true;
	},
	
	// onAfterRendering: function() {
	// 	$("#prodOrdersShell").removeClass("sapMShellAppWidthLimited");
	// },

	onRouteMatched: function(oEvent) {
		try{
			sName = oEvent.getParameter("name");
			// var sObjectPath = "/ProdOrderHdrCollection(PlantID='" + oEvent.getParameter("arguments").plant + "',WorkCentreID='" + oEvent.getParameter("arguments").workcentre + "',OrderNumber='" + oEvent.getParameter("arguments").prodorder + "')";///?$filter=Operator eq 1";
			// var sObjectPath = "/GetOperationsForOperator?WorkCentreID='" + oEvent.getParameter("arguments").workcentre + "'&OrderNumber='" + oEvent.getParameter("arguments").prodorder + "'&Operator='" + oEvent.getParameter("arguments").operator + "'"; 
	
			if (sName !== "masteroperations") {
				// if (sName !== "detailoperations")
				// {
					return;	
				// }
			}
			
			//Load Operations
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			
			var oConfig = {
				metadataUrlParams: {},
				json: true,
				// loadMetadataAsync : true,
				defaultBindingMode: "TwoWay",
				defaultCountMode: "Inline",
				useBatch: false
			};
			
			this.oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, oConfig);
			this.getView().byId("listOperations").setBusy(true);
			
			//Deal with refresh
			var prodOrder;
			if(oEvent.getParameter("arguments").prodorder)
			{
				prodOrder = oEvent.getParameter("arguments").prodorder;
			}
			else
			{
				prodOrder = oEvent.getParameter("arguments").ordernumber;
			}
			
	        this.oDataModel.read("GetOperationsForOperator", {
	        	urlParameters: "WorkCentreID='" + oEvent.getParameter("arguments").workcentre + "'&OrderNumber='" + prodOrder + "'&Operator='" + oEvent.getParameter("arguments").operator + "'", //&$expand=ToOperationComponent,ToOperationTool,ToOperationBDR,ToOperationWorkInstruction
	        	success : jQuery.proxy(this.onOperationsSuccess, this),
	        	error : jQuery.proxy(this._onRequestFailed, this),
	        	async : true
	        });
	        
	        this.getView().setModel(this.oOperationsModel, "Operations");
	        
	        //End Load Operations
	
			// this._bindView(sObjectPath);
	
			//Load the detail view in desktop
			this.loadDetailView();
	
			//Wait for the list to be loaded once
			this.waitForInitialListLoading(function() {
	
				//On the empty hash select the first item
				this.selectFirstItem();
	
			});
		}
		catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	/**
	 * Binds the view to the object path. Makes sure that detail view displays
	 * a busy indicator while data for the corresponding element binding is loaded.
	 * @function
	 * @param {string} sObjectPath path to the object to be bound to the view.
	 * @private
	 */
	_bindView: function(sObjectPath) {
		// Set busy indicator during view binding
		var oViewModel = this.getView().getModel();

		// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
		oViewModel.setProperty("/busy", false);

		this.getView().bindElement({
			path: sObjectPath,
			events: {
				change: this._onBindingChange.bind(this),
				dataRequested: function() {
					oViewModel.setProperty("/busy", true);
				},
				dataReceived: function() {
					oViewModel.setProperty("/busy", false);
				}
			}
		});
		
		// var itemTemplate = new sap.m.StandardListItem(
		// {
  //      	title: '{ShortText}',
  //      	description: '{Operation}'
  //  	});
		
		// this.getView().byId("listOperations").bindAggregation("items", sObjectPath, itemTemplate);
		
		// var oODataJSONModel =  new sap.ui.model.json.JSONModel();
		// oODataJSONModel.setData(this.getView().getModel().oData);
		// this.getView().byId("listOperations").setModel(oODataJSONModel, "test");
		
		// var oTemplate = this._oView.byId("mainListItem");
  //      this.getView().byId("listOperations").bindItems(
  //          {
  //              path: sObjectPath,
  //              template: oTemplate
  //          }
  //      );
	
	},
	
	onDetailChanged: function(sChanel, sEvent, oData) {
		var sEntityPath = oData.sEntityPath;
		//Wait for the list to be loaded once
		this.waitForInitialListLoading(function() {
			var oList = this.getView().byId("listOperations");

			var oSelectedItem = oList.getSelectedItem();
			// The correct item is already selected
			if (oSelectedItem && oSelectedItem.getBindingContext().getPath() === sEntityPath) {
			// if (oSelectedItem) {
				return;
			}

			var aItems = oList.getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getBindingContext().getPath() === sEntityPath) {
					oList.setSelectedItem(aItems[i], true);
					break;
				}
			}
		});
	},

	onDetailTabChanged: function(sChanel, sEvent, oData) {
		this.sTab = oData.sTabKey;
	},

	loadDetailView: function() {
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "zmclaren.prd.view.DetailOperations",
			targetViewType: "XML"
		});
	},

	waitForInitialListLoading: function(fnToExecute) {
		jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(fnToExecute, this));
	},

	onNotFound: function() {
		this.getView().byId("listOperations").removeSelections();
	},

	selectFirstItem: function() {
		if(sName == "masteroperations")
		{
			var oList = this.getView().byId("listOperations");
			var aItems = oList.getItems();
			if (aItems.length) {
				oList.setSelectedItem(aItems[0], true);
				//Load the detail view in desktop
				this.loadDetailView();
				oList.fireSelect({
					"listItem": aItems[0]
				});
				oList.getItems()[0].focus();
			} else {
				this.getRouter().myNavToWithoutHash({
					currentView: this.getView(),
					targetViewName: "zmclaren.prd.view.NotFound",
					targetViewType: "XML"
				});
			}
		}
	},

	onSearch: function() {
		try
		{
			// this.oInitialLoadFinishedDeferred = jQuery.Deferred();
			// Add search filter
			var filters = [];
			var searchString = this.getView().byId("searchFieldOperations").getValue();
			if (searchString && searchString.length > 0) {
				var fShortText = new sap.ui.model.Filter("ShortText", sap.ui.model.FilterOperator.Contains, searchString);
				// var fOperation = new sap.ui.model.Filter("Operation", sap.ui.model.FilterOperator.Contains, searchString);
				filters = [fShortText];
			}
			// Update list binding
			this.getView().byId("listOperations").getBinding("items").filter(filters);
			this.getView().byId("masterOperationsPage").setTitle("Operations (" + this.getView().byId("listOperations").getBinding("items").getLength() + ")");
	
			//On phone devices, there is nothing to select from the list
			if (sap.ui.Device.system.phone) {
				return;
			}
	
			//Wait for the list to be reloaded
			this.waitForInitialListLoading(function() {
				//On the empty hash select the first item
				this.selectFirstItem();
			});
		}
		catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	onBDRConfirmed : function(){
		this.getView().byId("listOperations").setMode("SingleSelectMaster");
	},
	
	onBDRNotConfirmed : function(){
		this.getView().byId("listOperations").setMode("None");
	},
	
	onChangeDataCollectionIcon : function(sView,sMethod,sOperation){
		var listOperations = this.getView().byId("listOperations");
		// for(var i=0;i<listOperations.getItems().length;i++)
		// {
		// 	if(listOperations.getItems()[i].getContent()[0].getItems()[1].getItems()[1].getItems()[0].getText() === sOperation)
		// 	{
		// 		listOperations.getItems()[i].getContent()[0].getItems()[1].getItems()[0].setColor("green");
		// 	}
		// }
		var data = this.getView().getModel("Operations").getData().results;
		for(var i=0;i<data.length;i++)
		{
			if(data[i].Operation === sOperation)
			{
				this.getView().getModel("Operations").getData().results[i].DataCollected = true;
			}
		}
		this.getView().getModel("Operations").refresh(true);
	},
	
	onChangeDataCollectionAllIcon : function(){
		// var listOperations = this.getView().byId("listOperations");
		// listOperations.getItems()[0].getContent()[0].getItems()[1].getItems()[0].setColor("green");
		this.getView().getModel("Operations").getData().results[0].DataCollected = true;
		this.getView().getModel("Operations").refresh();
	},

	onSelect: function(oEvent) {
		try{
//			  zmclaren.prd.util.TaktClock.onUserActionHandler();
			// var aItems = this.getView().byId("listOperations").getItems();
			var pos = oEvent.getParameter("listItem").getId().split("-").slice(-1);
			this.deletedOperations(this.getView().getModel("Operations").getData().results[pos]);
		
			// Get the list item either from the listItem parameter or from the event's
			// source itself (will depend on the device-dependent mode)
			this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			
		}
		catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	// Confirm Operation
	// confirmOperation : function(){
	// 	// alert("test");	
	// },
	
	/*
	 * Handler Operations for OData Service returns
	 */
	onOperationsSuccess: function(oData) {
		this.oOperationsModel.setData(oData);
		this.setPreviousOperation(oData.results[0].Operator);
		// this.selectFirstItem();
		this.getView().byId("listOperations").setBusy(false);
	},
	
	//default function for errors during Odata calls
	_onRequestFailed: function(oError) {
		this.getView().byId("listOperations").setBusy(false);
		zmclaren.prd.util.messages.showErrorMessage(oError);
	},
	
	//Clear search
	onClearSearch : function(){
		this.getView().byId("searchFieldOperations").setValue("");
		this.getView().byId("listOperations").getBinding("items").filter();
		this.getView().byId("masterOperationsPage").setTitle("Operations (" + this.getView().byId("listOperations").getBinding("items").getLength() + ")");
	},
	
	// Checks Before Load
	onBeforeLoad : function(){
		this.onClearSearch();
	},

	showDetail: function(oItem) {
		try{
			var data = this.getView().getModel("Operations").oData.results[oItem.getBindingContextPath().split("/")[2]];
			//Update Operators Model
			// this.updateOperatorsOperation(oItem, data.Operator)
			// If we're on a phone device, include nav in history
			var bReplace = jQuery.device.is.phone ? false : true;
			this.getRouter().navTo("detailoperations", {
				from: "MasterOperations",
				// entity2: oItem.getBindingContext().getPath().substr(1),
				// entity2: data,
				// entity2: oItem.getBindingContextPath().substr(1),
				// entity2: "ProdOrderOperationCollection(WorkCentreID='"+ data.WorkCentreID +"',OrderNumber='"+ data.OrderNumber +"',Operator='"+ data.Operator +"',OperationPlanNo='"+ data.OperationPlanNo +"',OperationCounter='"+ data.OperationCounter +"',Operation='"+ data.Operation +"')",
				workcentre: data.WorkCentreID,
				ordernumber: data.OrderNumber,
				plannumber: data.OperationPlanNo,
				operationcounter: data.OperationCounter,
				operation: data.Operation,
				operator: data.Operator
				// tab: this.sTab
			}, bReplace);
		}
		catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	// Update Operators Model with selected Operation
	// updateOperatorsOperation : function(oItem, sOperator){
	// 	var operatorsData = sap.ui.getCore().getModel("Operators").getData();
	// 	operatorsData.Operators[sOperator-1].Operation = oItem;
	// },
	
	// Select Previous Operation for Operator
	setPreviousOperation : function(sOperator){
		try
		{
			var that = this;
			var operatorsData = sap.ui.getCore().getModel("Operators").getData();
			var listOperations = this.getView().byId("listOperations");
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
			     defaultBindingMode: "OneWay",
		     	 useBatch: false,
		     	 defaultCountMode: "Inline",
			     loadMetadataAsync: false
			});

			var uri = "/ViewStateCollection(WorkCentreID='" + operatorsData.WorkCentre +"',Operator='" + sOperator +"',OrderNumber='" + operatorsData.ProductionOrder +"')";

			oDataModel.read(uri, 
			{
	        	success : function(oData, oResponse, aErrorResponse){
	        	    var aItems = listOperations.getItems();
					//This is to get always the first operation when loading BDRs
					var firstOperation = listOperations.getModel("Operations").getData().results[0].Operation;
					var firstOperationPlanNo = listOperations.getModel("Operations").getData().results[0].OperationPlanNo;
					var firstOperationCounter = listOperations.getModel("Operations").getData().results[0].OperationCounter;
					var firstOperationPath = firstOperationPlanNo +"',OperationCounter='" + firstOperationCounter +"',Operation='" + firstOperation + "')";
					var oOperatorsModel = sap.ui.getCore().getModel("Operators");
			        oOperatorsModel.setProperty("/Operators/" + (sOperator-1) + "/firstOperationPath", firstOperationPath);
					//End loading BDRs
					if(listOperations.getMode() !== "None" && oData.Operation !== "") //|| operatorsData.Operators[sOperator-1].Operation !== "")
					{
						for (var i = 0; i < aItems.length; i++) {
							if (listOperations.getModel("Operations").getData().results[i].Operation === oData.Operation) {
								listOperations.setSelectedItem(aItems[i], true);
								listOperations.getItems()[i].focus();
								that.showDetail(aItems[i]);
								that.getEventBus().publish("FocusDataCollection", "Focus");
								that.deletedOperations(aItems[i]);
								break;
							}
						}
						// var oSelectedItem = operatorsData.Operators[sOperator-1].Operation;
						// listOperations.setSelectedItem(oSelectedItem);
						// listOperations.getItems()[listOperations.getSelectedItem().sId.split("-").slice(-1)].focus();
						// this.showDetail(oSelectedItem);
					}
					else
					{
						that.selectFirstItem();
					}
	        	}, 
	        	error : function(e){
	        		if(this._busyDialog)
					{
						this._busyDialog.close();	
					}
	        		// if(e.statusCode == 404)
	        		// {
	        		// 	that.selectFirstItem();
	        		// }
	        		// else
	        		// {
	        			zmclaren.prd.util.messages.showErrorMessage(e);
	        		// }						
	        	}
	        });				
		}
	   	catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}		
	},
	
	// Check if Operation is deleted or not to disable tabs
	deletedOperations : function(oItem){
		// var pos = oEvent.getParameter("listItem").getId().split("-").slice(-1);
		// if(this.getView().getModel("Operations").getData().results[pos].Deleted)
		if(oItem.Deleted)
		{
			this.getEventBus().publish("DeletedOperations", "DisableTabs");	
		}
		else
		{
			this.getEventBus().publish("DeletedOperations", "EnableTabs");
		}
	},
	
	startTime : function() {
    	var countdowntime = this.checkTaktTime();
	   	var time = new Date();
		var hours = time.getHours();
		var min = time.getMinutes();
		var sec = time.getSeconds();
		var now = ((hours * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000));
		var cTime = now - countdowntime;
		var minutes = Math.floor(cTime / (1000 * 60));
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		var second = Math.floor((cTime % (1000 * 60)) / 1000);
		if (second < 10) {
			second = "0" + second;
		}
		if (minutes > 99) {
			var currTime = "99:00";
		} else {
			currTime = minutes + ":" + second;
		}
	    if (minutes < 28){
	     this.getView().byId("lblClock").addStyleClass("taktTime");	
	     this.getView().byId("lblClock").removeStyleClass("taktTimeAmber");
	     this.getView().byId("lblClock").removeStyleClass("taktTimeRed");
	    }
		else if (minutes >= 28 && minutes < 33) {
		 this.getView().byId("lblClock").addStyleClass("taktTimeAmber");
		 this.getView().byId("lblClock").removeStyleClass("taktTime");
	     this.getView().byId("lblClock").removeStyleClass("taktTimeRed");
		} else if (minutes >= 33) {
		 this.getView().byId("lblClock").addStyleClass("taktTimeRed");
		  this.getView().byId("lblClock").removeStyleClass("taktTime");
	     this.getView().byId("lblClock").removeStyleClass("taktTimeAmber");
		}
		// 	sap.ui.getCore().byId(oTimer.getId()).setText(currTime);
		this.getView().byId("lblClock").setText(currTime);
		var t = setTimeout(jQuery.proxy(this.startTime, this), 1000);
	  
	  /*  var today = new Date();
	    var h = today.getHours();
	    var m = today.getMinutes();
	    var s = today.getSeconds();
	    m = this.checkTime(m);
	    s = this.checkTime(s);
	    this.getView().byId("lblClock").setText(h + ":" + m + ":" + s);
	    var t = setTimeout(jQuery.proxy(this.startTime, this), 500);*/
	},
	checkTaktTime: function() {
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oOperatorsModel = sap.ui.getCore().getModel("Operators");
		var startTime;
		var oConfig = {
			metadataUrlParams: {},
			json: true,
			// loadMetadataAsync : true,
			defaultBindingMode: "TwoWay",
			defaultCountMode: "Inline",
			useBatch: false
		};
		this.oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, oConfig);
		var that = this;
		var uriTab = "/CheckTaktTimeSet(Werks='9000',Aufnr='" + oOperatorsModel.getData().ProductionOrder + "',Aplfl='" + oOperatorsModel.getData()
			.WorkCentre + "')";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";

		this.oDataModel.read(uriTab, {
			success: function(oData) {
				if (oData.Lastaccesstime.ms === 0) {
					var time = new Date();
					var hours = time.getHours();
					var min = time.getMinutes();
					var sec = time.getSeconds();
					var now = ((hours * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000));
					/*  var minutesLater = new Date();
                           var scs = minutesLater.setMinutes(minutesLater.getMinutes());
  //  console.log(scs);*/
					startTime = now;

				} else {
					startTime = oData.Lastaccesstime.ms;
				}
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
		return startTime;
	},
	checkTime : function(i){
		    if (i < 10) 
	    {
	    	i = "0" + i;
	    }// add zero in front of numbers < 10
	    return i;
	},
	
	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},
	
	onNavBack: function() {
		//TAKT TIME re-do//
		// var to = sap.ui.getCore().getModel("OpModel").getProperty("/timeout");  
		// clearTimeout(to);
		// document.removeEventListener("mousemove", $.proxy(this.onUserActionHandler, this));
		// document.removeEventListener("keypress", $.proxy(this.onUserActionHandler, this));
		// document.removeEventListener("touchstart", $.proxy(this.onUserActionHandler, this));
		/*global zmclaren*/
//		 zmclaren.prd.util.TaktClock.onRemoveActionHandler();
		this.getEventBus().publish("App","RemoveListener");
	    //TAKT TIME re-do //	
	   // clearTimeout(window.timeout);
		
		this.getEventBus().publish("DetailOperations", "UpdateOperatorStatus");
		this.getEventBus().publish("MasterOperations", "RefreshMaster");
		// window.history.go(-1);
		this._oRouter.navTo("app", {
			from: "masteroperations",
			plant: "9000", //Fixed for now but will change in the future
			workcentre: sap.ui.getCore().getModel("Operators").getData().WorkCentre
		});
		
	},

	onExit: function(oEvent) {
		var oEventBus = this.getEventBus();
		oEventBus.unsubscribe("DetailOperations", "TabChanged", this.onDetailTabChanged, this);
		oEventBus.unsubscribe("DetailOperations", "Changed", this.onDetailChanged, this);
		oEventBus.unsubscribe("DetailOperations", "NotFound", this.onNotFound, this);
		oEventBus.unsubscribe("ConfirmBDR", "BDRConfirmed", this.onBDRConfirmed, this);
		oEventBus.unsubscribe("ConfirmBDR", "BDRNotConfirmed", this.onBDRNotConfirmed, this);
		oEventBus.unsubscribe("Detail", "CheckBeforeLoadOperators", this.onBeforeLoad, this);
	}
});