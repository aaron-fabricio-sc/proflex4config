/*
 $MOD$ amountselection_test.js 4.3.1-210511-21-5ea44998-1a04bc7d
 */

// eslint-disable-next-line no-undef
define(['lib/Squire'], function (Squire) {
    
    let injector;
    let Wincor;
    
    const container = {
        adaModule: null,
        dispatch: () => { //empty
        },
        add: () => { //empty
        },
        doInit: () => { //empty
        },
        getById: id => {
            if(id === "flexMain") {
                return Wincor.UI.Content.MessageViewModel;
            }
            return {};
        },
        whenActivated: () => {
            return Promise.resolve();
        }
    };

    const commandMock = {
        commands: {},
        get: (id) => {
            return commandMock.commands[id];
        },
        registerForAction: () => { //empty
        },
        registerForStateChange: () => { //empty
        }
    };

    const baseAggregateMock = {
        extend: (a)=>{ return a; },
        activate: () => { //empty
        },
        container: container,
        config: {
            viewType: "softkey"
        }
    };

    describe("amountselection code-behind", () => {

        beforeEach(done => {
            injector = new Squire();
    
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                injector
                    .mock("vm/ListViewModel", {})
                    .mock("code-behind/baseaggregate", baseAggregateMock);
    
                Wincor.UI.Content.ObjectManager = {
                    reCalculateObjects: jasmine.createSpy("reCalculateObjects"),
                    getElementById: () => { return null; }
                };
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("life-cycle", () => {
            it("compositionUpdated refreshes grid on touch viewset", async () => {
                let result = await injector.require(["GUIAPP/content/views/script/amountselection", "mocks"]);
                let amountSelection = result[0];
                let mocks = result[1];
                const base = mocks.mocks["code-behind/baseaggregate"];
                base.compositionUpdated = jasmine.createSpy("compositionUpdated");
                base.config.viewType = "touch";
                amountSelection.compositionUpdated();
                expect(base.compositionUpdated).toHaveBeenCalled();
                expect(Wincor.UI.Content.ObjectManager.reCalculateObjects).toHaveBeenCalled();
            });
    
            it("compositionUpdated must not refresh grid on softkey viewset", async () => {
                let result = await injector.require(["GUIAPP/content/views/script/amountselection", "mocks"]);
                let amountSelection = result[0];
                let mocks = result[1];
                const base = mocks.mocks["code-behind/baseaggregate"];
                base.compositionUpdated = jasmine.createSpy("compositionUpdated");
                base.config.viewType = "softkey";
                amountSelection.compositionUpdated();
                expect(base.compositionUpdated).toHaveBeenCalled();
                expect(Wincor.UI.Content.ObjectManager.reCalculateObjects).not.toHaveBeenCalled();
            });
        });
    });
});

