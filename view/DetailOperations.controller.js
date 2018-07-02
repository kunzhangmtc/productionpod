jQuery.sap.require("zmclaren.prd.util.formatter");
jQuery.sap.require("zmclaren.prd.util.messages");
jQuery.sap.require("zmclaren.prd.util.TaktClock");

var bFlagBDR;
var bPulled;
var countdowntime;
window.timeout;
var catLength;
var oTimer;
var x;

sap.ui.core.mvc.Controller.extend("zmclaren.prd.view.DetailOperations", {
//TAKT Time re-do//
	_oTimeDialog: null,
//TAKT Time re-do//
	oIssueLogModel: new sap.ui.model.json.JSONModel(),
	oIssueCategoryModel: new sap.ui.model.json.JSONModel(),
	oIssueSubCatModel: new sap.ui.model.json.JSONModel(),
	oOperationsBDRModel: new sap.ui.model.json.JSONModel(),
	oIssueMatnrModel: new sap.ui.model.json.JSONModel(),
	oIssueResModel: new sap.ui.model.json.JSONModel(),
	bOperatorSignOff: false,
	bAllOperatorsSignOff: false,
	bDataCollectionLoaded: false,
	addColumnId: "addLineItem",
	// 	bBDRLoaded: false,
	


	onInit: function() {
		bFlagBDR = true;
		//	bChangeOps = false;
		this._oView = this.getView();
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
		this._oRouter = this._oComponent.getRouter();

		//Check Number of operators
		// this.checkOperatorButtons();
       //TAKT Time re-do//
		var oOpModel = null;
		if (sap.ui.getCore().getModel("OpModel")) {
			oOpModel = sap.ui.getCore().getModel("OpModel");
		} else {
			oOpModel = new sap.ui.model.json.JSONModel({
				timeout: {}
			});
			sap.ui.getCore().setModel(oOpModel, "OpModel");
		}
		//TAKT Time re-do//
		//Bind Operator Buttons
		var oOperatorsModel = sap.ui.getCore().getModel("Operators");
		this._oView.setModel(oOperatorsModel, "Operators");

		this.openBusyDialog();

		//On phone devices
		if (sap.ui.Device.system.phone) {
			this.onMobile();
		}

		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		var oEventBus = this.getEventBus();
		oEventBus.subscribe("Detail", "CheckBeforeLoadOperators", this.onBeforeLoad, this);
		oEventBus.subscribe("FocusDataCollection", "Focus", this.onICTSelect, this);
		oEventBus.subscribe("DetailOperations", "UpdateOperatorStatus", this.checkOperatorsTable, this);
		oEventBus.subscribe("DeletedOperations", "DisableTabs", this.disableTabs, this);
		oEventBus.subscribe("DeletedOperations", "EnableTabs", this.enableTabs, this);
		oEventBus.subscribe("DetailsOperations", "SetTimeout", this.onSetTimeout, this);
//TAKT Time re-do//
		oEventBus.subscribe("DetailOperations","RemoveListener",this.onRemoveActionHandler,this);
		oEventBus.subscribe("DetailOperations","CheckTaktTime",this.checkTaktTime(),this);
//TAKT Time re-do//
		if (sap.ui.Device.system.phone) {
			//Do not wait for the master when in mobile phone resolution
			this.oInitialLoadFinishedDeferred.resolve();
		} else {
			this._oView.setBusy(true);
			oEventBus.subscribe("Component", "MetadataFailed", this.onMetadataFailed, this);
			oEventBus.subscribe("MasterOperations", "InitialLoadFinished", this.onMasterLoaded, this);
		}

		this.getRouter().attachRouteMatched(this.onRouteMatched, this);

		//	var oOperatorsModel = this.getView().getModel("Operators");
		var workcentre = oOperatorsModel.getData().WorkCentre;
		this.checkWorkcentre(workcentre);

		this.getView().byId("btnSaveIssue").setEnabled(false);
		countdowntime = this.checkTaktTime();
//		this.timer();
	},

	// On Mobile devices
	onMobile: function() {
		this.getView().byId("idBtnOperator1").setText("1");
		this.getView().byId("idBtnOperator2").setText("2");
		this.getView().byId("idBtnOperator3").setText("3");
		this.getView().byId("idBtnOperator4").setText("4");
		this.getView().byId("idLblProdOrderDetailOperations").setVisible(false);
		this.getView().byId("idLogoDetailOperations").setVisible(false);
	},

	onAfterRendering: function() {
		// 	$("#prodOrdersShell").removeClass("sapMShellAppWidthLimited");
		// var that = this;
	 // 	var detailContent = this.getView().byId("mouseDetailOperations");
	 // 	var event;
  //  /*	detailContent.attachBrowserEvent("mousemove", function(event){
  //  	//	timeout = 120000;
  //  		clearTimeout(window.timeout);
  //      // var that = this;
  //         that.onSetTimeout();
  //      //	that.onIssuesTab();
  //  	});*/
  //  //TAKT Time re-do//
		// this.onSetTimeout();
		// document.addEventListener("mousemove", $.proxy(this.onUserActionHandler, this));
		// document.addEventListener("keypress", $.proxy(this.onUserActionHandler, this));
		// document.addEventListener("touchstart", $.proxy(this.onUserActionHandler, this));
		// /*detailContent.attachBrowserEvent("mousemove", $.proxy(this.onUserActionHandler, this));
		// detailContent.attachBrowserEvent("keypress", $.proxy(this.onUserActionHandler, this));
		// detailContent.attachBrowserEvent("touchstart", $.proxy(this.onUserActionHandler, this));*/
//	  zmclaren.prd.util.TaktClock.onEvent();
	//TAKT Time re-do//
	},
	//TAKT Time re-do//
  /*  onRemoveActionHandler:function(){
    	var to = sap.ui.getCore().getModel("OpModel").getProperty("/timeout");  
		clearTimeout(to);
//		var detailContent = this.getView().byId("mouseDetailOperations");
//		this.detachEvent(event);
	//	document.getElementById("mouseDetailOperations").removeEventListener("mousemove", $.proxy(this.onUserActionHandler, this));
      	document.removeEventListener("mousemove", $.proxy(this.onUserActionHandler, this));
		document.removeEventListener("keypress", $.proxy(this.onUserActionHandler, this));
		document.removeEventListener("touchstart", $.proxy(this.onUserActionHandler, this));	
    },
	onUserActionHandler: function() {
		var to = sap.ui.getCore().getModel("OpModel").getProperty("/timeout");
		if (to !== undefined && to !== null) {
			clearTimeout(to);
		}
		this.onSetTimeout();
	},*/
	//TAKT Time re-do//

	 onSetTimeout: function(sEvent) {
//		  zmclaren.prd.util.TaktClock.onUserActionHandler();
	 },

	onMasterLoaded: function(sChannel, sEvent) {
		this._oView.setBusy(false);
		this.oInitialLoadFinishedDeferred.resolve();

		// if (!this._busyDialog) {
		// 	this._busyDialog = sap.ui.xmlfragment("zmclaren.prd.view.busyDialog", this);
		// 	this.getView().addDependent(this._busyDialog);
		// }
		// // open busy dialog
		// // this._busyDialog.open();
		// Set the size of ScrollContainer
		this.setIconTabBarHeight();
	},

	onMetadataFailed: function() {
		this._oView.setBusy(false);
		this.oInitialLoadFinishedDeferred.resolve();
		this.showEmptyView();
	},

	// Checks Before Load
	onBeforeLoad: function() {
		bFlagBDR = true;
		/*	prevProdOrd = oOperatorsModel.getData().ProductionOrder;*/
		// this.checkAllSignOff(1,true);
		// create value confirm dialog
	},

	//Operators Buttons change
	onOperatorChange: function(oEvent) {
		try {
			// Save Position for the operator - Operation / Tab
			var operatorsData = this.getView().getModel("Operators").getData();
			if (this.getSelectedOperator() !== undefined) {
				// operatorsData.Operators[this.getSelectedOperator()-1].Tab = this.getView().byId("iconTabBarOperations").getSelectedKey();	
				this.checkOperatorsTable();
			}
			this.checkAllSignOff(oEvent.getSource().getId().slice(-1), false);
			this.buttonsChange(oEvent.getSource().getId().slice(-1));
		} catch (oError) {
			
			/*global zmclaren */
			zmclaren.util.messages.showErrorMessage(oError);
		}
	},
	checkTaktTime: function() {
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oOperatorsModel = this.getView().getModel("Operators");
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
	checkWorkcentre: function(workcentre) {
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
		var that = this;
		var uriTab = "IssWorkCentreSet('" + workcentre + "')";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";

		this.oDataModel.read(uriTab, {
			success: function(oData) {
				if (oData.DispIssues === 'X') {
					that.getView().byId("idITBIssues").setVisible(true);
					that.displayIssMatnr();
					that.loadIssueTable();
					that.enableDisableIssues(workcentre, bPulled);
				} else {
					that.getView().byId("idITBIssues").setVisible(false);
					that.getView().byId("btnMoveCar").setVisible(false);
					that.getView().byId("btnPullCar").setVisible(false);
				}
				//	sap.m.MessageToast.show("Success!");
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});

	},
	onTimeOut: function() {
// 	/*	 var oDialog = new sap.m.Dialog({ contentWidth : "1000px", contentHeight : "1000px"});
// //     if(!oDialog.isOpen()){
// 	 oDialog.setTitle("TAKT TIME");	
// 	 oTimer = new sap.m.Label({width:"950px", height:"875px"});
// 	 oTimer.addStyleClass("taktTime");
// //	 var time = sap.ui.getCore().byId("idLTaktTime");
// 	 var that = this;
	 
// 	/* setTimeout(function(){
// 	    currTime = that.timer();
//         oTimer.setText(currTime);
// 	 },60000);*/
// 	setInterval(function(){
// 	 	var currTime = that.timer();
// 	 	var time = currTime.split(":");
// 	 	var min = time[0];
// 	 	if (min>=28 && min<33){
// 	 		oTimer.addStyleClass("taktTimeAmber");
// 	 	}else if(min>=33){
// 	 		oTimer.addStyleClass("taktTimeRed");
// 	 	}
// 	 	sap.ui.getCore().byId(oTimer.getId()).setText(currTime);
// 	 }, 1000);
// //	 currTime = this.timer();
// 	 oDialog.addContent(oTimer);
// 	 var oButtonClose = new sap.m.Button({
// 	 	text: "Close",
// 	 	press :function (){
// 	 		oDialog.destroy();
// 	 	//	clearTimeout();
// 	    //	that.onIssuesTab();
// 	 	}
// 	 });
// 	 oDialog.setEndButton(oButtonClose);
// 	 oDialog.open();*/
		
	 // TAKT TIME re-do //
		//var oDialog = new sap.m.Dialog({ contentWidth : "1000px", contentHeight : "1000px"});
	/*	var to = sap.ui.getCore().getModel("OpModel").getProperty("/timeout");
		clearTimeout(to);
		var oDialog;
		if (this._oTimeDialog !== null) {
			oDialog = this._oTimeDialog;
		} else {
			this._oTimeDialog = new sap.m.Dialog({
				contentWidth: "1000px",
				contentHeight: "1000px"
			});
			oDialog = this._oTimeDialog;

			//     if(!oDialog.isOpen()){
			oDialog.setTitle("TAKT TIME");
			oTimer = new sap.m.Label({
				width: "950px",
				height: "875px"
			});
			oTimer.addStyleClass("taktTime");*/
			//	 var time = sap.ui.getCore().byId("idLTaktTime");
			var that = this;
			setInterval(function() {
				var currTime = that.timer();
				var time = currTime.split(":");
				var min = time[0];
				if (min >= 28 && min < 33) {
					oTimer.addStyleClass("taktTimeAmber");
				} else if (min >= 33) {
					oTimer.addStyleClass("taktTimeRed");
				}
				 
			}, 1000);
			//	 currTime = this.timer();
		/*	oDialog.addContent(oTimer);
			var oButtonClose = new sap.m.Button({
				text: "Close",
				press: $.proxy(function() {
					oDialog.destroy();
					this._oTimeDialog = null;
					// re-register user action event listener

					//	clearTimeout();
					//	that.onIssuesTab();
				},this)
			});
			oDialog.setEndButton(oButtonClose);

			oDialog.open();
			}*/
		

		
		// remove user action event listener
       //    this._removeActionHandler();
		//	 this.onIssuesTab();
		//   }
			 // TAKT TIME re-do //
	},
	timer: function() {
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
		// 	sap.ui.getCore().byId(oTimer.getId()).setText(currTime);
        this.getView().byId("lblTaktClock").setText(currTime);
        var t = setTimeout(jQuery.proxy(this.timer, this), 500);
	//	return currTime;
	},
	onRefreshIssue: function() {
		var oOperatorsModel = this.getView().getModel("Operators");
		this.loadIssueTable();
		this.enableDisableIssues(oOperatorsModel.getData().WorkCentre, bPulled);
	},
	enableDisablePulledCar: function() {
		var oIssLog = this.oIssueLogModel;
		var issTabLength = oIssLog.getData().results.length;
		for (var i = 0; i < issTabLength; i++) {
			//		var status = oIssLog.getData().results[i].Status;
			//		var issWorkCntr = oIssLog.getData().results[i].Aplfl;
			var oTable = this.getView().byId("idIssueLog");
			var rows = oTable.mAggregations.items;
			var items = rows[i].mAggregations.cells[7];
			var close_iss = items.mAggregations.items[0].getIdForLabel();
			var move_iss = items.mAggregations.items[2].getIdForLabel();
			sap.ui.getCore().byId(close_iss).setVisible(false);
			sap.ui.getCore().byId(move_iss).setVisible(false);
			this.getView().byId("btnPullCar").setEnabled(false);
			this.getView().byId("idCIssCat").setEnabled(false);
			this.getView().byId("idSIssSubCat").setEnabled(false);
			this.getView().byId("idSIssCat03").setEnabled(false);
			this.getView().byId("idCIssMat").setEnabled(false);
			this.getView().byId("idTAIssReason").setEnabled(false);
			this.getView().byId("btnSaveIssue").setEnabled(false);
			this.getView().byId("btnMoveCar").setEnabled(false);
		}
	},
	enableDisableIssues: function(workcentre, bPulled) {
		var bMoveFlag = false;
		this.getView().byId("btnPullCar").setEnabled(true);
		this.getView().byId("idCIssCat").setEnabled(true);
		this.getView().byId("idSIssSubCat").setEnabled(true);
		this.getView().byId("idSIssCat03").setEnabled(true);
		this.getView().byId("idCIssMat").setEnabled(true);
		this.getView().byId("idTAIssReason").setEnabled(true);
		// this.getView().byId("btnSaveIssue").setEnabled();
		//    this.getView().byId("btnMoveCar").setEnabled(true);
		this.getView().byId("idCIssCat").setSelectedKey(null);
		this.getView().byId("idSIssSubCat").setSelectedKey(null);
		this.getView().byId("idSIssCat03").setSelectedKey(null);
		this.getView().byId("idCIssMat").setSelectedKey(null);
		this.getView().byId("idTAIssReason").setValue(null);
		var oIssLog = this.oIssueLogModel;
		var issTabLength = oIssLog.getData().results.length;
		for (var i = 0; i < issTabLength; i++) {
			var status = oIssLog.getData().results[i].Status;
			var issWorkCntr = oIssLog.getData().results[i].Aplfl;
			var oTable = this.getView().byId("idIssueLog");
			var rows = oTable.mAggregations.items;
			var items = rows[i].mAggregations.cells[7];
			if (status === "MOVE_CAR") {
				var close_iss = items.mAggregations.items[0].getIdForLabel();
				var move_iss = items.mAggregations.items[2].getIdForLabel();
				if (issWorkCntr === workcentre) {
					sap.ui.getCore().byId(close_iss).setVisible(false);
				}
				sap.ui.getCore().byId(move_iss).setVisible(false);
				this.getView().byId("btnMoveCar").setEnabled(false);
			} else if (status === "MOVE_ISS") {
				move_iss = items.mAggregations.items[2].getIdForLabel();
				sap.ui.getCore().byId(move_iss).setVisible(false);
			} else if (status === "OPEN") {
				bMoveFlag = true;
			}
			//	}
		}
		if (bMoveFlag) {
			this.getView().byId("btnMoveCar").setEnabled(true);
			this.getView().byId("btnPullCar").setEnabled(true);
		} else {
			this.getView().byId("btnMoveCar").setEnabled(false);
			//		this.getView().byId("btnPullCar").setEnabled(false);
		}

	},
	displayIssMatnr: function() {
		this.getView().byId("idCIssMat").setModel(this.oIssueMatnrModel);
		this.oIssueMatnrModel.setSizeLimit(600);
		var oItemSelectTemplate = new sap.ui.core.Item({
			key: "{Matnr}",
			text: "{Matnr} : " + "{Potx1}"
		});
		this._oView.byId("idCIssMat").bindAggregation("items", "/results", oItemSelectTemplate);
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
		var that = this;
		var oOperatorsModel = this.getView().getModel("Operators");
		var uri = "IssueMaterialSet?$filter=Arbpl eq '" + oOperatorsModel.getData().WorkCentre + "' and Aufnr eq '" + oOperatorsModel.getData()
			.ProductionOrder + "'";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";

		this.oDataModel.read(uri, {
			success: function(oData) {
				that.oIssueMatnrModel.setData(oData);
				//		sap.m.MessageToast.show("Success!");
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
	},
	onPullCar: function(oEvent) {
		var oDialog = new sap.m.Dialog({
			contentWidth: "400px"
		});
		oDialog.setTitle("Pull Car");
		var oManagerName = new sap.m.Label({
			text: "Swipe your card"
		});
		var that = this;
		var userid;
		var oManagerInput = new sap.m.Input({
			id: "idPullCarManager",
			placeholder: "Swipe your Card",
			change: function(oEvent1) {
				if (oEvent1.getSource().getValue().length < 10) {
					oEvent1.getSource().setValueState("Error");
					oEvent1.getSource().setValueStateText("Valid authorising person required");
					oEvent1.getSource().focus();
				}
			},
			liveChange: function(oEvent2) {
				if (oEvent2.getSource().getValue().length === 10) {
					oEvent2.getSource().setValueState("None");
					oEvent2.getSource().setValueStateText("");
					userid = that.checkPullCar(oEvent2);
					if (sap.ui.getCore().byId("idPullCarManager").getValue() !== "NOT AUTHORISED") {
						sap.ui.getCore().byId("idBPullCarOk").setEnabled(true);
					}
				} else if (oEvent2.getSource().getValue().length === 0) {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText("Please fill the Operator!");
					oEvent.getSource().focus();
				}
			}
		});
		var oSimpleForm = new sap.ui.layout.form.SimpleForm({
			maxContainerCols: 3,
			editable: false,
			labelMinWidth: 30,
			content: [oManagerName,
				oManagerInput
			]
		});
		oDialog.addContent(oSimpleForm);

		var oButtonOk = new sap.m.Button({
			id: "idBPullCarOk",
			text: "Ok",
			press: function() {
				if (sap.ui.getCore().byId("idPullCarManager").getValue() !== "NOT AUTHORISED") {
					that.pullCar(userid);
					oDialog.destroy();
				}
			}
		});
		sap.ui.getCore().byId("idBPullCarOk").setEnabled(false);
		oDialog.setBeginButton(oButtonOk);
		var oButtonClose = new sap.m.Button({
			text: "Cancel",
			press: function() {
				oDialog.destroy();
				sap.m.MessageToast.show("Car has not been pulled");
			}
		});
		oDialog.setEndButton(oButtonClose);
		oDialog.open();

	},
	pullCar: function(userid) {
		var oOperatorsModel = this.getView().getModel("Operators");
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
			defaultBindingMode: "OneWay",
			useBatch: false,
			defaultCountMode: "Inline",
			loadMetadataAsync: false,
			defaultUpdateMethod: "PUT",
			json: false
		});

		var data = {
			"Pull": "1",
			"Aufnr": oOperatorsModel.getData().ProductionOrder,
			"Werks": "9000",
			"Aplfl": oOperatorsModel.getData().WorkCentre,
			"CrUser": userid
				// sap.ui.getCore().getModel("Operators").getData().Operators[listBDR.getSelectedItem().getBindingContext().getProperty("Operator")-1].UName
		};
		var uri = "/PulledCarSet(Pull='0000000001',Aufnr='" + oOperatorsModel.getData().ProductionOrder + "',Aplfl='" + oOperatorsModel.getData()
			.WorkCentre + "')";
		var that = this;
		oDataModel.update(uri, data, {
			success: function(oData, oResponse, aErrorResponse) {
				sap.m.MessageToast.show("Pulled Car!");
				that.enableDisablePulledCar();
				//	bPulled = true;
				//    that.enableDisableIssues(oOperatorsModel.getData().WorkCentre,bPulled);
			},
			error: function(e) {
				zmclaren.prd.util.messages.showErrorMessage(e);
			}
		});
	},
	checkPullCar: function(oEvent) {
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oConfig = {
			metadataUrlParams: {},
			json: true,
			// loadMetadataAsync : true,
			defaultBindingMode: "TwoWay",
			defaultCountMode: "Inline",
			useBatch: false
		};
		var userid;
		this.oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, oConfig);
		var uri = "IssueAuthSet(Auth='PULL',Category01=' ',Category02=' ',Category03=' ',AuthGroup='" + sap.ui.getCore().byId(
			"idPullCarManager").getValue() + "')";
		this.oDataModel.read(uri, {
			success: function(oData) {
				if (oData.AuthGroup !== "NOT AUTHORISED") {
					var user = oData.AuthGroup;
					var userVal = user.split(";");
					userid = userVal[0];
					var userName = userVal[1];
					sap.ui.getCore().byId("idPullCarManager").setValue(userName);
				} else {
					sap.ui.getCore().byId("idPullCarManager").setValue(oData.AuthGroup);
				}
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
		return userid;
	},
	onSelectIssCat: function(oEvent) {
		this.getView().byId("btnSaveIssue").setEnabled(true);
		this.getView().byId("idSIssSubCat").setSelectedKey(null);
		this.getView().byId("idSIssCat03").setSelectedKey(null);
		this.getView().byId("idCIssMat").setSelectedKey(null);
		//	this.getView.byId("idTAIssReason").setValue(null);
		this.getView().byId("idSIssSubCat").setModel(this.oIssueCategoryModel);

		var oItemSelectTemplate = new sap.ui.core.Item({
			key: "{ProdCategory}:" + "{Subcategory}",
			text: "{Description}"
		});
		this._oView.byId("idSIssSubCat").bindAggregation("items", "/results", oItemSelectTemplate);

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
		var that = this;
		var uri = "/IssueSubCategorySet?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";

		this.oDataModel.read(uri, {
			success: function(oData) {
				that.oIssueCategoryModel.setData(oData);
				//		sap.m.MessageToast.show("Success!");
				that.getView().byId("idTAIssReason").setValue(null);
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});

	},
	onSelectIssCat03: function(oEvent) {
		this.getView().byId("idSIssCat03").setValueState("None");
		this.getView().byId("idSIssCat03").setValueStateText("");
	},
	onSelectIssMat: function(oEvent) {
		this.getView().byId("idCIssCat").setValueState("None");
		this.getView().byId("idCIssCat").setValueStateText("");
	},
	onSelectIssSubcat: function(oEvent) {
		this.getView().byId("idSIssCat03").setSelectedKey(null);
		this.getView().byId("idCIssMat").setSelectedKey(null);
		//	this.getView().byId("idTAIssReason").setText(null);
		this.getView().byId("idSIssCat03").setModel(this.oIssueSubCatModel);
		this.getView().byId("idSIssSubCat").setValueState("None");
		this.getView().byId("idSIssSubCat").setValueStateText("");

		var oItemSelectTemplate = new sap.ui.core.Item({
			key: "{Category03}",
			text: "{Description}"
		});
		this._oView.byId("idSIssCat03").bindAggregation("items", "/results", oItemSelectTemplate);

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
		var that = this;
		var category = oEvent.getSource().getSelectedItem().getKey().split(":");
		var issCat = category[0];
		var subCat = category[1];
		var uri = "/IssueCategory3Set?$filter=ProdCategory eq '" + issCat + "' and Subcategory eq '" + subCat + "'";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";

		this.oDataModel.read(uri, {
			success: function(oData) {
				that.oIssueSubCatModel.setData(oData);
				that.getView().byId("idTAIssReason").setValue(null);
				//		sap.m.MessageToast.show("Success!");
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
		catLength = this.oIssueSubCatModel.getData().results.length;
	},
	onSaveFault: function() {
		if (this.getView().byId("idSIssSubCat").getSelectedKey() === "") {
			this.getView().byId("idSIssSubCat").setValueState("Error");
			this.getView().byId("idSIssSubCat").setValueStateText("Please Speicfy Issue");
			this.getView().byId("idSIssSubCat").focus();
		} else if (this.getView().byId("idCIssCat").getSelectedKey() === "") {
			this.getView().byId("idCIssCat").setValueState("Error");
			this.getView().byId("idCIssCat").setValueStateText("Please Speicfy 4M's");
			this.getView().byId("idCIssCat").focus();
		} else if (catLength > 0 && this.getView().byId("idSIssCat03").getSelectedKey() === "") {
			this.getView().byId("idSIssCat03").setValueState("Error");
			this.getView().byId("idSIssCat03").setValueStateText("Please Speicfy Category");
			this.getView().byId("idSIssCat03").focus();
		} else if (this.getView().byId("idCIssCat").getSelectedKey() === "MAT" && this.getView().byId("idCIssMat").getSelectedKey() === "") {
			this.getView().byId("idCIssCat").setValueState("Error");
			this.getView().byId("idCIssCat").setValueStateText("Please Speicfy Material");
			this.getView().byId("idCIssCat").focus();
		} else {
			this.openBusyDialog();
			var oOperatorsModel = this.getView().getModel("Operators");
			//	  var listBDR = this._oView.byId("operationsBDR");
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false,
				defaultUpdateMethod: "PUT",
				json: false
			});

			var category = this.getView().byId("idSIssSubCat").getSelectedKey().split(":");
			var issCat = category[0];
			var subCat = category[1];
			if (this.getView().byId("idCIssMat").getValue() !== "") {
				var matDesc = this.getView().byId("idCIssMat").getValue();
				var matnrSplit = matDesc.split(":");
				var maktx = matnrSplit[1];
				if (maktx !== "") {
					var length = maktx.length;
					if (maktx.indexOf(" ") === 0) {
						maktx = maktx.substring(1, length);
					}
				}
				var matnr = matnrSplit[0];
			}
			var data = {
				"Issue": "1",
				"Aufnr": oOperatorsModel.getData().ProductionOrder,
				"Category01": this.getView().byId("idCIssCat").getSelectedKey(),
				"Category02": subCat,
				"Category03": this.getView().byId("idSIssCat03").getSelectedKey(),
				"Werks": "9000",
				"Aplfl": oOperatorsModel.getData().WorkCentre,
				"Matnr": matnr,
				"Maktx": maktx,
				"Text": this.getView().byId("idTAIssReason").getValue(),
				//	  "Pulled" : pulled,
				"Status": "OPEN"
					// sap.ui.getCore().getModel("Operators").getData().Operators[listBDR.getSelectedItem().getBindingContext().getProperty("Operator")-1].UName
			};

			var uri = "/IssueCaptureSet('0000000001')";
			var that = this;
			oDataModel.update(uri, data, {
				success: function(oData, oResponse, aErrorResponse) {
					sap.m.MessageToast.show("Issue created!");
					that.loadIssueTable();
					that.enableDisableIssues(oOperatorsModel.getData().Workcentre, bPulled);
					if (!that.getView().byId("btnMoveCar").getEnabled()) {
						that.getView().byId("btnMoveCar").setEnabled(true);
					}
					that.getView().byId("idCIssCat").setSelectedKey(null);
					that.getView().byId("idSIssSubCat").setSelectedKey(null);
					that.getView().byId("idSIssCat03").setSelectedKey(null);
					that.getView().byId("idCIssMat").setSelectedKey(null);
					that.getView().byId("idTAIssReason").setValue(null);
					that.getView().byId("btnSaveIssue").setEnabled(false);
					that._busyDialog.close();
				},
				error: function(e) {
					zmclaren.util.messages.showErrorMessage(e);
				}
			});

		}
	},
	loadIssueTable: function() {
		var oOperatorsModel = this.getView().getModel("Operators");
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oTable = this.getView().byId("idIssueLog");
		this.oIssueLogModel.destroy();
		oTable.destroyItems();
		oTable.setModel(this.oIssueLogModel);
		var that = this;
		var oItemSelectTemplate = new sap.m.ColumnListItem({
			cells: [
				new sap.m.Text({
					text: "{Issue}"
				}),
				new sap.m.Text({
					text: "{Aplfl}"
				}),
				new sap.m.Text({
					text: "{Category01}"
				}),
				new sap.m.Text({
					text: "{Category02}"
				}),
				new sap.m.Text({
					text: "{Category03}"
				}),
				new sap.m.Text({
					text: "{Matnr}"
				}),
				new sap.m.Text({
					text: "{Maktx}"
				}),
				new sap.m.HBox({
					items: [
						new sap.ui.core.Icon({
							src: "sap-icon://decline",
							tooltip: "Close Issue",
							press: function(oEvent) {
								that.onCloseFault(oEvent);
							}
						}),
						new sap.m.Text({
							width: "25px"
						}),
						new sap.ui.core.Icon({
							src: "sap-icon://begin",
							tooltip: "Move Issue",
							press: function(oEvent) {
								that.onMoveIssue(oEvent);
							}
						})
					]
				})
			]
		});
		this._oView.byId("idIssueLog").bindAggregation("items", "/results", oItemSelectTemplate);
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
		var uriTab = "/IssueCaptureSet?$filter=Aufnr eq '" + oOperatorsModel.getData().ProductionOrder + "' and Aplfl eq '" + oOperatorsModel.getData()
			.WorkCentre + "'";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";

		this.oDataModel.read(uriTab, {
			success: function(oData) {
				that.oIssueLogModel.setData(oData);
				//	sap.m.MessageToast.show("Success!");
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
		this.oIssueLogModel.updateBindings();

	},
	onCloseFault: function(oEvent) {
		var oRow = oEvent.getSource().getParent().getParent();
		var issueNum = oRow.getCells()[0].getText();
		var cat01 = oRow.getCells()[2].getText();
		var cat02 = oRow.getCells()[3].getText();
		var cat03 = oRow.getCells()[4].getText();
		var matnr = oRow.getCells()[5].getText();
		var text = oRow.getCells()[6].getText();
		var userid;

		/*var oRow = oItem.getParent();
		var oIndex = oRow.indexOfItem(oItem);*/
		var oDialog = new sap.m.Dialog({
			contentWidth: "500px"
		});
		oDialog.setTitle("Close Issue");
		var that = this;
		var oManagerName = new sap.m.Label({
			text: "Swipe your card"
		});
		var oManagerInput = new sap.m.Input({
			id: "idCloseMangr",
			placeholder: "Swipe your Card",
			change: function(oEvent1) {
				if (oEvent1.getSource().getValue().length < 10) {
					oEvent1.getSource().setValueState("Error");
					oEvent1.getSource().setValueStateText("Valid authorising person required");
					oEvent1.getSource().focus();
				}
			},
			liveChange: function(oEvent2) {
				if (oEvent2.getSource().getValue().length === 10) {
					oEvent2.getSource().setValueState("None");
					oEvent2.getSource().setValueStateText("");
					userid = that.checkCloseManager(cat01, cat02, cat03);
					if (sap.ui.getCore().byId("idCloseMangr").getValue() !== "NOT AUTHORISED") {
						sap.ui.getCore().byId("idLResCode").setVisible(true);
						sap.ui.getCore().byId("idSResCode").setVisible(true);
						sap.ui.getCore().byId("idLResText").setVisible(true);
						sap.ui.getCore().byId("idTAResText").setVisible(true);
						sap.ui.getCore().byId("idBCloseOk").setEnabled(true);
						that.resolutionCode(cat01, cat02, cat03);
					}
				} else if (oEvent2.getSource().getValue().length === 0) {
					oEvent2.getSource().setValueState("Error");
					oEvent2.getSource().setValueStateText("Valid authorising person required");
					oEvent2.getSource().focus();
				}
			}
		});
		var oReslCode = new sap.m.Label({
			id: "idLResCode",
			text: "Resolution Code"
		});
		var oReslCodeVal = new sap.m.ComboBox({
			id: "idSResCode",
			placeholder: "Select Resolution Code",
			width: "275px",
			selectionChange: function(oEvent) {
				sap.ui.getCore().byId("idSResCode").setValueState("None");
				sap.ui.getCore().byId("idSResCode").setValueStateText("");
			},
			items: new sap.ui.core.Item({
				key: "{ResCode}",
				text: "{Description}"
			})
		});
		var oReslText = new sap.m.Label({
			id: "idLResText",
			text: "Resolution Text"
		});
		var oReslTextVal = new sap.m.TextArea({
			id: "idTAResText"
		});
		sap.ui.getCore().byId("idLResCode").setVisible(false);
		sap.ui.getCore().byId("idSResCode").setVisible(false);
		sap.ui.getCore().byId("idLResText").setVisible(false);
		sap.ui.getCore().byId("idTAResText").setVisible(false);
		var oSimpleForm = new sap.ui.layout.form.SimpleForm({
			maxContainerCols: 3,
			editable: false,
			labelMinWidth: 30,
			content: [oManagerName,
				oManagerInput,
				oReslCode,
				oReslCodeVal,
				oReslText,
				oReslTextVal
			]
		});
		oDialog.addContent(oSimpleForm);

		var oButtonOk = new sap.m.Button({
			id: "idBCloseOk",
			text: "Ok",
			press: function() {
				if (sap.ui.getCore().byId("idCloseMangr").getValue() !== "NOT AUTHORISED") {
					var bSuccRes = that.closeIssue(issueNum, cat01, cat02, cat03, matnr, text, userid);
				}
				//	if(bSuccRes){
				oDialog.destroy();
				//	}
			}
		});
		sap.ui.getCore().byId("idBCloseOk").setEnabled(false);
		oDialog.setBeginButton(oButtonOk);
		var oButtonClose = new sap.m.Button({
			text: "Cancel",
			press: function() {
				oDialog.destroy();
				sap.m.MessageToast.show("Issue has not been resolved");
			}
		});
		oDialog.setEndButton(oButtonClose);
		oDialog.open();
	},
	resolutionCode: function(cat01, cat02, cat03) {

		sap.ui.getCore().byId("idSResCode").setModel(this.oIssueResModel);

		var oItemSelectTemplate = new sap.ui.core.Item({
			key: "{ResCode}",
			text: "{Description}"
		});
		sap.ui.getCore().byId("idSResCode").bindAggregation("items", "/results", oItemSelectTemplate);

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
		var that = this;
		var uri = "/IssResolutionSet?$filter=Category01 eq '" + cat01 + "' and Category02 eq '" + cat02 + "' and Category03 eq '" + cat03 +
			"'";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";

		this.oDataModel.read(uri, {
			success: function(oData) {
				that.oIssueResModel.setData(oData);
				//		sap.m.MessageToast.show("Success!");
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});

	},
	closeIssue: function(issueNum, cat01, cat02, cat03, matnr, text, userid) {
		var bSuccRes = false;
		if (sap.ui.getCore().byId("idSResCode").getSelectedKey() === "") {
			sap.ui.getCore().byId("idSResCode").setValueState("Error");
			sap.ui.getCore().byId("idSResCode").setValueStateText("Please Speicfy Resolution Code");
			sap.ui.getCore().byId("idSResCode").focus();
		} else {
			var oOperatorsModel = this.getView().getModel("Operators");
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false,
				defaultUpdateMethod: "PUT",
				json: false
			});

			var data = {
				"Issue": issueNum,
				"Aufnr": oOperatorsModel.getData().ProductionOrder,
				"Category01": cat01,
				"Category02": cat02,
				"Category03": cat03,
				"Werks": "9000",
				"Aplfl": oOperatorsModel.getData().WorkCentre,
				"Matnr": matnr,
				"Text": text,
				"Status": "RESL_POD",
				"ResUser": userid,
				"ResCode": sap.ui.getCore().byId("idSResCode").getSelectedKey(),
				"ResText": sap.ui.getCore().byId("idTAResText").getValue()

			};
			var that = this;
			var uri = "/IssueCaptureSet('" + issueNum + "')";
			oDataModel.update(uri, data, {
				success: function(oData, oResponse, aErrorResponse) {

					sap.m.MessageToast.show("Issue resolved!");
					that.loadIssueTable();
					that.enableDisableIssues(oOperatorsModel.getData().WorkCentre, bPulled);
					bSuccRes = true;
				},
				error: function(e) {
					zmclaren.prd.util.messages.showErrorMessage(e);
				}
			});
		}
		return bSuccRes;
	},
	checkCloseManager: function(cat01, cat02, cat03) {

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
		//	    var that = this;

		var uri = "/IssueAuthSet(Auth='RESL_POD',Category01='" + cat01 +
			"',Category02='" + cat02 +
			"',Category03='" + cat03 +
			"',AuthGroup='" + sap.ui.getCore().byId("idCloseMangr").getValue() + "')";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";
		var userid;
		this.oDataModel.read(uri, {
			success: function(oData) {
				if (oData.AuthGroup !== "NOT AUTHORISED") {
					var user = oData.AuthGroup;
					var userVal = user.split(";");
					userid = userVal[0];
					var userName = userVal[1];
					sap.ui.getCore().byId("idCloseMangr").setValue(userName);
				} else {
					sap.ui.getCore().byId("idCloseMangr").setValue(oData.AuthGroup);
				}
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
		return userid;
	},
	onMoveIssue: function(oEvent) {
		var oRow = oEvent.getSource().getParent().getParent();
		var issueNum = oRow.getCells()[0].getText();
		var cat01 = oRow.getCells()[2].getText();
		var cat02 = oRow.getCells()[3].getText();
		var cat03 = oRow.getCells()[4].getText();
		var matnr = oRow.getCells()[5].getText();
		var text = oRow.getCells()[6].getText();
		var oIcon = oEvent.getSource().getParent();
		var closeRow = oIcon.getItems()[0];
		var moveRow = oIcon.getItems()[2];
		var that = this;
		var userid;
		var oDialog = new sap.m.Dialog({
			contentWidth: "400px"
		});
		oDialog.setTitle("Move Issue");

		var oManagerName = new sap.m.Label({
			text: "Swipe your card"
		});
		var oManagerInput = new sap.m.Input({
			id: "idMoveMangr",
			placeholder: "Swipe your Card",
			change: function(oEvent1) {
				if (oEvent1.getSource().getValue().length < 10) {
					oEvent1.getSource().setValueState("Error");
					oEvent1.getSource().setValueStateText("Valid authorising person required");
					oEvent1.getSource().focus();
				}
			},
			liveChange: function(oEvent2) {
				if (oEvent2.getSource().getValue().length === 10) {
					oEvent2.getSource().setValueState("None");
					oEvent2.getSource().setValueStateText("");
					userid = that.checkMoveIss(cat01, cat02, cat03);
					if (sap.ui.getCore().byId("idMoveMangr").getValue() !== "NOT AUTHORISED") {
						sap.ui.getCore().byId("idBMoveIssOk").setEnabled(true);
					}
				} else if (oEvent2.getSource().getValue().length === 0) {
					oEvent2.getSource().setValueState("Error");
					oEvent2.getSource().setValueStateText("Valid authorising person required");
					oEvent2.getSource().focus();
				}
			}
		});
		var oSimpleForm = new sap.ui.layout.form.SimpleForm({
			maxContainerCols: 3,
			editable: false,
			labelMinWidth: 30,
			content: [oManagerName,
				oManagerInput
			]
		});
		oDialog.addContent(oSimpleForm);

		var oButtonOk = new sap.m.Button({
			id: "idBMoveIssOk",
			text: "Ok",
			press: function() {
				if (sap.ui.getCore().byId("idMoveMangr").getValue() !== "NOT AUTHORISED") {
					that.moveIssue(issueNum, cat01, cat02, cat03, matnr, text, closeRow, moveRow, userid);
				}
				oDialog.destroy();
			}
		});
		sap.ui.getCore().byId("idBMoveIssOk").setEnabled(false);
		oDialog.setBeginButton(oButtonOk);
		var oButtonClose = new sap.m.Button({
			text: "Cancel",
			press: function() {
				oDialog.destroy();
				sap.m.MessageToast.show("Issue has not been moved");
			}
		});
		oDialog.setEndButton(oButtonClose);
		oDialog.open();

	},
	checkMoveIss: function(cat01, cat02, cat03) {
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
		//	    var that = this;

		var uri = "/IssueAuthSet(Auth='MOVE_ISS',Category01='" + cat01 +
			"',Category02='" + cat02 +
			"',Category03='" + cat03 +
			"',AuthGroup='" + sap.ui.getCore().byId("idMoveMangr").getValue() + "')";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";
		var userid;
		this.oDataModel.read(uri, {
			success: function(oData) {
				if (oData.AuthGroup !== "NOT AUTHORISED") {
					var user = oData.AuthGroup;
					var userVal = user.split(";");
					userid = userVal[0];
					var userName = userVal[1];
					sap.ui.getCore().byId("idMoveMangr").setValue(userName);
				} else {
					sap.ui.getCore().byId("idMoveMangr").setValue(oData.AuthGroup);
				}
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
		return userid;
	},
	moveIssue: function(issueNum, cat01, cat02, cat03, matnr, text, closeRow, moveRow, userid) {
		var oOperatorsModel = this.getView().getModel("Operators");
		//	  var listBDR = this._oView.byId("operationsBDR");
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
			defaultBindingMode: "OneWay",
			useBatch: false,
			defaultCountMode: "Inline",
			loadMetadataAsync: false,
			defaultUpdateMethod: "PUT",
			json: false
		});

		//	  var date = new Date();

		var data = {
			"Issue": issueNum,
			"Aufnr": oOperatorsModel.getData().ProductionOrder,
			"Category01": cat01,
			"Category02": cat02,
			"Category03": cat03,
			"Werks": "9000",
			"Aplfl": oOperatorsModel.getData().WorkCentre,
			"Matnr": matnr,
			"Text": text,
			"Status": "MOVE_ISS",
			"MoveUser": userid
				// sap.ui.getCore().getModel("Operators").getData().Operators[listBDR.getSelectedItem().getBindingContext().getProperty("Operator")-1].UName
		};

		var uri = "/IssueCaptureSet('" + issueNum + "')";
		var that = this;
		oDataModel.update(uri, data, {
			success: function(oData, oResponse, aErrorResponse) {
				sap.m.MessageToast.show("Issue moved!");
				//	sap.ui.getCore().byId(closeRow).setEnabled(false);
				sap.ui.getCore().byId(moveRow.getIdForLabel()).setVisible(false);
				//	that.loadIssueTable();
			},
			error: function(e) {
				zmclaren.prd.util.messages.showErrorMessage(e);
			}
		});
		//	that._oView.byId("idIssueLog").getModel().refresh(true);   

	},
	onMoveCar: function(oEvent) {
		var oDialog = new sap.m.Dialog({
			contentWidth: "400px"
		});
		oDialog.setTitle("Move Car");
		var oManagerName = new sap.m.Label({
			text: "Swipe your card"
		});
		var that = this;
		var userid;
		var oManagerInput = new sap.m.Input({
			id: "idMoveCarManager",
			placeholder: "Swipe your Card",
			change: function(oEvent1) {
				if (oEvent1.getSource().getValue().length < 10) {
					oEvent1.getSource().setValueState("Error");
					oEvent1.getSource().setValueStateText("Valid authorising person required");
					oEvent1.getSource().focus();
				}
			},
			liveChange: function(oEvent2) {
				if (oEvent2.getSource().getValue().length === 10) {
					oEvent2.getSource().setValueState("None");
					oEvent2.getSource().setValueStateText("");
					userid = that.checkMoveCar();
					if (sap.ui.getCore().byId("idMoveCarManager").getValue() !== "NOT AUTHORISED") {
						sap.ui.getCore().byId("idBMoveCarOk").setEnabled(true);
					}
				} else if (oEvent2.getSource().getValue().length === 0) {
					oEvent2.getSource().setValueState("Error");
					oEvent2.getSource().setValueStateText("Valid authorising person required");
					oEvent2.getSource().focus();
				}
			}
		});
		var oSimpleForm = new sap.ui.layout.form.SimpleForm({
			maxContainerCols: 3,
			editable: false,
			labelMinWidth: 30,
			content: [oManagerName,
				oManagerInput
			]
		});
		oDialog.addContent(oSimpleForm);

		var oButtonOk = new sap.m.Button({
			id: "idBMoveCarOk",
			text: "Ok",
			press: function() {
				if (sap.ui.getCore().byId("idMoveCarManager").getValue() !== "NOT AUTHORISED") {
					that.moveCar(userid);
					oDialog.destroy();
				}
				//	that.closeIssue(oParameters);
			}
		});
		sap.ui.getCore().byId("idBMoveCarOk").setEnabled(false);
		oDialog.setBeginButton(oButtonOk);
		var oButtonClose = new sap.m.Button({
			text: "Cancel",
			press: function() {
				oDialog.destroy();
				sap.m.MessageToast.show("Car has not been moved");
			}
		});
		oDialog.setEndButton(oButtonClose);
		oDialog.open();
	},
	checkMoveCar: function(oEvent) {
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oConfig = {
			metadataUrlParams: {},
			json: true,
			// loadMetadataAsync : true,
			defaultBindingMode: "TwoWay",
			defaultCountMode: "Inline",
			useBatch: false
		};
		var userid;
		this.oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, oConfig);
		var uri = "IssueAuthSet(Auth='MOVE_CAR',Category01=' ',Category02=' ',Category03=' ',AuthGroup='" + sap.ui.getCore().byId(
			"idMoveCarManager").getValue() + "')";
		this.oDataModel.read(uri, {
			success: function(oData) {
				if (oData.AuthGroup !== "NOT AUTHORISED") {
					var user = oData.AuthGroup;
					var userVal = user.split(";");
					userid = userVal[0];
					var userName = userVal[1];
					sap.ui.getCore().byId("idMoveCarManager").setValue(userName);
				} else {
					sap.ui.getCore().byId("idMoveCarManager").setValue(oData.AuthGroup);
				}
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
		return userid;
	},
	moveCar: function(userid) {
		var oOperatorsModel = this.getView().getModel("Operators");
		//	  var listBDR = this._oView.byId("operationsBDR");
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
			defaultBindingMode: "OneWay",
			useBatch: false,
			defaultCountMode: "Inline",
			loadMetadataAsync: false,
			defaultUpdateMethod: "PUT",
			json: false
		});

		//	  var date = new Date();

		var data = {
			"Issue": "1",
			"Aufnr": oOperatorsModel.getData().ProductionOrder,
			"Werks": "9000",
			"Aplfl": oOperatorsModel.getData().WorkCentre,
			"Status": "MOVE_CAR",
			"MoveUser": userid
				// sap.ui.getCore().getModel("Operators").getData().Operators[listBDR.getSelectedItem().getBindingContext().getProperty("Operator")-1].UName
		};

		var uri = "/IssueCaptureSet('0000000001')";
		var that = this;
		oDataModel.update(uri, data, {
			success: function(oData, oResponse, aErrorResponse) {
				sap.m.MessageToast.show("Car moved!");
				that._oView.byId("btnMoveCar").setEnabled(false);
				that.loadIssueTable();
				that.enableDisableIssues(oOperatorsModel.getData().WorkCentre, bPulled);
				//	that.loadIssueTable();
			},
			error: function(e) {
				zmclaren.prd.util.messages.showErrorMessage(e);
			}
		});
	},
	checkCarPulled: function() {
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oOperatorsModel = this.getView().getModel("Operators");
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
		var uriTab = "/PulledCarSet(Pull='1',Aufnr='" + oOperatorsModel.getData().ProductionOrder + "',Aplfl='" + oOperatorsModel.getData().WorkCentre +
			"')";

		this.oDataModel.read(uriTab, {
			success: function(oData) {
				if (oData.Pull !== "0") {
					that.enableDisablePulledCar();
				}
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
	},
	//Check if Operator has operations
	checkOperations: function(oEvent) {
		// Check if the same
		//TAKT TIME re-do //
//		 zmclaren.prd.util.TaktClock.onUserActionHandler();
		if (oEvent.getSource().getType() === "Emphasized") {
			return;
		}
		var oOperatorsModel = this.getView().getModel("Operators");
		this.getView().byId("idCIssCat").setSelectedKey(null);
		this.getView().byId("idSIssSubCat").setSelectedKey(null);
		this.getView().byId("idSIssCat03").setSelectedKey(null);
		this.getView().byId("idCIssMat").setSelectedKey(null);
		this.getView().byId("idTAIssReason").setValue(null);
		this.checkCarPulled();
		this.bDataCollectionLoaded = false;
		this.openBusyDialog();
		var that = this;

		// var operator = btn.getId().slice(-1);
		var oView = this.getView();

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
		oView.setBusy(true);
		this.oDataModel.read("GetOperationsForOperator/$count", {
			urlParameters: "WorkCentreID='" + oOperatorsModel.getData().WorkCentre + "'&OrderNumber='" + oOperatorsModel.getData().ProductionOrder +
				"'&Operator='" + oEvent.getSource().getId().slice(-1) + "'",
			success: function(oData, response) {
				oView.setBusy(false);
				if (response.body == 0) {
					// that.disableEnableOptions(true);
					that.onSignOff(oEvent);
					if (that._busyDialog) {
						that._busyDialog.close();
					}
					sap.m.MessageToast.show("No operations for this operator!");
				} else {
					bFlagBDR = true;
					//Colors and Icon Buttons
					// that.buttonsChange(operator);
					that.onOperatorChange(oEvent);
				}
			},
			error: function(oError) {
				oView.setBusy(false);
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
	},

	//Operators Buttons change
	buttonsChange: function(selBtn) {
		var oView = this._oView;
		// var selBtn = btn.getId().slice(-1);
		var oOperatorsModel = oView.getModel("Operators");

		this.getRouter().navTo("app2", {
			from: "detailOperations",
			// plant: aPar[1], //Fixed for now but will change in the future
			workcentre: oOperatorsModel.getData().WorkCentre, //aPar[3], //this._oView.byId("workcentreId").getValue()
			prodorder: oOperatorsModel.getData().ProductionOrder, //this._oView.byId("detailOHProdOrders").getTitle().split(" ")[2],
			operator: selBtn
		});
	},

	onRouteMatched: function(oEvent) {
		try {
			var oParameters = oEvent.getParameters();

			jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {
				// When navigating in the Detail page, update the binding context 
				if (oParameters.name !== "detailoperations") {
					return;
				}
				var sEntityPath = "/ProdOrderOperationCollection(WorkCentreID='" + oParameters.arguments.workcentre + "',OrderNumber='" +
					oParameters.arguments.ordernumber + "',Operator='" + oParameters.arguments.operator + "',OperationPlanNo='" + oParameters.arguments
					.plannumber + "',OperationCounter='" + oParameters.arguments.operationcounter + "',Operation='" + oParameters.arguments.operation +
					"')";
				this.bindView(sEntityPath);
			}, this));
			this.displayIssMatnr();
			this.loadIssueTable();
			//	if(!bChangeOps){
			this.enableDisableIssues(oParameters.arguments.workcentre, false);
			//`	}
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	bindView: function(sEntityPath) {
		var oView = this._oView;
		oView.bindElement(sEntityPath);
		countdowntime = this.checkTaktTime();
		// this._oView.byId("operationsBDR").bindAggregation("items", sEntityPath+"/ToOperationBDR", this._oView.byId("operationsBDRTemplate").clone());

		//Check if the data is already on the client
		if (!oView.getModel().getData(sEntityPath)) {

			// Check that the entity specified was found.
			oView.getElementBinding().attachEvent("dataReceived", jQuery.proxy(function() {
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

		// var that = this;
		// this.getView().bindElement({
		// 	path: sEntityPath,
		// 	events: {
		// 		// change: this._onBindingChange.bind(this),
		// 		dataRequested: function() {
		// 			oView.getModel().setProperty("/busy", true);
		// 		},
		// 		dataReceived: function(oData) {
		// 			oView.getModel().setProperty("/busy", false);
		// 			if (!oData) {
		// 				that.showEmptyView();
		// 				that.fireDetailNotFound();
		// 			} else {
		// 				that.fireDetailChanged(sEntityPath);
		// 			}
		// 		}
		// 	}
		// });
	},

	onSelectBDR: function(oEvent) {
		var btn = this._oView.byId("btnConfirmBDR");
		if (oEvent.getSource().getSelectedItem().getBindingContext().getProperty("IsConfirmed")) {
			btn.setText("BDR Confirmed");
			btn.setType("Accept");
			btn.setEnabled(false);
		} else {
			btn.setText("Confirm BDR");
			btn.setType("Reject");
			btn.setEnabled(true);
		}

		if (sap.ui.getCore().byId("bdrFrame")) {
			sap.ui.getCore().byId("bdrFrame").destroy();
		}

		var uri = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("Uri");

		//Top Bar 48px / ObjectHeader 166px / IconTabBar 98px / Footer 48px / Select 80px / Something 8px / Total 344
		var windowSize = $(window).height();
		// var listId = "#" + this._oView.getId() +"--bdrForm";
		// var listId = "#" + this._oView.getId() +"--operationsBDR";
		//var listSize = $(listId).height() + 34;
		var space;
		// if(sap.ui.getCore().byId("mainShell") === undefined){
		// 	space = 352;
		// }
		// else{
		// 	space = 352+44;
		// }
		space = 352;
		var iFrameHeight = windowSize = windowSize - space; //- listSize;// + $("#" + this._oView.getId() +"--bdrFrame").height();
		// var iFrameHeight = "375";
		var html = new sap.ui.core.HTML("bdrFrame");
		this.getView().byId("idITBBDR").addContent(html);
		this._oView.byId("bdrFrame").setContent("<iframe src='" + uri + "#view=FitH' width='100%' height='" + iFrameHeight +
			"px' frameBorder='0'></iframe>");
		this._oView.byId("bdrFrame").setVisible(true);
	},

	showWorkInstruction: function() {
		if (sap.ui.getCore().byId("workInstructionsFrame")) {
			this._oView.byId("workInstructionsFrame").setContent(null);
			sap.ui.getCore().byId("workInstructionsFrame").destroy();
		}
		var uri = this.getView().byId("operationsWorkInstruction").getItems()[0].getDescription();

		//Top Bar 48px / ObjectHeader 166px / IconTabBar 98px / Footer 48px / Something 52px / Total 276
		var windowSize = $(window).height();
		var space;
		// if(sap.ui.getCore().byId("mainShell") === undefined){
		// 	space = 276;
		// }
		// else{
		// 	space = 276+44;
		// }
		space = 276;
		var iFrameHeight = windowSize - space;
		// Set height for side container scroll
		this.getView().byId("idSCSideComponents").setHeight(iFrameHeight + "px");

		var html = new sap.ui.core.HTML("workInstructionsFrame");
		this.getView().byId("idITBWorkInstructions").addContent(html);
		this._oView.byId("workInstructionsFrame").setContent("<iframe src='" + uri + "#view=FitH' width='100%' height='" + iFrameHeight +
			"px' frameBorder='0'></iframe>");
	},

	showEmptyView: function() {
		this.getRouter().myNavToWithoutHash({
			currentView: this._oView,
			targetViewName: "zmclaren.prd.view.NotFound",
			targetViewType: "XML"
		});
	},

	fireDetailChanged: function(sEntityPath) {
		if (bFlagBDR) {
			var op = sEntityPath.substring(sEntityPath.indexOf("Operator='") + 10, sEntityPath.indexOf("Operator='") + 11);
			this.checkAllSignOff(op, false);
			this.loadBDR(sEntityPath);
			// this.getView().byId("idBtnOperator"+op).firePress();
		}

		this.getEventBus().publish("DetailOperations", "Changed", {
			sEntityPath: sEntityPath
		});

		if (this._busyDialog) {
			this._busyDialog.close();
		}

		//Update the Count of tabs
		// this.updateTabCounts();
		// this.showWorkInstruction();
	},

	fireDetailNotFound: function() {
		this.getEventBus().publish("DetailOperations", "NotFound");
	},

	loadBDR: function(sEntityPath) {
		var that = this;
		var oOperatorsModel = sap.ui.getCore().getModel("Operators");
		var sOperator = sEntityPath.split("'")[5];
		var firstOperationPath = oOperatorsModel.getData().Operators[sOperator - 1].firstOperationPath;
		var sPath;
		if (firstOperationPath !== undefined) {
			sPath = sEntityPath.substring(0, sEntityPath.length - 57) + firstOperationPath;
		} else {
			sPath = sEntityPath;
		}

		//Local BDR

		this.getView().byId("operationsBDR").setModel(this.oOperationsBDRModel);

		var oItemSelectTemplate = new sap.ui.core.Item({
			key: "{Description}",
			text: "{Description}"
		});
		this._oView.byId("operationsBDR").bindAggregation("items", "/results", oItemSelectTemplate);

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

		var uri = sPath + "/ToOperationBDR";

		this.oDataModel.read(uri, {
			success: function(oData) {
				that.oOperationsBDRModel.setData(oData);
				//Only loads the first time
				if (bFlagBDR) {
					// var totalBDR = oEvent.getParameters().data.__count;
					var totalBDR = oData.results.length;
					that._oView.byId("idITBBDR").setCount(totalBDR);
					//Disable BDR Tab
					if (totalBDR == 0) {
						var oEventBus = that.getEventBus();
						oEventBus.publish("ConfirmBDR", "BDRConfirmed");
						that.enableDisableBDR(false);
						that._oView.byId("idITBBDR").setEnabled(false);
						// this._oView.byId("bdrFrame").setContent("");
						if (sap.ui.getCore().byId("bdrFrame")) {
							sap.ui.getCore().byId("bdrFrame").destroy();
						}
						// that._oView.byId("iconTabBarOperations").setSelectedKey("workInstructions");
						that.setOperatorPrevStatus("workInstructions");
						//this.afterBDRsConfirmed();
					} else {
						that.enableDisableBDR(true);
						that._oView.byId("idITBBDR").setEnabled(true);
						var oList = that.getView().byId("operationsBDR");
						oList.setSelectedItem(oList.getFirstItem());
						oList.fireChange({
							"selectedItem": oList.getFirstItem()
						});
						that.setOperatorPrevStatus("bdr");
					}
					bFlagBDR = false;
				}
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: true
		});
		//End Local BDR	

		// this._oView.byId("operationsBDR").getBinding("items").attachEvent("dataReceived", 
		// 	jQuery.proxy(function(oEvent){
		// 		var totalBDR = oEvent.getParameters().data.__count;
		// 		this._oView.byId("idITBBDR").setCount(totalBDR);
		// 		//Disable BDR Tab
		// 		if(totalBDR == 0){
		// 			var oEventBus = that.getEventBus();
		// 			oEventBus.publish("ConfirmBDR", "BDRConfirmed");
		// 			this.enableDisableBDR(false);
		// 			this._oView.byId("idITBBDR").setEnabled(false);
		// 			// this._oView.byId("bdrFrame").setContent("");
		// 			if(sap.ui.getCore().byId("bdrFrame"))
		// 			{
		// 				sap.ui.getCore().byId("bdrFrame").destroy();
		// 			}
		// 			this._oView.byId("iconTabBarOperations").setSelectedKey("workInstructions");
		// 			//this.afterBDRsConfirmed();
		// 		}
		// 		else{
		// 			this.enableDisableBDR(true);
		// 			this._oView.byId("idITBBDR").setEnabled(true);
		// 			var oList = this.getView().byId("operationsBDR");
		// 			oList.setSelectedItem(oList.getFirstItem());
		// 			oList.fireChange({
		// 				"selectedItem": oList.getFirstItem()
		// 			});
		// 		}
		// 	}, this));	
	},

	onUpdateFinishedBDR: function(oEvent) {
		this.bBDRLoaded = true;
		var totalBDR = oEvent.getSource().getItems().length;
		//Update Tab Counter
		this._oView.byId("idITBBDR").setCount(totalBDR);
		//Disable BDR Tab
		if (totalBDR === 0) {
			this._oView.byId("idITBBDR").setEnabled(false);
			// this._oView.byId("bdrFrame").setContent("");
			if (sap.ui.getCore().byId("bdrFrame")) {
				sap.ui.getCore().byId("bdrFrame").destroy();
			}
			// this._oView.byId("iconTabBarOperations").setSelectedKey("workInstructions");
			this.setOperatorPrevStatus("workInstructions");
			//this.afterBDRsConfirmed();
		} else {
			this._oView.byId("idITBBDR").setEnabled(true);
			var oList = oEvent.getSource();
			var aItems = oList.getItems();
			oList.setSelectedItem(aItems[0], true);
			oList.fireSelect({
				"listItem": aItems[0]
			});
			this.setOperatorPrevStatus("bdr");
		}
	},

	onUpdateFinishedWorkInstructions: function(oEvent) {
		var totalWorkInstructions = oEvent.getSource().getItems().length;
		//Update Tab Counter
		this._oView.byId("idITBWorkInstructions").setCount(totalWorkInstructions);
		//Disable WorkInstructions Tab
		if (totalWorkInstructions === 0) {
			// this._oView.byId("imageWI").setVisible(false);
			this._oView.byId("workInstructionsFrame").setVisible(false);
			// this._oView.byId("iconTabBarOperations").setSelectedKey("bdr");
		} else {
			// this._oView.byId("imageWI").setVisible(true);

			this._oView.byId("workInstructionsFrame").setVisible(true);
			//Display the Work Instruction
			this.showWorkInstruction();
		}
	},

	onUpdateFinishedDataCollection: function(oEvent) {
		this.bDataCollectionLoaded = true;
		this.clearDataCollection();
		this.selectEmptyDataCollection();
		var totalDataCollection = oEvent.getSource().getItems().length;
		//Update Tab Counter
		this._oView.byId("idITBDataCollection").setCount(totalDataCollection);

		if (this._busyDialog) {
			this._busyDialog.close();
		}
	},

	onUpdateFinishedTooling: function(oEvent) {
		var totalTooling = oEvent.getSource().getItems().length;
		//Update Tab Counter
		this._oView.byId("idITBTooling").setCount(totalTooling);
	},

	onUpdateFinishedComponent: function(oEvent) {
		var totalComponents = oEvent.getSource().getItems().length;
		//Update Tab Counter
		this._oView.byId("idITBComponents").setCount(totalComponents);
	},
	onIssUpdateFinished: function(oEvent) {
		var totalIssues = oEvent.getSource().getItems().length;
		this._oView.byId("idITBIssues").setCount(totalIssues);
	},
	// Clear Data Collection values when empty
	clearDataCollection: function() {
		var listDataCollection = this.getView().byId("operationsDataCollectionTable");
		for (var i = 0; i < listDataCollection.getItems().length; i++) {
			if (listDataCollection.getItems()[i].getBindingContext().getProperty("ActualValue") === "") {
				listDataCollection.getItems()[i].getCells()[4].setValue("");
			}
		}
	},

	// Select first empty data collection
	selectEmptyDataCollection: function() {
		var listDataCollection = this.getView().byId("operationsDataCollectionTable");
		for (var i = 0; i < listDataCollection.getItems().length; i++) {
			if (listDataCollection.getItems()[i].getCells()[4].getValue() === "") {
				listDataCollection.getItems()[i].getCells()[4].focus();
				return;
			}
		}
	},

	// //Update All IconTabBar Counters
	// updateTabCounts : function(){
	// 	var that = this;
	// 	this._oView.byId("operationsBDR").getBinding("items").attachEvent("dataReceived", 
	// 	jQuery.proxy(function(oEvent){
	// 		this._oView.byId("idITBBDR").setCount(oEvent.getParameters().data.__count);
	// 		if(oEvent.getParameters().data.__count > 0)
	// 		{
	// 			that.checkBDRConfirmation(true);
	// 		}
	// 		else
	// 		{
	// 			that.checkBDRConfirmation(false);
	// 		}
	// 	}, this));

	// 	this._oView.byId("operationsWorkInstruction").getBinding("items").attachEvent("dataReceived", 
	// 	jQuery.proxy(function(oEvent){
	// 		this._oView.byId("idITBWorkInstructions").setCount(oEvent.getParameters().data.__count);
	// 	}, this));

	// 	this._oView.byId("operationsDataCollectionTable").getBinding("items").attachEvent("dataReceived", 
	// 	jQuery.proxy(function(oEvent){
	// 		this._oView.byId("idITBDataCollection").setCount(oEvent.getParameters().data.__count);
	// 	}, this));		

	// 	this._oView.byId("operationsTooling").getBinding("items").attachEvent("dataReceived", 
	// 	jQuery.proxy(function(oEvent){
	// 		this._oView.byId("idITBTooling").setCount(oEvent.getParameters().data.__count);
	// 	}, this));

	// 	this._oView.byId("operationsComponent").getBinding("items").attachEvent("dataReceived", 
	// 	jQuery.proxy(function(oEvent){
	// 		this._oView.byId("idITBComponents").setCount(oEvent.getParameters().data.__count);
	// 	}, this));
	// },

	// Enable/Disable accordingly to BDR confirmation
	checkBDRConfirmation: function() {
		var listBDR = this.getView().byId("operationsBDR");
		var aItems = listBDR.getItems();
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].getBindingContext() === undefined) {
				return;
			}
			if (!aItems[i].getBindingContext().getProperty("IsConfirmed")) {
				this._oView.byId("iconTabBarOperations").setSelectedKey("bdr");
				return false;
			}
		}
		return true;
	},

	//Only enable options for that operator once all BDRs are confirmed
	// bValue has true if there are BDRs
	enableDisableBDR: function(bValue) {
		var oEventBus = this.getEventBus();
		if (bValue) {
			if (this.checkBDRConfirmation() && this.getView().byId("btnSignOff").getEnabled()) {
				oEventBus.publish("ConfirmBDR", "BDRConfirmed");
				this._oView.byId("idITBWorkInstructions").setEnabled(true);
				this._oView.byId("idITBDataCollection").setEnabled(true);
				this._oView.byId("idITBTooling").setEnabled(true);
				this._oView.byId("idITBComponents").setEnabled(true);
				this._oView.byId("idITBIssues").setEnabled(true);
			} else {
				oEventBus.publish("ConfirmBDR", "BDRNotConfirmed");
				this._oView.byId("idITBWorkInstructions").setEnabled(false);
				this._oView.byId("idITBDataCollection").setEnabled(false);
				this._oView.byId("idITBTooling").setEnabled(false);
				this._oView.byId("idITBComponents").setEnabled(false);
				this._oView.byId("idITBIssues").setEnabled(false);
			}
		} else {
			this._oView.byId("idITBWorkInstructions").setEnabled(true);
			this._oView.byId("idITBDataCollection").setEnabled(true);
			this._oView.byId("idITBTooling").setEnabled(true);
			this._oView.byId("idITBComponents").setEnabled(true);
			this._oView.byId("idITBIssues").setEnabled(true);
		}

	},

	// Disable Tabs if Operations Deleted
	disableTabs: function() {
		this._oView.byId("idITBBDR").setEnabled(false);
		this._oView.byId("idITBWorkInstructions").setEnabled(false);
		this._oView.byId("idITBDataCollection").setEnabled(false);
		this._oView.byId("idITBTooling").setEnabled(false);
		this._oView.byId("idITBComponents").setEnabled(false);
	},

	// Enable Tabs if Operations not Deleted
	enableTabs: function() {
		if (this.getView().byId("btnSignOff").getEnabled()) {
			if (!this.checkBDRConfirmation()) {
				this._oView.byId("idITBBDR").setEnabled(true);
			} else {
				var listBDR = this.getView().byId("operationsBDR");
				var aItems = listBDR.getItems();
				if (aItems.length > 0) {
					this._oView.byId("idITBBDR").setEnabled(true);
				} else {
					this._oView.byId("idITBBDR").setEnabled(false);
				}
				this._oView.byId("idITBWorkInstructions").setEnabled(true);
				this._oView.byId("idITBDataCollection").setEnabled(true);
				this._oView.byId("idITBTooling").setEnabled(true);
				this._oView.byId("idITBComponents").setEnabled(true);
			}
		}
	},
	checkOpenIss: function() {
		var bOpenFlag = false;
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oOperatorsModel = this.getView().getModel("Operators");
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
		var uriTab = "/CheckOpenIssSet(Aufnr='" + oOperatorsModel.getData().ProductionOrder + "',Aplfl='" + oOperatorsModel.getData().WorkCentre +
			"')";
		//?$filter=ProdCategory eq '" + oEvent.getSource().getSelectedItem().getKey() + "'";

		this.oDataModel.read(uriTab, {
			success: function(oData) {
				if (oData.isOpen === true) {
					bOpenFlag = true;
				}
			},
			error: function(oError) {
				zmclaren.prd.util.messages.showErrorMessage(oError);
			},
			async: false
		});
		return bOpenFlag;
	},
	disableSignOff: function(oEvent) {
		//TAKT TIME re-do //
//		 zmclaren.prd.util.TaktClock.onRemoveActionHandler();
		//TAKT TIME re-do //
	//	clearTimeout(window.timeout);
		var bOpenFlag = this.checkOpenIss();
		if (bOpenFlag) {
			sap.m.MessageToast.show("Please action all open issues!");
			this._oView.byId("iconTabBarOperations").setSelectedKey("issues");
		} else {
			if (this.bDataCollectionLoaded) // && !bOpenFlag)
			{
				this.openBusyDialog();
				this.bDataCollectionLoaded = false;
				// this.bBDRLoaded = false;
				this.getView().byId("btnSignOff").setEnabled(false);
				// 		setTimeout(this.checkDataCollectionComplete(oEvent), 2000);
				var that = this;
				setTimeout(function() {
					that.checkDataCollectionComplete(oEvent);
				}, 2500);
			}
		}
	},

	//Check Data Collection Complete
	checkDataCollectionComplete: function(oEvent) {
//		zmclaren.prd.util.TaktClock.onUserActionHandler();
		try {
			var that = this;
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false
			});

			var selOperator = this.getSelectedOperator();
			var operatorsData = this.getView().getModel("Operators").getData();
			var orderNumber = operatorsData.ProductionOrder;
			var workCentre = operatorsData.WorkCentre;

			var uri = "/IsDataCollectionComplete";
			oDataModel.read(uri, {
				urlParameters: "Operator='" + selOperator + "'&OrderNumber='" + orderNumber + "'&WorkCentreID='" + workCentre + "'",
				success: function(oData, oResponse, aErrorResponse) {
					if (oData.Confirmed) {
						if (oEvent.sId === "") {
							that.onSignOff(oEvent);
						} else {
							that.getEventBus().publish("DetailOperations", "DataCollectionAllIcon");
							if (that._busyDialog) {
								that._busyDialog.close();
							}
						}
					} else {
						if (oEvent.sId === "") {
							if (that._busyDialog) {
								that._busyDialog.close();
							}
							that.getView().byId("btnSignOff").setEnabled(true);
							sap.m.MessageToast.show("Please collect all data!");
						}
					}
					that._oView.byId("iconTabBarOperations").setSelectedKey("dataCollection");
				},
				error: function(oError) {
					if (this._busyDialog) {
						this._busyDialog.close();
					}
					zmclaren.prd.util.messages.showErrorMessage(oError);
				},
				async: false
			});
		} catch (oError) {
			if (this._busyDialog) {
				this._busyDialog.close();
			}
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	// Check All Operators Signed Off
	checkAllSignOff: function(iOperator, bAll) {
		try {
			var that = this;
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false
			});

			var operatorsData = this.getView().getModel("Operators").getData();
			var orderNumber = operatorsData.ProductionOrder;
			var workCentre = operatorsData.WorkCentre;

			var uri = "/CheckAllOperatorsConfirmed";
			oDataModel.read(uri, {
				urlParameters: "OrderNumber='" + orderNumber + "'&WorkCentreID='" + workCentre + "'",
				success: function(oData, oResponse, aErrorResponse) {
					if (bAll) {
						if (oData.results[0].Confirmed) {
							that.getEventBus().publish("MasterOperations", "RefreshMaster");
							that._oRouter.navTo("app", {
								from: "masteroperations",
								plant: "9000", //Fixed for now but will change in the future
								workcentre: sap.ui.getCore().getModel("Operators").getData().WorkCentre
							});
						} else {
							for (var i = 1; i < oData.results.length; i++) {
								if (oData.results[i].Confirmed) {
									operatorsData.Operators[i - 1].ButtonType = "Accept";
									operatorsData.Operators[i - 1].Icon = "";
									operatorsData.Operators[i - 1].CompleteSignOff = true;
									operatorsData.Operators[i - 1].ButtonEnabled = false;
									if (iOperator == i) {
										that.disableEnableOptions(true);
									}
								} else {
									if (iOperator == i) {
										operatorsData.Operators[i - 1].ButtonType = "Emphasized";
										operatorsData.Operators[i - 1].Icon = "sap-icon://employee";
										that.disableEnableOptions(false);
									} else {
										operatorsData.Operators[i - 1].ButtonType = "Reject";
										operatorsData.Operators[i - 1].Icon = "";
									}
									operatorsData.Operators[i - 1].CompleteSignOff = false;
									operatorsData.Operators[i - 1].ButtonEnabled = true;
								}
							}
						}
					} else {
						if (oData.results[0].Confirmed) {
							that.getEventBus().publish("MasterOperations", "RefreshMaster");
							that._oRouter.navTo("app", {
								from: "masteroperations",
								plant: "9000", //Fixed for now but will change in the future
								workcentre: sap.ui.getCore().getModel("Operators").getData().WorkCentre
							});
						} else {
							for (i = 1; i < oData.results.length; i++) {
								if (oData.results[i].Confirmed) {
									operatorsData.Operators[i - 1].ButtonType = "Accept";
									operatorsData.Operators[i - 1].Icon = "";
									operatorsData.Operators[i - 1].CompleteSignOff = true;
									operatorsData.Operators[i - 1].ButtonEnabled = false;
									if (iOperator == i) {
										that.disableEnableOptions(true);
										// that.checkOperations(iOperator);
										that.buttonsChange(iOperator);
									}
								} else {
									operatorsData.Operators[i - 1].CompleteSignOff = false;
									operatorsData.Operators[i - 1].ButtonEnabled = true;
									if (iOperator == i) {
										operatorsData.Operators[i - 1].ButtonType = "Emphasized";
										operatorsData.Operators[i - 1].Icon = "sap-icon://employee";
										that.disableEnableOptions(false);
										// that.checkOperations(iOperator);
										that.buttonsChange(iOperator);
									} else {
										operatorsData.Operators[i - 1].ButtonType = "Reject";
										operatorsData.Operators[i - 1].Icon = "";
									}
								}
							}
						}
					}
					that.getView().getModel("Operators").refresh();
				},
				error: function(oError) {
					if (this._busyDialog) {
						this._busyDialog.close();
					}
					zmclaren.prd.util.messages.showErrorMessage(oError);
				},
				async: false
			});
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	// Disable Options
	disableEnableOptions: function(bValue) {
		if (bValue) {
			this.getView().byId("btnSignOff").setText("Signed Off");
			this.getView().byId("btnSignOff").setType("Accept");
			this.getView().byId("btnSignOff").setEnabled(false);
			// this.bFlagBDR = true;
			this.getEventBus().publish("ConfirmBDR", "BDRNotConfirmed");
			this.getView().byId("idITBBDR").setEnabled(false);
			this.getView().byId("idITBWorkInstructions").setEnabled(false);
			this.getView().byId("idITBDataCollection").setEnabled(false);
			this.getView().byId("idITBTooling").setEnabled(false);
			this.getView().byId("idITBComponents").setEnabled(false);
		} else {
			this.getView().byId("btnSignOff").setText("Sign Off");
			this.getView().byId("btnSignOff").setType("Reject");
			this.getView().byId("btnSignOff").setEnabled(true);
			// this.bFlagBDR = true;
			if (this.checkBDRConfirmation()) {
				if (this.getView().byId("operationsBDR").getItems().length > 0) {
					this.getView().byId("idITBBDR").setEnabled(true);
				} else {
					this.getView().byId("idITBBDR").setEnabled(false);
				}
				this.getView().byId("idITBWorkInstructions").setEnabled(true);
				this.getView().byId("idITBDataCollection").setEnabled(true);
				this.getView().byId("idITBTooling").setEnabled(true);
				this.getView().byId("idITBComponents").setEnabled(true);
			}
			// this.checkBDRConfirmation();			
		}

	},

	//Sign Off
	onSignOff: function(oEvent) {
		try {
			var that = this;
			//Check BDRs and Data Collection
			if (this.checkBDRConfirmation()) {
				var selOperator;
				if (oEvent.getId() === "") {
					selOperator = this.getSelectedOperator();
				} else {
					selOperator = oEvent.getSource().getId().slice(-1);
				}

				var btn = oEvent.getSource();

				var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
				var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
					defaultBindingMode: "OneWay",
					useBatch: false,
					defaultCountMode: "Inline",
					loadMetadataAsync: false
				});

				var operatorsData = this.getView().getModel("Operators").getData();
				var opName = operatorsData.Operators[selOperator - 1].UName;
				var orderNumber = operatorsData.ProductionOrder;
				var workCentre = operatorsData.WorkCentre;

				var uri = "/ConfirmAllOperationsForOperator";
				oDataModel.read(uri, {
					urlParameters: "Operator='" + selOperator + "'&OperatorName='" + opName + "'&OrderNumber='" + orderNumber + "'&WorkCentreID='" +
						workCentre + "'",
					success: function(oData, oResponse, aErrorResponse) {
						//     		operatorsData.Operators[selOperator-1].ButtonType = "Accept";
						//     		operatorsData.Operators[selOperator-1].Icon = "";
						//     		operatorsData.Operators[selOperator-1].CompleteSignOff = true;
						//     		operatorsData.Operators[selOperator-1].ButtonEnabled = false;
						//     		btn.setText("Signed Off");
						// btn.setType("Accept");
						// btn.setEnabled(false);
						// that.bFlagBDR = true;
						// that.getEventBus().publish("ConfirmBDR", "BDRNotConfirmed");
						// that.getView().byId("idITBBDR").setEnabled(false);
						// that.getView().byId("idITBWorkInstructions").setEnabled(false);
						// that.getView().byId("idITBDataCollection").setEnabled(false);
						// that.getView().byId("idITBTooling").setEnabled(false);
						// that.getView().byId("idITBComponents").setEnabled(false);
						// that.getView().getModel("Operators").refresh();

						// Clear Operator Tab and Operation in the Model
						operatorsData.Operators[selOperator - 1].Tab = "";
						operatorsData.Operators[selOperator - 1].Operation = "";

						sap.m.MessageToast.show("Sign Off Confirmed!");
						that.checkAllSignOff(selOperator, true);
						if (that._busyDialog) {
							that._busyDialog.close();
						}
					},
					error: function(e) {
						zmclaren.prd.util.messages.showErrorMessage(e);
					}
				});
			} else {
				if (this._busyDialog) {
					this._busyDialog.close();
				}
				sap.m.MessageToast.show("Please confirm BDRs and/or all data is collected!");
			}
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	onNavBack: function() {
		// This is only relevant when running on phone devices
		//TAKT TIME re-do //
		var to = sap.ui.getCore().getModel("OpModel").getProperty("timeout");
		clearTimeout(to);
		//TAKT TIME re-do //
	//	clearTimeout(window.timeout);
		this.getRouter().myNavBack("main");
	},

	onDetailSelect: function(oEvent) {
		sap.ui.core.UIComponent.getRouterFor(this).navTo("DetailOperations", {
			entity2: oEvent.getSource().getBindingContext().getPath().slice(1),
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
		this.getRouter().navTo("masteroperations", {
			from: "detailoperations"
				// plant: "9000", //Fixed for now but will change in the future
				// workcentre: this._oView.byId("workcentreId").getValue()
		});
	},

	onConfirmBDR: function(oEvent) {
		try {

			var that = this;

			var btn = oEvent.getSource();
			var listBDR = this._oView.byId("operationsBDR");

			var date = new Date();
			var data = {
				"Confirmedat": "PT" + date.getHours() + "H" + date.getMinutes() + "M" + date.getSeconds() + "S",
				"Confirmedby": sap.ui.getCore().getModel("Operators").getData().Operators[listBDR.getSelectedItem().getBindingContext().getProperty(
					"Operator") - 1].UName,
				"Confirmedon": date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T00:00:00"
			};

			var workCentre = listBDR.getSelectedItem().getBindingContext().getProperty("WorkCentreID");
			var orderNumber = listBDR.getSelectedItem().getBindingContext().getProperty("OrderNumber");
			var operator = listBDR.getSelectedItem().getBindingContext().getProperty("Operator");
			var operatorPlanNo = listBDR.getSelectedItem().getBindingContext().getProperty("OperationPlanNo");
			var operationCounter = listBDR.getSelectedItem().getBindingContext().getProperty("OperationCounter");
			var operation = listBDR.getSelectedItem().getBindingContext().getProperty("Operation");
			var docId = listBDR.getSelectedItem().getBindingContext().getProperty("Docid");
			var objectType = listBDR.getSelectedItem().getBindingContext().getProperty("Objtype");
			var objectId = listBDR.getSelectedItem().getBindingContext().getProperty("ObjId");
			var documentNumber = listBDR.getSelectedItem().getBindingContext().getProperty("DocumentNumber");

			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false
			});

			var uri = "/OperationBDRCollection(WorkCentreID='" + workCentre + "',OrderNumber='" + orderNumber + "',Operator='" + operator +
				"',OperationPlanNo='" + operatorPlanNo + "',OperationCounter='" + operationCounter + "',Operation='" + operation + "',Docid='" +
				docId + "',Objtype='" + objectType + "',ObjId='" + objectId + "',DocumentNumber='" + documentNumber + "')";
			oDataModel.update(uri, data, {
				success: function(oData, oResponse, aErrorResponse) {
					btn.setText("BDR Confirmed");
					btn.setType("Accept");
					btn.setEnabled(false);
					sap.m.MessageToast.show("BDR Confirmed!");
					var selectedBDR = listBDR.getSelectedItem();
					// listBDR.getModel().refresh();
					bFlagBDR = true;
					that.loadBDR(that._oView.getBindingContext().getPath());
					listBDR.setSelectedItem(selectedBDR);
					// that.enableDisableBDR(true);
				},
				error: function(e) {
					zmclaren.prd.util.messages.showErrorMessage(e);
				}
			});
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	//Save data collection
	onSaveDataCollection: function(btn) {

		try {
			var that = this;
			// var btn = oEvent;
			var value = btn.getParent().getCells()[4].getValue();
			var mask = btn.getParent().getBindingContext().getProperty("Mask");

			// var dataCollectionList = this._oView.byId("operationsDataCollectionTable");
			var operator = btn.getParent().getBindingContext().getProperty("Operator");

			var date = new Date();
			var data = {
				"EnteredTime": "PT" + date.getHours() + "H" + date.getMinutes() + "M" + date.getSeconds() + "S",
				"EnteredBy": sap.ui.getCore().getModel("Operators").getData().Operators[operator - 1].UName,
				"EnteredDate": date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T00:00:00",
				"ActualValue": value
			};

			// var dataCollectionList = this._oView.byId("operationsDataCollectionTable");

			// var workCentre = btn.getParent().getBindingContext().getProperty("WorkCentreID");
			// var orderNumber = btn.getParent().getBindingContext().getProperty("OrderNumber");
			// var operator = btn.getParent().getBindingContext().getProperty("Operator");
			// var operatorPlanNo = btn.getParent().getBindingContext().getProperty("OperationPlanNo");
			// var operationCounter = btn.getParent().getBindingContext().getProperty("OperationCounter");
			// var operation = btn.getParent().getBindingContext().getProperty("Operation");
			// var dataCollectionId = btn.getParent().getBindingContext().getProperty("DataCollectionID");

			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false
			});

			var uri = btn.getBindingContext().getPath();
			// var uri = "/OperationDataCollectCollection(WorkCentreID='"+workCentre+"',OrderNumber='"+orderNumber+"',Operator='"+operator+"',OperationPlanNo='"+operatorPlanNo+"',OperationCounter='"+operationCounter+"',Operation='"+operation+"',DataCollectionID='"+dataCollectionId+"')";
			oDataModel.update(uri, data, {
				success: function(oData, oResponse, aErrorResponse) {
					sap.m.MessageToast.show("Successfully Saved!");
					// btn.getParent().getCells()[4].setValueState("Success");
					btn.getParent().getCells()[4].setValueState("None");
					btn.getParent().getCells()[4].setValueStateText("");
					that._oView.byId("operationsDataCollectionTable").getModel().refresh(true);
					that.checkDataCollectionOperation(btn);
					that.checkDataCollectionComplete(btn);
				},
				error: function(e) {
					if (this._busyDialog) {
						this._busyDialog.close();
					}
					zmclaren.prd.util.messages.showErrorMessage(e);
				}
			});
		} catch (oError) {
			if (this._busyDialog) {
				this._busyDialog.close();
			}
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	// Check if all data is collected for that operation
	checkDataCollectionOperation: function(btn) {
		try {
			var that = this;
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false
			});

			var listDataCollection = this.getView().byId("operationsDataCollectionTable");
			var workCentre = btn.getParent().getBindingContext().getProperty("WorkCentreID");
			var orderNumber = btn.getParent().getBindingContext().getProperty("OrderNumber");
			var operator = btn.getParent().getBindingContext().getProperty("Operator");
			var operationPlanNo = btn.getParent().getBindingContext().getProperty("OperationPlanNo");
			var operationCounter = btn.getParent().getBindingContext().getProperty("OperationCounter");
			var operation = btn.getParent().getBindingContext().getProperty("Operation");
			// /ProdOrderOperationCollection(WorkCentreID='GA010',OrderNumber='1000641',Operator='1',OperationPlanNo='0000000642',OperationCounter='00010343',Operation='0010')/ToOperationDataCollect
			var uri = "/ProdOrderOperationCollection(WorkCentreID='" + workCentre + "',OrderNumber='" + orderNumber + "',Operator='" + operator +
				"',OperationPlanNo='" + operationPlanNo + "',OperationCounter='" + operationCounter + "',Operation='" + operation +
				"')/ToOperationDataCollect";
			oDataModel.read(uri, {
				// urlParameters: "Operator='"+selOperator+"'&OrderNumber='"+orderNumber+"'&WorkCentreID='"+workCentre+"'",
				success: function(oData, oResponse, aErrorResponse) {
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].EnteredBy === "") {
							return;
						}
					}
					that.getEventBus().publish("DetailOperations", "DataCollectionIcon", operation);
				},
				error: function(oError) {
					zmclaren.prd.util.messages.showErrorMessage(oError);
				}
			});
		} catch (oError) {
			if (this._busyDialog) {
				this._busyDialog.close();
			}
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	// Check Data Collection
	checkDataCollection: function(oEvent) {
	//    zmclaren.prd.util.TaktClock.onUserActionHandler();
		var that = this;
		var btn = oEvent.getSource();
		var value = btn.getParent().getCells()[4].getValue();
		var mask = btn.getParent().getBindingContext().getProperty("Mask");
		var validationType = btn.getParent().getBindingContext().getProperty("ValidationType");
		var material = btn.getParent().getBindingContext().getProperty("Material");

		if (value.trim() == "") {
			btn.getParent().getCells()[4].setValueState("Error");
			btn.getParent().getCells()[4].setValueStateText("Please insert the value!");
			btn.getParent().getCells()[4].focus();
		} else {
			if (validationType == 1) {
				if (mask.toString().toUpperCase() === value.toString().toUpperCase()) {
					this.openBusyDialog();
					this.onSaveDataCollection(btn);
				} else {
					btn.getParent().getCells()[4].setValueState("Error");
					btn.getParent().getCells()[4].setValueStateText("Please insert the correct value!");
					btn.getParent().getCells()[4].focus();
				}
			} else if (validationType == 2) {
				if ((new RegExp(mask)).test(value)) {
					this.openBusyDialog();
					this.onSaveDataCollection(btn);
				} else {
					btn.getParent().getCells()[4].setValueState("Error");
					btn.getParent().getCells()[4].setValueStateText("Please insert the correct value!");
					btn.getParent().getCells()[4].focus();
				}
			} else if (validationType == 3) {
				this.openBusyDialog();
				var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
				var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
					defaultBindingMode: "OneWay",
					useBatch: false,
					defaultCountMode: "Inline",
					loadMetadataAsync: false
				});

				var uri = "/ValidateSerial";
				oDataModel.read(uri, {
					urlParameters: "Material='" + material + "'&Plant='9000'&Serial='" + value + "'",
					success: function(oData, oResponse, aErrorResponse) {
						if (oData.IsValid) {
							that.onSaveDataCollection(btn);
						} else {
							if (that._busyDialog) {
								that._busyDialog.close();
							}
							// that.onSaveDataCollection(btn, false, validationType);
							btn.getParent().getCells()[4].setValueState("Error");
							btn.getParent().getCells()[4].setValueStateText("Please insert the correct value!");
							btn.getParent().getCells()[4].focus();
						}
					},
					error: function(e) {
						if (this._busyDialog) {
							this._busyDialog.close();
						}
						zmclaren.prd.util.messages.showErrorMessage(e);
					}
				});
			} else {
				btn.getParent().getCells()[4].setValueState("Error");
				btn.getParent().getCells()[4].setValueStateText("Please insert the correct value!");
				btn.getParent().getCells()[4].focus();
			}
		}
	},

	// Check create or update
	checkOperatorsTable: function() {
		try {

			var that = this;
			var operatorsData = this.getView().getModel("Operators").getData();
			var sOperator;
			if (this.getSelectedOperator() === undefined) {
				sOperator = "1";
			} else {
				sOperator = this.getSelectedOperator();
			}
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false
			});

			var uri = "/ViewStateCollection(WorkCentreID='" + operatorsData.WorkCentre + "',Operator='" + sOperator + "',OrderNumber='" +
				operatorsData.ProductionOrder + "')";

			oDataModel.read(uri, {
				success: function(oData, oResponse, aErrorResponse) {
					if (oData.Operation === "") {
						that.updateOperatorsTable("create", sOperator);
					} else {
						that.updateOperatorsTable("update", sOperator);
					}
				},
				error: function(e) {
					// if(e.statusCode == 404)
					// {
					// 	that.updateOperatorsTable("create", sOperator);
					// }
					// else
					// {
					if (this._busyDialog) {
						this._busyDialog.close();
					}
					zmclaren.prd.util.messages.showErrorMessage(e);
					// }
				}
			});
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	// Update Z Table with State for the Operator (Operation and Tab)
	updateOperatorsTable: function(sOpType, sOperator) {
		try {
			var that = this;
			var operatorsData = this.getView().getModel("Operators").getData();
			var data = {
				"WorkCentreID": operatorsData.WorkCentre,
				"Operator": sOperator.toString(),
				"OrderNumber": operatorsData.ProductionOrder,
				"Operation": this.getView().byId("idDetailOperationsOH").getBindingContext().getPath().split("'")[11],
				"Tabkey": this.getView().byId("iconTabBarOperations").getSelectedKey()
			};

			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false
			});

			if (sOpType === "create") {
				var uri = "/ViewStateCollection";
				oDataModel.create(uri, data, {
					success: function(oData, oResponse, aErrorResponse) {

					},
					error: function(e) {
						if (this._busyDialog) {
							this._busyDialog.close();
						}
						zmclaren.prd.util.messages.showErrorMessage(e);
					}
				});
			} else {
				var uri = "/ViewStateCollection(WorkCentreID='" + operatorsData.WorkCentre + "',Operator='" + sOperator + "',OrderNumber='" +
					operatorsData.ProductionOrder + "')";
				oDataModel.update(uri, data, {
					success: function(oData, oResponse, aErrorResponse) {

					},
					error: function(e) {
						if (this._busyDialog) {
							this._busyDialog.close();
						}
						zmclaren.prd.util.messages.showErrorMessage(e);
					}
				});
			}
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	// Select the correct tab and operation for the Operator
	setOperatorPrevStatus: function(sSelectITB) {
		try {
			var that = this;
			var operatorsData = this.getView().getModel("Operators").getData();
			var sOperator;
			if (this.getSelectedOperator() === undefined) {
				sOperator = "1";
			} else {
				sOperator = this.getSelectedOperator();
			}
			var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
				defaultBindingMode: "OneWay",
				useBatch: false,
				defaultCountMode: "Inline",
				loadMetadataAsync: false
			});

			var uri = "/ViewStateCollection(WorkCentreID='" + operatorsData.WorkCentre + "',Operator='" + sOperator + "',OrderNumber='" +
				operatorsData.ProductionOrder + "')";

			oDataModel.read(uri, {
				success: function(oData, oResponse, aErrorResponse) {
					if (oData.Operation === "") {
						that.getView().byId("iconTabBarOperations").setSelectedKey(sSelectITB);
					} else {
						that.getView().byId("iconTabBarOperations").setSelectedKey(oData.Tabkey);
						if (oData.Tabkey === "dataCollection") {
							that.selectEmptyDataCollection();
						}
					}
					if (this._busyDialog) {
						this._busyDialog.close();
					}
				},
				error: function(e) {
					if (this._busyDialog) {
						this._busyDialog.close();
					}
					zmclaren.prd.util.messages.showErrorMessage(e);
				}
			});
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	onICTSelect: function() {
		if (this.getView().byId("iconTabBarOperations").getSelectedKey() === "dataCollection") {
			this.selectEmptyDataCollection();
		}
	},

	//Set IconTabBar Height
	setIconTabBarHeight: function() {
		//Top Border 4px / Header 48px / ObjectHeader 39+18+16=73px / IconTabBar 47+1+16 = 64px / Footer 47+1=48px / Padding 16+16=32px / Total 269px
		var windowSize = $(window).height();
		var space;
		// if(sap.ui.getCore().byId("mainShell") === undefined){
		// 	space = 269;
		// }
		// else{
		// 	space = 269+44;
		// }
		space = 269;
		this.getView().byId("idSCDataCollection").setHeight((windowSize - space) + "px");
		this.getView().byId("idSCTooling").setHeight((windowSize - space) + "px");
		this.getView().byId("idSCComponents").setHeight((windowSize - space) + "px");
	},

	//Get Operator
	getSelectedOperator: function() {
		var oView = this._oView;
		var selectedOperator;
		var oOperatorsModel = oView.getModel("Operators");
		for (var i = 1; i < 5; i++) {
			if (oOperatorsModel.getData().Operators[i - 1].ButtonType === "Emphasized") {
				return i;
			}
		}
	},

	// Busy Dialog Open
	openBusyDialog: function() {
		// create value confirm dialog
		if (!this._busyDialog) {
			this._busyDialog = sap.ui.xmlfragment("zmclaren.prd.view.busyDialog", this);
			this.getView().addDependent(this._busyDialog);
		}
		// open value confirm
		this._busyDialog.open();
	},

	//Link to Health and Safety
	onHealthSafety: function() {
		try {
			var url = "http://www.assessweb.co.uk";
			window.open(url, '_blank');
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	//Link to After Sales
	onAfterSales: function() {
		try {
			var url = "https://b2b.mclarenautomotive.com/web/guest";
			window.open(url, '_blank');
		} catch (oError) {
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	handleConfirmLogOff: function() {
		this.getRouter().navTo("home", {});
		location.reload();
	},

	handleCancelLogOff: function() {
		this._confirmLogOffDialog.close();
	},

	//Log Off Operators
	onLogOffOperators: function() {
		try {
			// create value confirm dialog
			if (!this._confirmLogOffDialog) {
				this._confirmLogOffDialog = sap.ui.xmlfragment(
					"zmclaren.prd.view.DialogConfirmLogOff",
					this
				);
				this.getView().addDependent(this._confirmLogOffDialog);
			}
			// Update operator position
			this.checkOperatorsTable();
			// open value confirm
			this._confirmLogOffDialog.open();
		} catch (oError) {
			sap.m.MessageToast.show("Error!");
			var errCode;
			if (oError.status) {
				if (oError.status != "error") {
					errCode = oError.status;
				}
			}
			if (oError.response) {
				errCode = oError.response.statusCode;
			}
			if (oError.statusCode) {
				errCode = oError.statusCode;
			}
			if (errCode == "503") {
				sap.m.MessageToast.show("Error! Reloading...");
				this.getRouter().navTo("home", {});
				location.reload();
			}
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	onExit: function(oEvent) {
		var oEventBus = this.getEventBus();
		oEventBus.unsubscribe("MasterOperations", "InitialLoadFinished", this.onMasterLoaded, this);
		oEventBus.unsubscribe("Component", "MetadataFailed", this.onMetadataFailed, this);
		oEventBus.unsubscribe("Detail", "CheckBeforeLoadOperators", this.onBeforeLoad, this);
		oEventBus.unsubscribe("FocusDataCollection", "Focus", this.onICTSelect, this);
		oEventBus.unsubscribe("DetailOperations", "UpdateOperatorStatus", this.checkOperatorsTable(), this);
		oEventBus.unsubscribe("DeletedOperations", "DisableTabs", this.disableTabs, this);
		oEventBus.unsubscribe("DeletedOperations", "EnableTabs", this.enableTabs, this);
	}

});

/*
 "CrDate" : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "T00:00:00",
 "CrTime": "PT" + date.getHours() + "H" + date.getMinutes() + "M" + date.getSeconds() + "S",
 "ChDate" : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "T00:00:00",
 "ChTime": "PT" + date.getHours() + "H" + date.getMinutes() + "M" + date.getSeconds() + "S",
 "ResDate" : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "T00:00:00",
 "ResTime": "PT" + date.getHours() + "H" + date.getMinutes() + "M" + date.getSeconds() + "S"
 
oModel.update("/IssueCaptureSet('0000000001')",oEntry,{
 	method: "PUT",
 	success: function(data){
 		
 	},
 	error: function(e) {
 			zmclaren.prd.util.messages.showErrorMessage(e);
 	}
	 
 });*/