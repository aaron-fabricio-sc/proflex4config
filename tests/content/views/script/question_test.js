/*
 $MOD$ question_test.js 4.3.1-201130-21-086c3328-1a04bc7d
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
        },
        getById: id => {
            if(id === "flexMain") {
                return Wincor.UI.Content.MessageViewModel;
            } else {
                return {};
            }
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

    describe("question code-behind", () => {

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
                    .mock("vm/MessageViewModel", {})
                    .mock("vm-util/UICommanding", commandMock);

                // Code behind needs something to instantiate...
                Wincor.UI.Content.MessageViewModel = {};
    
                Wincor.UI.Content.ObjectManager = {
                    reCalculateObjects: jasmine.createSpy("reCalculateObjects"),
                    getElementById: () => { return null;}
                };
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("life-cycle", () => {
            it("compositionUpdated calls compositionUpdatedObservable ok", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/question", "mocks"]);
                let question = result[0];
                let mocks = result[1];
                const base = mocks.mocks["code-behind/baseaggregate"];
                base.compositionUpdated = jasmine.createSpy("compositionUpdated");
                base.config.VIEW_ANIMATIONS_ON = true;
                Wincor.UI.Content.MessageViewModel.compositionUpdatedObservable = jasmine.createSpy("compositionUpdatedObservable");
                question.compositionUpdated();
                expect(base.compositionUpdated).toHaveBeenCalled();
                expect(Wincor.UI.Content.MessageViewModel.compositionUpdatedObservable).toHaveBeenCalled();
                await container.whenActivated();
                expect(Wincor.UI.Content.ObjectManager.reCalculateObjects).toHaveBeenCalled();
            });
    
            it("compositionUpdated calls compositionUpdatedObservable not existing", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/question", "mocks"]);
                let question = result[0];
                let mocks = result[1];
                const base = mocks.mocks["code-behind/baseaggregate"];
                base.compositionUpdated = jasmine.createSpy("compositionUpdated");
                base.config.VIEW_ANIMATIONS_ON = true;
                // expecting no problems that compositionUpdatedObservable isn't existing anymore
                Wincor.UI.Content.MessageViewModel.compositionUpdatedObservable = null;
                question.compositionUpdated();
                expect(base.compositionUpdated).toHaveBeenCalled();
                await container.whenActivated();
                expect(Wincor.UI.Content.ObjectManager.reCalculateObjects).toHaveBeenCalled();
            });
        });
    });
});

