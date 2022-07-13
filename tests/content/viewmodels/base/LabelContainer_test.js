/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ LabelContainer_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let Wincor;

    describe("LabelContainer", () => {

        beforeEach(done => {
            injector = new Squire();

            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ['jquery']
                    .forEach((dependency) => {
                        injector.mock(dependency, {});
                    });
                injector.mock("ui-content", Wincor.UI.Content);

                done();
            });

        });

        afterEach(() => {
            injector.remove();
        });

        describe("basic functionality", () => {

            it("ignores case sensitivity for keys", done => {
                Wincor.UI.Content.designMode = true;
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"], (ko, LabelContainer) => {
                    // LabelContainer should treat the 2 label keys as one label key
                    // we assume that it's a mistake if someone got 2 label with character equality but case sensitivity e.g. Yes versus YES
                    const cont = new LabelContainer();
                    const val1 = cont.getLabel("CurrencySymbol_Yes", "$", null);
                    const val2 = cont.getLabel("CurrencySymbol_YES", "€", null);
                    expect(ko.isObservable(val1)).toBe(true);
                    expect(ko.isObservable(val2)).toBe(true);
                    expect(val1()).toBe("$");
                    expect(val2()).toBe("$");

                    done();
                }, done.fail);
            });

            it("returns [n/a] for items not set in app mode", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"], (ko, LabelContainer) => {

                    const cont = new LabelContainer();
                    const val = cont.getLabel("TEST");
                    expect(ko.isObservable(val)).toBe(true);
                    expect(val()).toBe("[n/a]");

                    done();
                }, done.fail);
            });

            it("returns given default-value for items not set in designMode", done => {
                Wincor.UI.Content.designMode = true;
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"], (ko, LabelContainer) => {

                    const cont = new LabelContainer();
                    const val = cont.getLabel("TEST", "defaultForDesignMode");
                    expect(ko.isObservable(val)).toBe(true);
                    expect(val()).toBe("defaultForDesignMode");

                    done();
                }, done.fail);
            });

            it("can cope with missing default-value for items not set in designMode", done => {
                Wincor.UI.Content.designMode = true;
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"], (ko, LabelContainer) => {

                    const cont = new LabelContainer();
                    const val = cont.getLabel("TEST");
                    expect(ko.isObservable(val)).toBe(true);
                    expect(val()).toBe("");

                    done();
                }, done.fail);
            });

        });


        describe("dynamic runtime data", () => {

            it("resolves runtime data", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"], (ko, LabelContainer) => {

                    const FAKE_VM = {
                        testAttribute: "SUCCESS"
                    };

                    Wincor.UI.Content.ViewModelContainer.getById = jasmine.createSpy("vmContainer.getById")
                        .and.callFake(() => {
                            return FAKE_VM;
                        });

                    const cont = new LabelContainer();

                    // check normal resolving
                    cont.push("TEST", "{#flexMain.testAttribute#}");
                    const val = cont.getLabel("TEST");
                    expect(Wincor.UI.Content.ViewModelContainer.getById).toHaveBeenCalledTimes(1);
                    expect(Wincor.UI.Content.ViewModelContainer.getById).toHaveBeenCalledWith("flexMain");
                    expect(ko.isObservable(val)).toBe(true);
                    expect(val()).toBe("SUCCESS");

                    done();
                }, done.fail);
            });

            it("resolves runtime data with context map", async () => {
                let [ko, LabelContainer] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"]);

                const cont = new LabelContainer();
                let context = {key1: "val1", key2: "val2"};
                let contextB = {key1: "wrong", key2: "stuff"};
                // check normal resolving
                cont.push("TEST", "{#key1#}{#key2#}", true, context);
                const val = cont.getLabel("TEST", null,context);
                expect(ko.isObservable(val)).toBe(true);
                expect(val()).toBe("val1val2");
                // creating computeds of a single label is done in baseViewModel's getLabel function!
                // calling getLabel with a new context does not change anything for the container
                const val2 = cont.getLabel("TEST", null,contextB);
                expect(ko.isObservable(val2)).toBe(true);
                expect(val2()).toBe("val1val2");
            });

            it("strips key-names correctly from originals with format options", async () => {
                let [ko, LabelContainer] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"]);

                Wincor.UI.Service.Provider.FormatService.format = jasmine.createSpy("FormatService::format")
                    .and.callFake((v, pattern, callback, isSynchronous) => {
                        let value = v.raw;
                        let output = "";
                        expect(value).toEqual("val2");
                        expect(pattern.indexOf("#conditional") === 0);
                        let replacementObject = JSON.parse(pattern.replace("#conditional", ""));
                        if(value in replacementObject) {
                            output = replacementObject[value];
                        } else if("*" in replacementObject){
                            output = replacementObject["*"];
                        } else {
                            output = value;
                        }
                        output = output.replace("$val", value);
                        v.result = output;
                    });
                const cont = new LabelContainer();
                let context = {key1: "val1", key2: "val2"};
                // check normal resolving
                cont.push("TEST", "{#key1#}{#key2;#conditional{\"val2\":\"replacement2\"}#}", true, context);
                const val = cont.getLabel("TEST", null,context);
                expect(ko.isObservable(val)).toBe(true);
                expect(val()).toBe("val1replacement2");
                expect(Object.keys(cont.labelItems.get("test").replacementMap).join("_").includes("#conditional")).toBe(false);
            });

            it("resolves runtime data observables dynamically", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"], (ko, LabelContainer) => {

                    const FAKE_VM = {
                        testAttribute: ko.observable("SUCCESS"),
                        testAttribute1: ko.observable("AGAIN")
                    };

                    Wincor.UI.Content.ViewModelContainer.getById = jasmine.createSpy("vmContainer.getById")
                        .and.callFake(() => {
                            return FAKE_VM;
                        });

                    const cont = new LabelContainer();

                    // check normal resolving
                    cont.push("TEST", "{#flexMain.testAttribute#}_{#flexTest.testAttribute1#}");
                    const val = cont.getLabel("TEST");
                    expect(Wincor.UI.Content.ViewModelContainer.getById).toHaveBeenCalledTimes(2);
                    expect(Wincor.UI.Content.ViewModelContainer.getById.calls.argsFor(0)).toEqual(["flexTest"]);
                    expect(Wincor.UI.Content.ViewModelContainer.getById.calls.argsFor(1)).toEqual(["flexMain"]);
                    expect(ko.isObservable(val)).toBe(true);
                    expect(val()).toBe("SUCCESS_AGAIN");
                    FAKE_VM.testAttribute("DYNAMIC");
                    expect(val()).toBe("DYNAMIC_AGAIN");

                    done();
                }, done.fail);
            });

            it("resolves missing runtime data to given default", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/LabelContainer"], (ko, LabelContainer) => {

                    Wincor.UI.Content.ViewModelContainer.getById = jasmine.createSpy("vmContainer.getById")
                        .and.callFake(() => {
                            return {};
                        });

                    const cont = new LabelContainer();

                    cont.push("TEST", "{#flexMain.testAttribute;;DEFAULT_VALUE#}");
                    let val = cont.getLabel("TEST");
                    expect(Wincor.UI.Content.ViewModelContainer.getById).toHaveBeenCalledTimes(1);
                    expect(Wincor.UI.Content.ViewModelContainer.getById).toHaveBeenCalledWith("flexMain");
                    expect(ko.isObservable(val)).toBe(true);
                    expect(val()).toBe("DEFAULT_VALUE");

                    done();
                }, done.fail);
            });
        });
    });
});
