/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ accountinformation_test.js 4.3.1-201130-21-086c3328-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;


    const container = {
        adaModule: null,
        dispatch: () => {//empty
        },
        add: () => {//empty
        },
        doInit: () => {//empty
        }
    };

    const commandMock = {
        commands: {},
        get: (id) => {
            return commandMock.commands[id];
        },
        registerForAction: () => {//empty
        },
        registerForStateChange: () => {//empty
        }
    };

    const baseAggregateMock = {
        extend: (a)=>{return a},
        activate: ()=>{//empty
        },
        container: container,
        config: {
            viewType: "softkey"
        }
    };

    describe("accountinformation code-behind", () => {

        describe("activate", () => {

            beforeEach(done => {
                injector = new Squire();

                injector.require(["NamespaceMock"], bundle => {
                    Wincor = window.Wincor = bundle.createWincor();
                    ko = Wincor.ko = window.ko = bundle.ko;
                    jQuery = window.jQuery = bundle.jQuery;
                    injector
                        .mock("content/viewmodels/base/ViewModelContainer", container)
                        .mock("flexuimapping", {
                            buildGuiKey: () => {// stub
                            }
                        })
                        .mock("jquery", jQuery)
                        .mock("extensions", bundle.ext)
                        .mock("knockout", ko)
                        .mock("ui-content", {
                            designMode: Wincor.UI.Content.designMode
                        })
                        .mock("vm-container", container)
                        .mock("code-behind/baseaggregate", baseAggregateMock)
                        .mock("vm/AccountInformationViewModel", {})
                        .mock("vm-util/UICommanding", commandMock);

                    // Code behind needs something to instantiate...
                    Wincor.UI.Content.AccountInformationViewModel = jasmine.createSpy()
                        .and.callFake(function() {
                            this.TEST="";
                        });
                    done();
                });
            });

            afterEach(() => {
                injector.remove();
            });

            it("returns the object when required", done => {
                injector.require(["GUIAPP/content/views/script/accountinformation"], accinf => {
                    expect(typeof accinf).toBe("object");
                    done();
                }, done.fail);
            });

            it("adds at least one viewmodel and calls doInit on Container", done => {
                injector.require(["GUIAPP/content/views/script/accountinformation"], accinf => {
                    spyOn(container, "add");
                    spyOn(baseAggregateMock, "activate");

                    accinf.activate();
                    expect(Wincor.UI.Content.AccountInformationViewModel).toHaveBeenCalledTimes(1);
                    expect(container.add).toHaveBeenCalled();
                    expect(baseAggregateMock.activate).toHaveBeenCalledTimes(1);
                    expect(container.add.calls.first().args[0] instanceof Object).toBe(true);
                    expect(container.add.calls.first().args[1]).toEqual(['flexMain', { visibleLimits: { min: 0, max: 4, leftOnly: true } }]);
                    done();
                }, done.fail);
            });
        });
    });
});

