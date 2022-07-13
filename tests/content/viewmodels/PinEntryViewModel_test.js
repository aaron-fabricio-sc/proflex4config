/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ PinEntryViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("PinEntryViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                
                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    observe() {}
                    onInitTextAndData() {}
                    onDeactivated() {}
                    onButtonPressed() {}
                };
                
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("basevm", Wincor.UI.Content.BaseViewModel)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("general", () => {
            it("super is called for all necessary overridden functions", async() => {
                Wincor.UI.Service.Provider.EppService.releaseKeys = jasmine.createSpy("EppService::releaseKeys");
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "observe").and.callThrough();
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onInitTextAndData").and.callThrough();
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onDeactivated").and.callThrough();
                
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                vm.observe("flexMain");
                spyOn(vm, "resetPinDigits");
                spyOn(vm, "installEppHandler");
                expect(Wincor.UI.Content.BaseViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                expect(Wincor.UI.Content.BaseViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);
                vm.onDeactivated();
                expect(Wincor.UI.Content.BaseViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
            });
        });
    
        describe("checks initialize() all modes", () => {
            it("toolingEDM", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = true;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = true;
                Wincor.UI.Content.applicationMode = false;
        
                let vm = new Wincor.UI.Content.PinEntryViewModel();
                expect(vm.eppEnterReady()).toBe(true);
                expect(vm.activatePinContainer()).toBe(false);
            });
    
            it("initialize -> activatePinContainer applicationMode", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = true;
                
                let vm = new Wincor.UI.Content.PinEntryViewModel();
                expect(vm.eppEnterReady()).toBe(false);
                expect(vm.activatePinContainer()).toBe(false);
    
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
    
                await new Promise(resolve => {
                    spyOn(vm.cmdRepos, "setActive")
                        .and
                        .callFake((id, active) => {
                            id === "CANCEL" && active && resolve();
                        });
                });
    
                // basic design mode
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = true;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = false;
                vm = new Wincor.UI.Content.PinEntryViewModel();
                expect(vm.eppEnterReady()).toBe(true);
                expect(vm.eppEtsReady()).toBe(true);
                expect(vm.activatePinContainer()).toBe(false);
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
            });
    
            it("initialize -> designMode", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                // basic design mode
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = true;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = false;
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                expect(vm.eppEnterReady()).toBe(true);
                expect(vm.eppEtsReady()).toBe(true);
            });
    
            it("initialize -> EDM", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                // basic design mode
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = true;
                Wincor.UI.Content.applicationMode = false;
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                expect(vm.eppEnterReady()).toBe(false);
                expect(vm.eppEtsReady()).toBe(false);
            });
        });
        
        describe("other functions", () => {
            it("checks onDeactivated", async() => {
                Wincor.UI.Service.Provider.EppService.releaseKeys = jasmine.createSpy("EppService::releaseKeys");
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = true;
        
                let vm = new Wincor.UI.Content.PinEntryViewModel();
                spyOn(vm, "resetPinDigits").and.callThrough();
                vm.onDeactivated(() => {});
                expect(vm.resetPinDigits).toHaveBeenCalledWith(true);
                expect(vm.pinDigits.length).toBe(4);
                expect(vm.minPinLength).toBe(4);
                expect(vm.maxPinLength).toBe(4);
                expect(vm.currentPinLen()).toBe(0);
                expect(vm.isEtsMode).toBe(false);
                expect(vm.pinOptionsReady()).toBe(false);
                expect(vm.eppEnterReady()).toBe(false);
                expect(vm.eppEtsReady()).toBe(false);
                expect(vm.pinOptionsReady()).toBe(false);
                expect(vm.activatePinContainer()).toBe(false);
            });
   
    
            it("checks onTimeout", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                expect(new Wincor.UI.Content.PinEntryViewModel().onTimeout()).toBe(false);
            });
    
            it("checks onCancel", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                expect(new Wincor.UI.Content.PinEntryViewModel().onCancel()).toBe(false);
            });
    
        });

        describe("user interaction", () => {
            it("resets pin digits on 'clear' command", async() => {
                let claimKeysPromise = new Promise(resolve => {
                    spyOn(Wincor.UI.Service.Provider.EppService, "claimKeys")
                        .and
                        .callFake((keys, prio, fxRet, fx) => {
                            resolve(fx)
                        });
                });
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = true;
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                spyOn(vm, "resetPinDigits").and.callThrough();
                vm.isEtsMode = true;
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
                vm.installEppHandler();
                let fx = await claimKeysPromise;
                fx("CLEAR");
                let correctButtonSet = new Promise(resolve => {
                    spyOn(vm.cmdRepos, "setActive")
                        .and
                        .callFake((id, active) => {
                            id === "CORRECT" && !active && resolve();
                        });
                });
                await correctButtonSet;
                expect(vm.resetPinDigits).toHaveBeenCalledTimes(1);
            });
    
            it("checks resetPinDigits(false)", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = true;
        
                let vm = new Wincor.UI.Content.PinEntryViewModel();
                spyOn(vm, "handleConfirmState");
                vm.resetPinDigits();
                expect(vm.handleConfirmState).toHaveBeenCalledTimes(1);
                expect(vm.pinDigits.length).toBe(4);
                expect(vm.currentPinLen()).toBe(0);
                expect(vm.pinDigitExpected().length).toBe(4);
            });
    
            it("checks resetPinDigits(true)", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = true;
        
                let vm = new Wincor.UI.Content.PinEntryViewModel();
                spyOn(vm, "handleConfirmState");
                vm.resetPinDigits(true);
                expect(vm.handleConfirmState).not.toHaveBeenCalled();
                expect(vm.pinDigits.length).toBe(4);
                expect(vm.currentPinLen()).toBe(0);
                expect(vm.pinDigitExpected().length).toBe(4);
            });
        });
    
        describe("user interaction onButtonPressed", () => {
            it("checks onButtonPressed application mode", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = true;

                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onButtonPressed").and.callThrough();
                
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                vm.onButtonPressed("CANCEL");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();
    
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
                vm.onButtonPressed("CANCEL");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("CANCEL");
            });
    
            it("checks onButtonPressed application mode ETS cancel", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = true;
        
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onButtonPressed").and.callThrough();
                
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                vm.onButtonPressed("CANCEL");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();
    
                vm.isEtsMode = true;
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
                vm.onButtonPressed("CANCEL");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("CANCEL");
            });
    
            it("checks onButtonPressed application mode ETS confirm", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = false;
                Wincor.UI.Content.applicationMode = true;
        
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onButtonPressed").and.callThrough();
                
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                vm.onButtonPressed("CONFIRM");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();
        
                vm.isEtsMode = true;
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
                vm.onButtonPressed("CONFIRM");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("CONFIRM");
            });
    
            it("checks onButtonPressed EDM", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = true;
                Wincor.UI.Content.applicationMode = false;
        
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onButtonPressed").and.callThrough();
                
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                vm.onButtonPressed("CORRECT");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
                vm.onButtonPressed("CORRECT");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();
                vm.onButtonPressed("CANCEL");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("CANCEL");
            });
    
            it("checks onButtonPressed EDM PIN digit", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = true;
                Wincor.UI.Content.applicationMode = false;

                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onButtonPressed").and.callThrough();
                
                const vm = new Wincor.UI.Content.PinEntryViewModel();
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
                spyOn(vm, "nextPinDigit");
                vm.currentPinLen(4);
                vm.onButtonPressed("PIN");
                expect(vm.nextPinDigit).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("PIN");
            });
    
            it("checks onButtonPressed EDM PIN CONFIRM", async() => {
                await injector.require(["GUIAPP/content/viewmodels/PinEntryViewModel"]);
                Wincor.UI.Content.toolingEDM = false;
                Wincor.UI.Content.designMode = false;
                Wincor.UI.Content.designModeExtended = true;
                Wincor.UI.Content.applicationMode = false;

                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onButtonPressed").and.callThrough();
                
                const vm = new Wincor.UI.Content.PinEntryViewModel();
        
                vm.eppEnterReady(true);
                vm.pinOptionsReady(true);
                vm.pinDigitExpected([1]);
                vm.eppEtsReady(true);
                expect(vm.activatePinContainer()).toBe(true);
                vm.currentPinLen(4);
                vm.onButtonPressed("CONFIRM");
                expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("CONFIRM");
            });
    
        });
    });
});

