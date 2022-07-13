/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ViewModelHelper_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;


    describe("ViewModelHelper", () => {

        beforeEach(done => {
            this.durandalPluginsRouter = {
                on: jasmine.createSpy("router.on").and.returnValue(Promise.resolve()),
                compositionComplete: jasmine.createSpy("routerCompositionComplete"),
                navigate: jasmine.createSpy("routerNavigate"),
                trigger: jasmine.createSpy("routerTrigger")
            };
    
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                Wincor.UI.Content.ViewHelper.setEvent = jasmine.createSpy("setEvent");
                
                injector
                    .mock("jquery", jQuery)
                    .mock("knockout", ko)
                    .mock("extensions", bundle.ext)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("lib/hammer.min", this.Hammer)
                    .mock("code-behind/ViewHelper", Wincor.UI.Content.ViewHelper)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("vm-util/Ada", {})
                    .mock("plugins/router", this.durandalPluginsRouter)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding);
                
                done();
            });
            jasmine.clock().install();
        });

        afterEach(() => {
            injector.remove();
            jasmine.clock().uninstall();
        });

        describe("convert", () => {
            it("to boolean", async() => {
                let [viewModelHelper] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                expect(viewModelHelper.convertToBoolean(void 0)).toBe(false);
                expect(viewModelHelper.convertToBoolean(null)).toBe(false);
                expect(viewModelHelper.convertToBoolean("")).toBe(false);
                expect(viewModelHelper.convertToBoolean("abc")).toBe(false);
                expect(viewModelHelper.convertToBoolean("0")).toBe(false);
                expect(viewModelHelper.convertToBoolean("00")).toBe(false);
                expect(viewModelHelper.convertToBoolean("1")).toBe(true);
                expect(viewModelHelper.convertToBoolean("11")).toBe(true);
                expect(viewModelHelper.convertToBoolean("true")).toBe(true);
                expect(viewModelHelper.convertToBoolean("TRUE")).toBe(true);
                expect(viewModelHelper.convertToBoolean("True")).toBe(true);
                expect(viewModelHelper.convertToBoolean("False")).toBe(false);
                expect(viewModelHelper.convertToBoolean("FALSE")).toBe(false);
                expect(viewModelHelper.convertToBoolean("false")).toBe(false);
                expect(viewModelHelper.convertToBoolean(true)).toBe(true);
                expect(viewModelHelper.convertToBoolean(false)).toBe(false);
            });

            it("to integer", async() => {
                let [viewModelHelper] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                expect(viewModelHelper.convertToInt(void 0)).toBe(0);
                expect(viewModelHelper.convertToInt(null)).toBe(0);
                expect(viewModelHelper.convertToInt(null, -1)).toBe(-1);
                expect(viewModelHelper.convertToInt("")).toBe(0);
                expect(viewModelHelper.convertToInt("", -1)).toBe(-1);
                expect(viewModelHelper.convertToInt("abc")).toBe(0);
                expect(viewModelHelper.convertToInt("abc", -1)).toBe(-1);
                expect(viewModelHelper.convertToInt("0")).toBe(0);
                expect(viewModelHelper.convertToInt("0", 4711)).toBe(0);
                expect(viewModelHelper.convertToInt(1)).toBe(1);
                expect(viewModelHelper.convertToInt(1.5)).toBe(1);
                expect(viewModelHelper.convertToInt("1.5")).toBe(1);
                expect(viewModelHelper.convertToInt("4711")).toBe(4711);
                expect(viewModelHelper.convertToInt("4711abc")).toBe(4711);
                expect(viewModelHelper.convertToInt("abc4711")).toBe(0);
                expect(viewModelHelper.convertToInt("abc4711", 456)).toBe(456);
            });
        });
        
        describe("default popups", () => {
            beforeEach(() => {
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend");
                Wincor.UI.Service.Provider.ViewService.getTimeoutValue = jasmine.createSpy("getTimeoutValue");
                Wincor.UI.Content.ViewModelContainer.preserve = jasmine.createSpy("preserve");
            });

            it("timeoutQuestion passes 'onContinue' function in popup options", async () => {
                let [viewModelHelper] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                spyOn(Wincor.UI.Content.ViewModelContainer, "dispatch");
                spyOn(viewModelHelper, "showPopupMessage");
                let result = await viewModelHelper.timeoutQuestion();
                expect(Wincor.UI.Content.ViewModelContainer.dispatch.calls.first().args[0]).toBe("onTimeout");
                expect(Wincor.UI.Content.ViewModelContainer.dispatch.calls.first().args[1]).toEqual([]);
                expect(typeof Wincor.UI.Content.ViewModelContainer.dispatch.calls.first().args[2]).toBe("function");
                expect(viewModelHelper.showPopupMessage).toHaveBeenCalledTimes(1);
                expect(viewModelHelper.showPopupMessage.calls.first().args[0]).toBe("messagepopup.component.html");
                expect(typeof viewModelHelper.showPopupMessage.calls.first().args[1]).toBe("object");
                expect(Wincor.hasMember(viewModelHelper.showPopupMessage.calls.first().args[1], "onContinue")).toBe(true);
                expect(typeof viewModelHelper.showPopupMessage.calls.first().args[1].onContinue).toBe("function");
                Wincor.UI.Content.ViewModelContainer.dispatch.calls.reset();
                // now call and check dispatcher
                viewModelHelper.showPopupMessage.calls.first().args[1].onContinue();
                expect(Wincor.UI.Content.ViewModelContainer.dispatch.calls.first().args[0]).toBe("onContinue");
                expect(Wincor.UI.Content.ViewModelContainer.dispatch.calls.first().args[1]).toEqual(["TIMEOUT_POPUP"]);
            });

            it("cancelQuestion passes 'onContinue' function in popup options", async () => {
                let [viewModelHelper] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                spyOn(Wincor.UI.Content.ViewModelContainer, "dispatch");
                spyOn(viewModelHelper, "showPopupMessage");
                let result = await viewModelHelper.cancelQuestion();
                expect(viewModelHelper.showPopupMessage).toHaveBeenCalledTimes(1);
                expect(viewModelHelper.showPopupMessage.calls.first().args[0]).toBe("messagepopup.component.html");
                expect(typeof viewModelHelper.showPopupMessage.calls.first().args[1]).toBe("object");
                expect(Wincor.hasMember(viewModelHelper.showPopupMessage.calls.first().args[1], "onContinue")).toBe(true);
                expect(typeof viewModelHelper.showPopupMessage.calls.first().args[1].onContinue).toBe("function");
                Wincor.UI.Content.ViewModelContainer.dispatch.calls.reset();
                // now call and check dispatcher
                viewModelHelper.showPopupMessage.calls.first().args[1].onContinue();
                expect(Wincor.UI.Content.ViewModelContainer.dispatch.calls.first().args[0]).toBe("onContinue");
                expect(Wincor.UI.Content.ViewModelContainer.dispatch.calls.first().args[1]).toEqual(["CANCEL_POPUP"]);
            });
        });

        describe("popup functions", () => {
            it("checks showPopupMessage container life-cycle ", async () => {
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend");
                Wincor.UI.Content.ViewModelContainer.preserve = jasmine.createSpy("preserve");


                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                viewModelHelper.showPopupMessage("", { type: "LANGUAGE_POPUP" }, () => {
                    expect(Wincor.UI.Content.Commanding.suspend).toHaveBeenCalledWith([], "LANGUAGE_POPUP");
                    expect(Wincor.UI.Content.ViewModelContainer.preserve).toHaveBeenCalledTimes(1);
                })
            });

            it("checks showPopupMessage on view with endless timeout ", async() => {
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend");
                Wincor.UI.Content.ViewModelContainer.preserve = jasmine.createSpy("preserve");
                Wincor.UI.Content.ViewHelper.setEvent = jasmine.createSpy("setEvent").and.callFake(evt => {
                    jQuery(evt).on("uipopupmessage", (event, triggerObject) => {
                        expect(triggerObject.component).toBe("selection.component");
                        triggerObject.callback(true);
                    });
                });
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.timeout = -1;
                Wincor.UI.Service.Provider.ViewService.inputTimeout = 100;
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend").and.returnValue([]);
                spyOn(viewModelHelper, "startTimer").and.callThrough();
                spyOn(viewModelHelper, "hidePopupMessage");
                viewModelHelper.showPopupMessage("selection.component", {type: "LANGUAGE_POPUP"}, () => {
                    expect(viewModelHelper.startTimer).toHaveBeenCalledTimes(1);
                });
                expect(viewModelHelper.hidePopupMessage).not.toHaveBeenCalled();
                jasmine.clock().tick(110);
                expect(viewModelHelper.hidePopupMessage).toHaveBeenCalledTimes(1);
            });
    
            it("checks showPopupMessage set data-popup-type", async() => {
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend");
                Wincor.UI.Content.ViewModelContainer.preserve = jasmine.createSpy("preserve");
                Wincor.UI.Content.ViewHelper.setEvent = jasmine.createSpy("setEvent").and.callFake(evt => {
                    jQuery(evt).on("uipopupmessage", (event, triggerObject) => {
                        expect(triggerObject.component).toBe("selection.component");
                        triggerObject.callback(true);
                    });
                });
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend").and.returnValue([]);
                jQuery("body").attr("data-view-key", "TestViewKey");
                viewModelHelper.showPopupMessage("selection.component", {type: "LANGUAGE_POPUP"}, () => {
                    expect(jQuery("[data-view-key]").first().attr("data-popup-type")).toBe("LANGUAGE_POPUP");
                    jQuery("body").removeAttr("data-view-key");
                });
            });
    
            it("checks hidePopupMessage removes data-popup-type", async() => {
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend");
                Wincor.UI.Content.Commanding.resume = jasmine.createSpy("resume");
                Wincor.UI.Content.ViewModelContainer.preserve = jasmine.createSpy("preserve");
                Wincor.UI.Content.ViewModelContainer.isPreserved = jasmine.createSpy("isPreserved").and.returnValue(false);
                Wincor.UI.Content.ViewModelContainer.cleanNodes = jasmine.createSpy("cleanNodes");
                Wincor.UI.Content.ViewModelContainer.clean = jasmine.createSpy("clean");
                Wincor.UI.Content.ViewModelContainer.deactivateViewModels = jasmine.createSpy("deactivateViewModels");
                Wincor.UI.Content.ViewHelper.setEvent = jasmine.createSpy("setEvent").and.callFake(evt => {
                    jQuery(evt).on("uiremovepopupmessage", (event, data) => {
                        data.result.promise = Promise.resolve();
                    });
                });
    
                let [viewModelHelper] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                spyOn(viewModelHelper, "notifyViewUpdated");
                viewModelHelper.popupOptions = {
                    type: "LANGUAGE_POPUP",
                    onContinue: jasmine.createSpy("onContinue")
                };
                spyOn(viewModelHelper, "isPopupActive").and.returnValue(true);
                let $body = jQuery("body");
                $body.attr({"data-view-key": "TestViewKey", "data-popup-type": "LANGUAGE_POPUP"});
                await viewModelHelper.hidePopupMessage();
                expect($body.first().attr("data-popup-type")).toBeUndefined();
            });
    
            it("checks hidePopupMessage container life-cycle isPreserved=true", async() => {
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend");
                Wincor.UI.Content.Commanding.resume = jasmine.createSpy("resume");
                Wincor.UI.Content.ViewModelContainer.preserve = jasmine.createSpy("preserve");
                Wincor.UI.Content.ViewModelContainer.isPreserved = jasmine.createSpy("isPreserved").and.returnValue(true);
                Wincor.UI.Content.ViewModelContainer.cleanNodes = jasmine.createSpy("cleanNodes");
                Wincor.UI.Content.ViewModelContainer.remove = jasmine.createSpy("remove");
                Wincor.UI.Content.ViewModelContainer.clean = jasmine.createSpy("clean");
                Wincor.UI.Content.ViewModelContainer.deactivateViewModels = jasmine.createSpy("deactivateViewModels");
    
                Wincor.UI.Content.ViewHelper.setEvent = jasmine.createSpy("setEvent").and.callFake(evt => {
                    jQuery(evt).on("uiremovepopupmessage", (event, data) => {
                        data.result.promise = Promise.resolve();
                    });
                });
    
                let [viewModelHelper] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                spyOn(viewModelHelper, "notifyViewUpdated");
                const OPTIONS = {
                    type: "LANGUAGE_POPUP",
                    onContinue: jasmine.createSpy("onContinue")
                };
                viewModelHelper.popupOptions = OPTIONS;
                spyOn(viewModelHelper, "isPopupActive").and.returnValue(true);
                spyOn(viewModelHelper, "clearTimer");
                spyOn(Wincor.UI.Content.ViewModelContainer, "restore");
                await viewModelHelper.hidePopupMessage();
                expect(viewModelHelper.clearTimer).toHaveBeenCalledTimes(1);
                expect(viewModelHelper.notifyViewUpdated).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.ViewModelContainer.isPreserved).toHaveBeenCalledTimes(2);
                expect(Wincor.UI.Content.ViewModelContainer.cleanNodes).toHaveBeenCalledWith(false, false);
                expect(Wincor.UI.Content.ViewModelContainer.remove).toHaveBeenCalledWith(void 0, false);
                expect(OPTIONS.onContinue).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.ViewModelContainer.deactivateViewModels).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.ViewModelContainer.clean).toHaveBeenCalledWith(false, false);
                expect(Wincor.UI.Content.ViewModelContainer.restore).toHaveBeenCalledTimes(1);
            });
    
            it("checks hidePopupMessage container life-cycle isPreserved=false", async() => {
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend");
                Wincor.UI.Content.Commanding.resume = jasmine.createSpy("resume");
                Wincor.UI.Content.ViewModelContainer.preserve = jasmine.createSpy("preserve");
                Wincor.UI.Content.ViewModelContainer.isPreserved = jasmine.createSpy("isPreserved").and.returnValue(false);
                Wincor.UI.Content.ViewModelContainer.cleanNodes = jasmine.createSpy("cleanNodes");
                Wincor.UI.Content.ViewModelContainer.clean = jasmine.createSpy("clean");
                Wincor.UI.Content.ViewModelContainer.deactivateViewModels = jasmine.createSpy("deactivateViewModels");
        
                Wincor.UI.Content.ViewHelper.setEvent = jasmine.createSpy("setEvent").and.callFake(evt => {
                    jQuery(evt).on("uiremovepopupmessage", (event, data) => {
                        data.result.promise = Promise.resolve();
                    });
                });

                let [viewModelHelper] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                spyOn(viewModelHelper, "notifyViewUpdated");
                const OPTIONS = {
                    type: "LANGUAGE_POPUP",
                    onContinue: jasmine.createSpy("onContinue")
                };
                viewModelHelper.popupOptions = OPTIONS;
                spyOn(viewModelHelper, "isPopupActive").and.returnValue(true);
                spyOn(Wincor.UI.Content.ViewModelContainer, "restore");
                await viewModelHelper.hidePopupMessage();

                expect(viewModelHelper.notifyViewUpdated).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.ViewModelContainer.isPreserved).toHaveBeenCalledTimes(2);
                expect(Wincor.UI.Content.ViewModelContainer.cleanNodes).not.toHaveBeenCalled();
                expect(OPTIONS.onContinue).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.ViewModelContainer.deactivateViewModels).not.toHaveBeenCalled();
                expect(Wincor.UI.Content.ViewModelContainer.clean).not.toHaveBeenCalled();
                expect(Wincor.UI.Content.ViewModelContainer.restore).not.toHaveBeenCalled();
        
            });
    
        });
    
        describe("timer functions", () => {
            it("checks timeout popup activation also ensures that a timerInfo is available", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                viewModelHelper.isPopupActive(true);
                viewModelHelper.popupOptions.type = "TIMEOUT_POPUP";
                spyOn(viewModelHelper, "getTimerInfo").and.returnValue({});
                const isActive = viewModelHelper.isTimeoutPopupActive();
                expect(viewModelHelper.getTimerInfo).toHaveBeenCalled();
                expect(isActive).toBe(true);
            });
    
            it("addTimer", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                viewModelHelper.addTimerId(111);
                expect(viewModelHelper.getTimerIds().includes(111)).toBe(true);
            });
    
            it("get timer info (no timer exists with name)", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                const name = "TIMEOUT_POPUP";
                const info = viewModelHelper.getTimerInfo(name);
                expect(info).toBeUndefined();
            });
    
            it("add a timer with name and get the timer info afterwards", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                const name = "TIMEOUT_POPUP";
                viewModelHelper.addTimerId(111, name, 30000);
                const info = viewModelHelper.getTimerInfo(name);
                expect(info.name).toBe(name);
                expect(info.timeLen).toBe(30000);
                expect(info.id).toBe(111);
            });
    
            it("get timer info without name arg", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                const name = "TIMEOUT_POPUP";
                viewModelHelper.popupOptions.type = name;
                viewModelHelper.addTimerId(111, name, 30000);
                const info = viewModelHelper.getTimerInfo();
                expect(info.name).toBe(name);
                expect(info.timeLen).toBe(30000);
                expect(info.id).toBe(111);
            });
    
            it("startTimer", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                let timeout = jasmine.createSpy("timerTimeout");
                let tid = viewModelHelper.startTimer(10).onTimeout(timeout);
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(true);
                jasmine.clock().tick(10);
                expect(timeout).toHaveBeenCalledTimes(1);
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(false);
            });
    
            it("startTimer with name", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                const name = "TIMEOUT_POPUP";
                let timeout = jasmine.createSpy("timerTimeout");
                let tid = viewModelHelper.startTimer(1000, name).onTimeout(timeout);
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(true);
                const info = viewModelHelper.getTimerInfo(name);
                expect(info.name).toBe(name);
                expect(info.timeLen).toBe(1000);
                expect(info.id).toBe(tid);
                jasmine.clock().tick(1000);
                expect(timeout).toHaveBeenCalledTimes(1);
                // timer infos must be removed after timeout
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(false);
                expect(viewModelHelper.getTimerInfo(name)).toBeUndefined();
            });
    
            it("refresh timer", async() => {
                Wincor.UI.Content.ViewHelper.stopTimeoutProgressBar = jasmine.createSpy("stopTimeoutProgressBar");
                Wincor.UI.Content.ViewHelper.runTimeoutProgressBar = jasmine.createSpy("runTimeoutProgressBar");
    
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
    
                const name = "TIMEOUT_POPUP";
                let timeout = jasmine.createSpy("timerTimeout");
                let tid = viewModelHelper.startTimer(1000, name).onTimeout(timeout);
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(true);
                const info = viewModelHelper.getTimerInfo(name);
                expect(info.name).toBe(name);
                expect(info.timeLen).toBe(1000);
                expect(info.id).toBe(tid);
                let oldTid = tid;
                expect(timeout).not.toHaveBeenCalled();
                tid = viewModelHelper.refreshTimer(2000, name);
                expect(oldTid !== tid).toBe(true); // new timer expected
                expect(timeout).not.toHaveBeenCalled();
                expect(Wincor.UI.Content.ViewHelper.stopTimeoutProgressBar).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.ViewHelper.runTimeoutProgressBar).toHaveBeenCalledTimes(1);
    
                jasmine.clock().tick(1000);
                expect(timeout).not.toHaveBeenCalled();
                jasmine.clock().tick(1000);
    
                expect(timeout).toHaveBeenCalledTimes(1);
                // timer infos must be removed after timeout
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(false);
                expect(viewModelHelper.getTimerInfo(name)).toBeUndefined();
            });
    
            it("checks getTimerIds", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                let timeout = jasmine.createSpy("timerTimeout");
                let tid = viewModelHelper.startTimer(10).onTimeout(timeout);
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(true);
                jasmine.clock().tick(10);
                expect(timeout).toHaveBeenCalledTimes(1);
                // expect that timeout-timer has been removed from timer list
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(false);
            });
    
            it("clearTimer with id", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                let timeout = jasmine.createSpy("timerTimeout");
                let tid = viewModelHelper.startTimer(10).onTimeout(timeout);
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(true);
                jasmine.clock().tick(9);
                viewModelHelper.clearTimer(tid);
                expect(viewModelHelper.getTimerIds().includes(tid)).toBe(false);
                jasmine.clock().tick(12);
                expect(timeout).not.toHaveBeenCalled();
            });
    
            it("clearTimer all timers before timeout", async() => {
                let result = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelHelper"]);
                let viewModelHelper = result[0];
                let timeout_1 = jasmine.createSpy("timerTimeout1");
                let timeout_2 = jasmine.createSpy("timerTimeout2");
                let tid_1 = viewModelHelper.startTimer(10).onTimeout(timeout_1);
                let tid_2 = viewModelHelper.startTimer(20).onTimeout(timeout_2);
                expect(viewModelHelper.getTimerIds().includes(tid_1)).toBe(true);
                expect(viewModelHelper.getTimerIds().includes(tid_2)).toBe(true);
                jasmine.clock().tick(9);
                viewModelHelper.clearTimer();
                expect(viewModelHelper.getTimerIds().length).toBe(0);
                jasmine.clock().tick(30);
                expect(timeout_1).not.toHaveBeenCalled();
                expect(timeout_2).not.toHaveBeenCalled();
            });
        });

    });
});