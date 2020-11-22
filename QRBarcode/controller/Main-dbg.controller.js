/* global JsBarcode:true */
/* global QRCode:true */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"no/meriton/BarcodeGenerator/util/jsBarcode",
	"no/meriton/BarcodeGenerator/util/qrCode",
	"no/meriton/BarcodeGenerator/model/formatter",
	"sap/ui/unified/ColorPickerPopover",
	"sap/ui/unified/library",
	"sap/ui/core/library"
], function (Controller, BarcodeJs, QrCode, Formatter, ColorPickerPopover, unifiedLibrary, coreLibrary) {
	"use strict";

	var ColorPickerMode = unifiedLibrary.ColorPickerMode,
		ColorPickerDisplayMode = unifiedLibrary.ColorPickerDisplayMode;

	return Controller.extend("no.meriton.BarcodeGenerator.controller.Main", {

		formatter: Formatter,
		onInit: function () {

			var oTitValid = this.getView().byId("titValid"),
				oVBoxQrCode = this.getView().byId("vBoxQrCode"),
				oVBoxBarCode = this.getView().byId("vBoxBarCode"),
				oImgBarcode = this.getView().byId("imgBarcode"),
				oInValue = this.getView().byId("inValue"),
				oSliWidth = this.getView().byId("sliWidth"),
				oSliHeight = this.getView().byId("sliHeight"),
				oSliScale = this.getView().byId("sliScale"),
				oInpBackgroundColor = this.getView().byId("inpBackgroundColor"),
				oInpLineColor = this.getView().byId("inpLineColor"),
				oVbVisibleText = this.getView().byId("vbVisibleText"),
				oVbVisibleTextShowControl = this.getView().byId("vbVisibleTextShowControl"),
				oSegButVisability = this.getView().byId("segButVisability"),
				oSegButPosition = this.getView().byId("segButPosition"),
				oInpFontSize = this.getView().byId("inpFontSize"),
				oInpFontMargin = this.getView().byId("inpFontMargin"),
				oSelType = this.getView().byId("selType");

			this.signalAfterRendering = "QR";
			this.lastRenderedControl = "BR";

			oImgBarcode.addEventDelegate({
				"onAfterRendering": function () {

					if (this.signalAfterRendering === "BR") {

						if (this.lastRenderedControl === "QR") {
							oInpBackgroundColor.setValue("#f7f7f7");
							oInpLineColor.setValue("#2b0d0d");
							oVbVisibleTextShowControl.setVisible(true);

							this.lastRenderedControl = "BR";
						}

						if (oSegButVisability.getSelectedKey() === "false") {
							oVbVisibleText.setVisible(false);
						} else {
							oVbVisibleText.setVisible(true);
						}

						JsBarcode("#" + oImgBarcode.getId(), oInValue.getValue(), {
							format: oSelType.getSelectedKey(),
							background: oInpBackgroundColor.getValue(),
							width: oSliWidth.getValue(),
							height: oSliHeight.getValue(),
							displayValue: oSegButVisability.getSelectedKey(),
							lineColor: oInpLineColor.getValue(),
							textAlign: oSegButPosition.getSelectedKey(),
							fontSize: oInpFontSize.getValue(),
							textMargin: oInpFontMargin.getValue(),
							valid: function (oEvent) {
								if (oEvent) {
									oTitValid.setVisible(false);
									oImgBarcode.setVisible(true);
									oImgBarcode.removeStyleClass("Hidden");
									oInValue.setValueState("None");

								} else {
									oTitValid.setVisible(true);
									oImgBarcode.setVisible(false);
									oImgBarcode.addStyleClass("Hidden");
									oInValue.setValueState("Error");
								}
							}.bind(this)

						});
					}
				}
			}, this);

			oVBoxQrCode.addEventDelegate({
				"onAfterRendering": function () {

					if (this.signalAfterRendering === "QR") {

						if (this.lastRenderedControl === "BR") {
							oInpBackgroundColor.setValue("#000000");
							oInpLineColor.setValue("#ffffff");
							oVbVisibleText.setVisible(false);
							oVbVisibleTextShowControl.setVisible(false);

							this.lastRenderedControl = "QR";
						}

						this.qrCode = new QRCode($("#" + oVBoxQrCode.getId())[0], { //"#" + oImgBarcode.getId()
							width: oSliScale.getValue(),
							height: oSliScale.getValue(),
							colorDark: oInpBackgroundColor.getValue(),
							colorLight: oInpLineColor.getValue(),
							correctLevel: QRCode.CorrectLevel.H
						});

						this.qrCode._htOption.colorDark = oInpBackgroundColor.getValue();
						this.qrCode._htOption.colorLight = oInpLineColor.getValue();

						oInValue.setValueState("None");

						oTitValid.setVisible(false);
						oImgBarcode.setVisible(true);
						oImgBarcode.removeStyleClass("Hidden");

						this.qrCode.makeCode(oInValue.getValue());
					}
				}
			}, this);

			this.rerenderControl();
		},

		onLiveChange: function () {
			this.rerenderControl();
		},

		rerenderControl: function () {

			var oImgBarcode = this.getView().byId("imgBarcode"),
				oVBoxBarCode = this.getView().byId("vBoxBarCode"),
				oVBoxQrCode = this.getView().byId("vBoxQrCode"),
				oGridScaleQR = this.getView().byId("gridScaleQR"),
				oGridScaleBR = this.getView().byId("gridScaleBR"),
				oSelType = this.getView().byId("selType");

			if (oSelType.getSelectedKey() === "QR") {
				this.signalAfterRendering = "QR";
				oImgBarcode.setVisible(false);
				oVBoxBarCode.setVisible(false);
				oVBoxQrCode.setVisible(true);

				oGridScaleQR.setVisible(true);
				oGridScaleBR.setVisible(false);
				oVBoxQrCode.rerender();
			} else {
				this.signalAfterRendering = "BR";
				oImgBarcode.setVisible(true);
				oVBoxBarCode.setVisible(true);
				oVBoxQrCode.setVisible(false);
				oGridScaleQR.setVisible(false);
				oGridScaleBR.setVisible(true);
				oImgBarcode.rerender();
			}
		},

		openSimplifiedModeSample: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.oColorPickerSimplifiedPopover) {
				this.oColorPickerSimplifiedPopover = new ColorPickerPopover("oColorPickerSimpplifiedPopover", {
					colorString: "#f7f7f7",
					displayMode: ColorPickerDisplayMode.Simplified,
					mode: ColorPickerMode.HSL,
					change: this.handleChange.bind(this)
				});
			}
			this.oColorPickerSimplifiedPopover.openBy(oEvent.getSource());
		},

		handleChange: function (oEvent) {
			var oView = this.getView(),
				oInput = oView.byId(this.inputId);

			oInput.setValue(oEvent.getParameter("hex"));
			oInput.setValueState("None");
			this.inputId = "";

			this.rerenderControl();
		},

		onReset: function () {

			var oSelType = this.getView().byId("selType");
			//	this.getView().byId("selType").setSelectedKey("QR");

			this.getView().byId("inValue").setValue();
			/*	this.getView().byId("sliWidth"),*/
			this.getView().byId("sliHeight").setValue(70);
			this.getView().byId("sliScale").setValue(128);
 
			if (oSelType.getSelectedKey() === "QR") {
				this.getView().byId("inpBackgroundColor").setValue("#000000");
				this.getView().byId("inpLineColor").setValue("#ffffff");
				this.getView().byId("vbVisibleText").setVisible(false);
				this.getView().byId("vbVisibleTextShowControl").setVisible(false);
			} else {
				this.getView().byId("inpBackgroundColor").setValue("#f7f7f7");
				this.getView().byId("inpLineColor").setValue("#2b0d0d");
				this.getView().byId("inpFontMargin").setValue(10);
				this.getView().byId("inpFontSize").setValue(20);
				this.getView().byId("segButPosition").setSelectedKey("center")
				this.getView().byId("segButVisability").setSelectedKey("true")
				this.getView().byId("vbVisibleTextShowControl").setVisible(true);
			}

			this.rerenderControl();
		},

		onPrint: function () {
			var ctrlString = "width=1200px, height=400px",
				wind = window.open("", "Print", ctrlString),
				sContent = "",
				oImgBarcode = this.getView().byId("imgBarcode"),
				oVBoxQrCode = this.getView().byId("vBoxQrCode"),
				oSelType = this.getView().byId("selType");

			if (oSelType.getSelectedKey() === "QR") {
				sContent = $("#" + oVBoxQrCode.getId())[0].outerHTML;
			} else {
				sContent = $("#" + oImgBarcode.getId())[0].outerHTML;
			}

			wind.document.write(sContent);
			wind.document.close();
			wind.focus();
			wind.print();
		}
	});
});