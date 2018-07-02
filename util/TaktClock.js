jQuery.sap.declare("zmclaren.prd.util.TaktClock");
/*global zmclaren */
var countdowntime;
var timeout;
var setTime;

zmclaren.prd.util.TaktClock = {
	_oTimeDialog: null,
	onInit: function() {

		//TAKT Time re-do//
		//Bind Operator Buttons

		//TAKT Time re-do//

	},
	onEvent: function() {
		//   //TAKT Time re-do//
		//var oOpModel = null;
		//if (sap.ui.getCore().getModel("OpModel")) {
		//	oOpModel = sap.ui.getCore().getModel("OpModel");
		//} else {
		//	oOpModel = new sap.ui.model.json.JSONModel({
		//		timeout: {}
		//	});
		//	sap.ui.getCore().setModel(oOpModel, "OpModel");
		//}
		// countdowntime = sap.ui.getCore().getEventBus().publish("DetailOperations","CheckTaktTime");
		this.onSetTimeout();
		setTime = $.proxy(this.onSetTimeout,this);
		document.addEventListener("mousemove", setTime);
		document.addEventListener("keypress", setTime);
		document.addEventListener("touchstart", setTime);

		//TAKT Time re-do//
	},
	//TAKT Time re-do//
	onRemoveActionHandler: function() {
		//	var to = sap.ui.getCore().getModel("OpModel").getProperty("/timeout");  
		clearTimeout(timeout);
		document.removeEventListener("mousemove", setTime);
		document.removeEventListener("keypress", setTime);
		document.removeEventListener("touchstart", setTime);
	},
	onUserActionHandler: function() {
		//	var to = sap.ui.getCore().getModel("OpModel").getProperty("/timeout");
		if (timeout !== undefined && timeout !== null) {
			clearTimeout(timeout);
		}
		this.onSetTimeout();
	},
	//TAKT Time re-do//
	onSetTimeout: function(sEvent) {

		var that = this;

		//TAKT Time re-do//	
		if (timeout !== undefined && timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(function() {
			that.onTimeOut();
		}, 45000);
		//TAKT Time re-do//		

	},
	onTimeOut: function() {

		//	var to = sap.ui.getCore().getModel("OpModel").getProperty("/timeout");
		clearTimeout(timeout);
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
			var oTimer = new sap.m.Label({
				width: "950px",
				height: "875px"
			});
			oTimer.addStyleClass("taktTime");
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
				sap.ui.getCore().byId(oTimer.getId()).setText(currTime);
			}, 1000);
			//	 currTime = this.timer();
			oDialog.addContent(oTimer);
			var oButtonClose = new sap.m.Button({
				text: "Close",
				press: $.proxy(function() {
					oDialog.destroy();
					this._oTimeDialog = null;
					// re-register user action event listener

					//	clearTimeout();
					//	that.onIssuesTab();
				}, this)
			});
			oDialog.setEndButton(oButtonClose);

			oDialog.open();
		}

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

		return currTime;
	}

};