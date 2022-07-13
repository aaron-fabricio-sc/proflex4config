/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ AdaAdjustmentViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;

    describe("AdaAdjustmentViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                
                Wincor.UI.Service.Provider.AdaService.increaseVolume = jasmine.createSpy("increaseVolume");
                Wincor.UI.Service.Provider.AdaService.decreaseVolume = jasmine.createSpy("decreaseVolume");
                Wincor.UI.Service.Provider.AdaService.increaseRate = jasmine.createSpy("increaseRate");
                Wincor.UI.Service.Provider.AdaService.decreaseRate = jasmine.createSpy("decreaseRate");
                spyOn(Wincor.UI.Content.Commanding, "setActive");

                Wincor.UI.Content.MessageViewModel = class MessageViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                        // be careful: This overwrites any method under the same name both in BaseViewModel AND the viewmodel to test - so the total inheritance chain!
                        // we create a fake baseclass that basically is the BaseViewModel of NameSpaceMock, which is
                        // extended by jasmine.createSpyObj to replace some standard functions with spies.
                        return Object.assign(this, jasmine.createSpyObj("FakeBaseMethods", ["observe", "onDeactivated" ]));
                    }
                    onInitTextAndData() {}
                };
                
                injector
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("knockout", ko)
                    .mock("code-behind/ViewHelper", {})
                    .mock("vm/MessageViewModel", Wincor.UI.Content.MessageViewModel);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });
    
        describe("initialize", () => {
            it("call onInitTextAndData", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], async () => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 3,
                            min: -2,
                            stepSize: 1,
                            val: 0
                        },
                        rate: {
                            max: 2,
                            min: -3,
                            stepSize: 1,
                            val: 0
                        }
                    };
                    
                    spyOn(vm.serviceProvider.ConfigService, "getConfiguration").and.returnValue({VOLUME: "5", RATE: "2"});
                    spyOn(vm.cmdRepos, "whenAvailable").and.callFake(cmd => {
                        return {
                            then: fx => {
                                fx(); // this calls the original anonymous function
                                if(cmd === "VOL_PLUS")
                                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith("VOL_PLUS", false);
                                if(cmd === "VOL_MINUS")
                                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith("VOL_MINUS", true);
                                if(cmd === "RATE_PLUS")
                                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith("RATE_PLUS", false);
                                if(cmd === "RATE_MINUS")
                                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith("RATE_MINUS", true);
                            }
                        }
                    });
                    await vm.onInitTextAndData({dataKeys: [], textKeys: []});
                    expect(vm.serviceProvider.ConfigService.getConfiguration).toHaveBeenCalled();
                    expect(vm.speechEngineConfig.volume.val).toBe(5);
                    expect(vm.speechEngineConfig.rate.val).toBe(2);
                    done();
                }, done.fail);
            });
    
            it("call onInitTextAndData volMax=7", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], async() => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 7,
                            min: 0,
                            stepSize: 1,
                            val: 0
                        },
                        rate: {
                            max: 2,
                            min: -3,
                            stepSize: 1,
                            val: 0
                        }
                    };
            
                    spyOn(vm.serviceProvider.ConfigService, "getConfiguration").and.returnValue({VOLUME: "4", RATE: "0"});
                    spyOn(vm.cmdRepos, "whenAvailable").and.callFake(cmd => {
                        return {
                            then: fx => {
                                fx(); // this calls the original anonymous function
                                if(cmd === "VOL_PLUS")
                                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith("VOL_PLUS", true);
                                if(cmd === "VOL_MINUS")
                                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith("VOL_MINUS", true);
                                if(cmd === "RATE_PLUS")
                                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith("RATE_PLUS", true);
                                if(cmd === "RATE_MINUS")
                                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith("RATE_MINUS", true);
                            }
                        }
                    });
                    await vm.onInitTextAndData({dataKeys: [], textKeys: []});
                    expect(vm.serviceProvider.ConfigService.getConfiguration).toHaveBeenCalled();
                    expect(vm.speechEngineConfig.volume.val).toBe(4);
                    expect(vm.speechEngineConfig.rate.val).toBe(0);
                    done();
                }, done.fail);
            });
    
        });
        
        describe("handles speech commands", () => {
            it("increase volume", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], () => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 3,
                            min: -2,
                            stepSize: 1,
                            val: 0
                        },
                        rate: {
                            max: 2,
                            min: -3,
                            stepSize: 1,
                            val: 0
                        }
                    };
                    const control = vm.speechEngineConfig.volume;
                    const apiControl = Wincor.UI.Service.Provider.AdaService.increaseVolume;
                    vm.handleSpeechCommand(true, true);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(1);
                    vm.handleSpeechCommand(true, true);
                    expect(apiControl).toHaveBeenCalledTimes(2);
                    expect(control.val).toBe(2);
                    vm.handleSpeechCommand(true, true);
                    expect(apiControl).toHaveBeenCalledTimes(3);
                    expect(control.val).toBe(3);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("VOL_PLUS", false);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("VOL_MINUS", true);
                    // call again and check all is same:
                    vm.handleSpeechCommand(true, true);
                    expect(apiControl).toHaveBeenCalledTimes(3);
                    expect(control.val).toBe(3);
    
                    done();
                }, done.fail);
            });
    
            it("increase volume start at 4 and max=7", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], () => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 7,
                            min: 0,
                            stepSize: 1,
                            val: 4
                        },
                        rate: {
                            max: 2,
                            min: -3,
                            stepSize: 1,
                            val: 0
                        }
                    };
                    const control = vm.speechEngineConfig.volume;
                    const apiControl = Wincor.UI.Service.Provider.AdaService.increaseVolume;
                    vm.handleSpeechCommand(true, true);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(5);
                    vm.handleSpeechCommand(true, true);
                    expect(apiControl).toHaveBeenCalledTimes(2);
                    expect(control.val).toBe(6);
                    vm.handleSpeechCommand(true, true);
                    expect(apiControl).toHaveBeenCalledTimes(3);
                    expect(control.val).toBe(7);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("VOL_PLUS", false);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("VOL_MINUS", true);
                    // call again and check all is same:
                    vm.handleSpeechCommand(true, true);
                    expect(apiControl).toHaveBeenCalledTimes(3);
                    expect(control.val).toBe(7);
            
                    done();
                }, done.fail);
            });
    
            it("increase rate", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], () => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 3,
                            min: -2,
                            stepSize: 1,
                            val: 0
                        },
                        rate: {
                            max: 2,
                            min: -3,
                            stepSize: 1,
                            val: 0
                        }
                    };
                    const control = vm.speechEngineConfig.rate;
                    const apiControl = Wincor.UI.Service.Provider.AdaService.increaseRate;
                    vm.handleSpeechCommand(false, true);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(1);
                    vm.handleSpeechCommand(false, true);
                    expect(apiControl).toHaveBeenCalledTimes(2);
                    expect(control.val).toBe(2);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("RATE_PLUS", false);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("RATE_MINUS", true);
                    // call again and check all is same:
                    vm.handleSpeechCommand(false, true);
                    expect(apiControl).toHaveBeenCalledTimes(2);
                    expect(control.val).toBe(2);
            
                    done();
                }, done.fail);
        
            });
    
            it("decrease volume", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], () => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 3,
                            min: -2,
                            stepSize: 1,
                            val: 0
                        },
                        rate: {
                            max: 2,
                            min: -3,
                            stepSize: 1,
                            val: 0
                        }
                    };
                    const control = vm.speechEngineConfig.volume;
                    const apiControl = Wincor.UI.Service.Provider.AdaService.decreaseVolume;
                    vm.handleSpeechCommand(true, false);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(-1);
                    vm.handleSpeechCommand(true, false);
                    expect(apiControl).toHaveBeenCalledTimes(2);
                    expect(control.val).toBe(-2);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("VOL_PLUS", true);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("VOL_MINUS", false);
                    // call again and check all is same:
                    vm.handleSpeechCommand(true, false);
                    expect(apiControl).toHaveBeenCalledTimes(2);
                    expect(control.val).toBe(-2);
                    done();
                }, done.fail);
        
            });
    
            it("decrease rate", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], () => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 3,
                            min: -2,
                            stepSize: 1,
                            val: 0
                        },
                        rate: {
                            max: 2,
                            min: -3,
                            stepSize: 1,
                            val: 0
                        }
                    };
                    const control = vm.speechEngineConfig.rate;
                    const apiControl = Wincor.UI.Service.Provider.AdaService.decreaseRate;
                    vm.handleSpeechCommand(false, false);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(-1);
                    vm.handleSpeechCommand(false, false);
                    expect(apiControl).toHaveBeenCalledTimes(2);
                    expect(control.val).toBe(-2);
                    // call again and check all is same:
                    vm.handleSpeechCommand(false, false);
                    expect(apiControl).toHaveBeenCalledTimes(3);
                    expect(control.val).toBe(-3);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("RATE_PLUS", true);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("RATE_MINUS", false);
                    done();
                }, done.fail);
        
            });
    
            it("decrease volume with step size=2", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], () => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 3,
                            min: -2,
                            stepSize: 2,
                            val: 0
                        },
                        rate: {
                            max: 2,
                            min: -3,
                            stepSize: 1,
                            val: 0
                        }
                    };
                    const control = vm.speechEngineConfig.volume;
                    const apiControl = Wincor.UI.Service.Provider.AdaService.decreaseVolume;
                    vm.handleSpeechCommand(true, false);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(-2);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("VOL_PLUS", true);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("VOL_MINUS", false);
                    // call again and check all is same:
                    vm.handleSpeechCommand(true, false);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(-2);
                    done();
                }, done.fail);
        
            });
    
            it("decrease rate with step size=2", done => {
                injector.require(["GUIAPP/content/viewmodels/AdaAdjustmentViewModel"], () => {
                    const vm = new Wincor.UI.Content.AdaAdjustmentViewModel();
                    // prepare required stuff and check
                    vm.speechEngineConfig = {
                        volume: {
                            max: 3,
                            min: -2,
                            stepSize: 2,
                            val: 0
                        },
                        rate: {
                            max: 2,
                            min: -2,
                            stepSize: 2,
                            val: 0
                        }
                    };
                    const control = vm.speechEngineConfig.rate;
                    const apiControl = Wincor.UI.Service.Provider.AdaService.decreaseRate;
                    vm.handleSpeechCommand(false, false);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(-2);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("RATE_PLUS", true);
                    expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith("RATE_MINUS", false);
                    // call again and check all is same:
                    vm.handleSpeechCommand(false, false);
                    expect(apiControl).toHaveBeenCalledTimes(1);
                    expect(control.val).toBe(-2);
                    done();
                }, done.fail);
        
            });
    
        });
    
    });
});

