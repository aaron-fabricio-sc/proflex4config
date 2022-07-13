/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ UIMovements_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let Wincor;
    let jQuery;

    describe("UIMovements", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                this.Hammer_add = jasmine.createSpy("Hammer::Manager::add");
                this.Hammer_on = jasmine.createSpy("Hammer::Manager::on");
                this.Hammer_off = jasmine.createSpy("Hammer::Manager::off");
                this.Hammer_stop = jasmine.createSpy("Hammer::Manager::stop");
                this.Hammer_destroy = jasmine.createSpy("Hammer::Manager::destroy");
                this.Hammer_remove = jasmine.createSpy("Hammer::Manager::remove");
                this.Hammer_get = jasmine.createSpy("Hammer::Manager::get");
                this.Hammer_recognizers = [];
                const testContext = this;
                Wincor = window.Wincor = bundle.createWincor();
                jQuery = window.jQuery = bundle.jQuery;
                this.Hammer = {
                    DIRECTION_NONE: 1,
                    DIRECTION_LEFT: 2,
                    DIRECTION_RIGHT: 4,
                    DIRECTION_UP: 8,
                    DIRECTION_DOWN: 16,
    
                    DIRECTION_HORIZONTAL: 2 | 4,
                    DIRECTION_VERTICAL: 8 | 16,
                    DIRECTION_ALL: 24 | 6,
    
                    Manager: function() {
                        this.add = testContext.Hammer_add;
                        this.on = testContext.Hammer_on;
                        this.off = testContext.Hammer_off;
                        this.destroy = testContext.Hammer_destroy;
                        this.remove = testContext.Hammer_remove;
                        this.get = testContext.Hammer_get;
                        this.recognizers = testContext.Hammer_recognizers;
                        this.stop = testContext.Hammer_stop;
                    },
                    Tap: function() {

                    },
                    Pan: function() {

                    }
                };

                injector
                    .mock("jquery", bundle.jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("lib/hammer.min", this.Hammer)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding);
                ['config/Config', 'lib/jquery.transit.min']
                    .forEach((dep) => {
                        injector.mock(dep, {});
                    });
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("ObjectManager", () => {
            it("does not process touch notifications without GestureElements", async () => {
                const [objMgr] = await injector.require(['GUIAPP/content/viewmodels/base/UIMovements']);
                expect(objMgr._touchedNotified).toBe(false);
                expect(objMgr.touched.bind(objMgr)).not.toThrow();
                expect(objMgr._touchedNotified).toBe(false);
            });

            it("processes touch notifications once a second", async () => {
                spyOn(Wincor.UI.Service.Provider.ViewService, "refreshTimeout");
                const [objMgr] = await injector.require(['GUIAPP/content/viewmodels/base/UIMovements']);
                jasmine.clock().install();
                objMgr.mobs= [1,2,3];
                expect(objMgr._touchedNotified).toBe(false);
                expect(objMgr.touched.bind(objMgr)).not.toThrow();
                expect(objMgr._touchedNotified).toBe(true);
                expect(Wincor.UI.Service.Provider.ViewService.refreshTimeout).toHaveBeenCalledTimes(1);
                expect(objMgr.touched.bind(objMgr)).not.toThrow(); // call again, refresh should not be called!
                expect(Wincor.UI.Service.Provider.ViewService.refreshTimeout).toHaveBeenCalledTimes(1);
                jasmine.clock().tick(1001);
                expect(objMgr._touchedNotified).toBe(false);
                jasmine.clock().uninstall();
            });

            it("can recalculate objects on change", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    // prepare manager with some fake objects
                    const SOME_ID = "someId";
                    spyOn(objMgr, "calculateGridByElement").and.returnValue({});
                    let mob1 = {
                        x: 100,
                        y: 100,
                        lastPosition: {},
                        containerId: SOME_ID,
                        scrollbar: {},
                        grid: {
                            element: {}
                        },
                        jElement: {
                            css: jasmine.createSpy("css")
                        },
                        calculateDimensions: jasmine.createSpy("calculateDimensions"),
                        calculateLogicalPositions: jasmine.createSpy("calculateLogicalPositions"),
                        calculateScrollbar: jasmine.createSpy("calculateScrollbar"),
                        getGridPositions: jasmine.createSpy("getGridPositions").and.returnValue({logicalPositions2dArray: null, left: []})
                    };
                    objMgr.containerIds.add(SOME_ID);
                    objMgr.grids[SOME_ID] = {left: []};
                    objMgr.mobs.push(mob1);
                    spyOn(objMgr, "snapAllToGrid").and.returnValue(Promise.resolve());
                    spyOn(objMgr, "packAll").and.returnValue(Promise.resolve());

                    objMgr.reCalculateObjects()
                        .then(() => {
                            // expect recalculations have been done and positions have been reset
                            expect(objMgr.calculateGridByElement).toHaveBeenCalledTimes(1);
                            expect(mob1.calculateScrollbar).toHaveBeenCalledTimes(1);
                            expect(mob1.calculateDimensions).toHaveBeenCalledTimes(1);
                            expect(mob1.x).toBe(0);
                            expect(mob1.y).toBe(0);
                            expect(mob1.lastPosition).toBeFalsy();
                            expect(mob1.jElement.css).toHaveBeenCalledWith({x: 0, y: 0}, 0,  "linear");
                            // check order of recalculations to assure correctness of results
                            expect(mob1.calculateDimensions).toHaveBeenCalledBefore(objMgr.calculateGridByElement);
                            expect(objMgr.calculateGridByElement).toHaveBeenCalledBefore(mob1.calculateLogicalPositions);
                            expect(mob1.calculateLogicalPositions).toHaveBeenCalledBefore(mob1.calculateScrollbar);
                            done();
                        });
                });
            });

            it("can recalculate only objects of specific containerIds on change", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    // prepare manager with some fake objects
                    const SOME_ID = "someId";
                    const SOME_OTHER_ID = "someOtherId";
                    spyOn(objMgr, "calculateGridByElement").and.returnValue({});
                    let mob1 = {
                        x: 100,
                        y: 100,
                        lastPosition: {},
                        containerId: SOME_ID,
                        scrollbar: {},
                        grid: {
                            element: {}
                        },
                        jElement: {
                            css: jasmine.createSpy("css")
                        },
                        calculateDimensions: jasmine.createSpy("calculateDimensions"),
                        calculateLogicalPositions: jasmine.createSpy("calculateLogicalPositions"),
                        calculateScrollbar: jasmine.createSpy("calculateScrollbar"),
                        getGridPositions: jasmine.createSpy("getGridPositions").and.returnValue({logicalPositions2dArray: null, left: []})
                    };
                    let mob2 = {
                        x: 100,
                        y: 100,
                        lastPosition: {},
                        containerId: SOME_OTHER_ID,
                        scrollbar: {},
                        grid: {
                            element: {}
                        },
                        jElement: {
                            css: jasmine.createSpy("css")
                        },
                        calculateDimensions: jasmine.createSpy("calculateDimensions"),
                        calculateLogicalPositions: jasmine.createSpy("calculateLogicalPositions"),
                        calculateScrollbar: jasmine.createSpy("calculateScrollbar"),
                        getGridPositions: jasmine.createSpy("getGridPositions").and.returnValue({logicalPositions2dArray: null, left: []})
                    };
                    objMgr.containerIds.add(SOME_ID);
                    objMgr.containerIds.add(SOME_OTHER_ID);
                    objMgr.grids[SOME_ID] = {left: []};
                    objMgr.mobs.push(mob1);
                    objMgr.grids[SOME_OTHER_ID] = {left: []};
                    objMgr.mobs.push(mob2);
                    spyOn(objMgr, "snapAllToGrid").and.returnValue(Promise.resolve());
                    spyOn(objMgr, "pack").and.returnValue(Promise.resolve());

                    objMgr.reCalculateObjects([SOME_OTHER_ID])
                        .then(() => {
                            // expect recalculations have been done and positions have been reset
                            expect(objMgr.calculateGridByElement).toHaveBeenCalledTimes(1);
                            expect(mob1.calculateScrollbar).not.toHaveBeenCalled();
                            expect(mob1.calculateDimensions).not.toHaveBeenCalledTimes(1);
                            expect(mob1.jElement.css).not.toHaveBeenCalledWith({x: 0, y: 0}, 0,  "linear");
                            expect(mob2.calculateScrollbar).toHaveBeenCalled();
                            expect(mob2.calculateDimensions).toHaveBeenCalledTimes(1);
                            expect(mob2.jElement.css).toHaveBeenCalledWith({x: 0, y: 0}, 0,  "linear");
                            done();
                        });
                });
            });

            it("can deliver all container ids", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    const ID_1 = "ID_1";
                    const ID_2 = "ID_2";
                    const ID_3 = "ID_3";
                    let result = objMgr.getContainerIds();
                    expect(result).toEqual([]);
                    objMgr.containerIds.add(ID_1);
                    objMgr.containerIds.add(ID_2);
                    objMgr.containerIds.add(ID_3);
                    result = objMgr.getContainerIds();
                    expect(result).toEqual([ID_1, ID_2, ID_3]);
                    done();
                });
            });

            it("can pack all containers", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    const ID_1 = "ID_1";
                    const ID_2 = "ID_2";
                    const ID_3 = "ID_3";
                    objMgr.containerIds.add(ID_1);
                    objMgr.containerIds.add(ID_2);
                    objMgr.containerIds.add(ID_3);
                    spyOn(objMgr, "pack");
                    let result = objMgr.packAll();
                    expect(result.then !== void 0).toBe(true);
                    result
                        .then(() => {
                            expect(objMgr.pack).toHaveBeenCalledTimes(3);
                            expect(objMgr.pack.calls.argsFor(0).length).toBe(1);
                            expect(objMgr.pack.calls.argsFor(0)[0]).toBe(ID_1);
                            expect(objMgr.pack.calls.argsFor(1).length).toBe(1);
                            expect(objMgr.pack.calls.argsFor(1)[0]).toBe(ID_2);
                            expect(objMgr.pack.calls.argsFor(2).length).toBe(1);
                            expect(objMgr.pack.calls.argsFor(2)[0]).toBe(ID_3);
                            done();
                        });
                });
            });

            it("can calculate all logical positions of managed mobs", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    let mob1 = {
                        calculateLogicalPositions: jasmine.createSpy("calculateLogicalPositions1"),
                    };
                    let mob2 = {
                        calculateLogicalPositions: jasmine.createSpy("calculateLogicalPositions2"),
                    };
                    let mob3 = {
                        calculateLogicalPositions: jasmine.createSpy("calculateLogicalPositions3"),
                    };

                    objMgr.mobs.push(mob1);
                    objMgr.mobs.push(mob2);
                    objMgr.mobs.push(mob3);

                    objMgr.calculateLogicalPositions();
                    expect(mob1.calculateLogicalPositions).toHaveBeenCalledTimes(1);
                    expect(mob2.calculateLogicalPositions).toHaveBeenCalledTimes(1);
                    expect(mob3.calculateLogicalPositions).toHaveBeenCalledTimes(1);
                    done();
                });
            });


            it("can triggerUpdate", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    let t = objMgr.trigger();
                    expect(typeof t).toBe("number");
                    objMgr.triggerUpdate();
                    expect(t).not.toBe(objMgr.trigger());
                    done();
                });
            });

            it("can getElementById", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    const el = document.createElement("div");
                    el.id = "test123";
                    const TEST_MOB = {
                        element: el
                    };
                    objMgr.mobs.push(TEST_MOB);

                    const e = objMgr.getElementById(el.id);
                    expect(e).toBe(TEST_MOB);
                    done();
                });
            });

            it("refreshes ViewService timeout at most once a second when receiving events", done => {
                Wincor.UI.Service.Provider.ViewService.refreshTimeout = jasmine.createSpy("ViewService::refreshTimeout");
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    jasmine.clock().install();
                    // touched function only works if at least one mob is registered
                    const el = document.createElement("div");
                    el.id = "test123";
                    const TEST_MOB = {
                        element: el
                    };
                    objMgr.mobs.push(TEST_MOB);

                    expect(objMgr._touchedNotified).toBe(false);
                    objMgr.touched(); // all simulated events should result in only one call to refreshTimeout
                    objMgr.touched();
                    objMgr.touched();
                    objMgr.touched();
                    objMgr.touched();
                    objMgr.touched();
                    expect(objMgr._touchedNotified).toBe(true);
                    expect(Wincor.UI.Service.Provider.ViewService.refreshTimeout).toHaveBeenCalledTimes(1);
                    // should reset after a second
                    jasmine.clock().tick(1001);// after a second the next round is ready
                    expect(objMgr._touchedNotified).toBe(false);
                    objMgr.touched();
                    expect(objMgr._touchedNotified).toBe(true);
                    expect(Wincor.UI.Service.Provider.ViewService.refreshTimeout).toHaveBeenCalledTimes(2);
                    jasmine.clock().uninstall();
                    done();
                });
            });

            it("can calculate element order by logical positions", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    const CONTAINER_ID = "TEST_CONTAINER";
                    const PROMINENT_CLASS = "PROMINENT_CLASS";
                    let x = 0;
                    let y = 0;
                    // create some objects to sort
                    const OBJECTS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
                        .map((val, index, ar)  => {
                            return {
                                grid: {},
                                element: {
                                    id: val
                                },
                                // this one does the magic for current logical positioning
                                getLogicalPosition: () => {
                                    const halfArrayLen = ar.length / 2;
                                    return {
                                        x: index < halfArrayLen ? index : index-halfArrayLen,
                                        y: index < halfArrayLen ? 0 : 1
                                    };
                                }
                            }
                        });

                    // x and y values will arrange them in 2 rows and 5 cols like:
                    // A   B   C   D   E
                    // F   G   H   I   J
                    //
                    // ordering is defined column-wise, so expect the following order to be returned:

                    const EXPECTED_ORDER = ["A", "F", "B", "G", "C", "H", "D", "I", "E", "J"];

                    spyOn(objMgr, "getElementsByContainer").and.callFake(containerId => {
                        expect(containerId).toEqual(CONTAINER_ID);
                        return OBJECTS;
                    });

                    const ret = objMgr.getElementOrder(CONTAINER_ID, PROMINENT_CLASS);
                    expect(ret.order.length).toBe(OBJECTS.length);
                    expect(ret.order).toEqual(EXPECTED_ORDER);
                    expect(ret.prominent.length).toBe(0);
                    done();
                });
            });

            it("calculates grid from given element", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    const el = document.createElement("div");
                    document.body.appendChild(el);
                    el.id = "test";
                    el.style.top = "0px";
                    el.style.left = "0px";
                    el.style.maxHeight = "100px";
                    el.style.maxWidth = "200px";
                    el.style.minHeight = "100px";
                    el.style.minWidth = "200px";
                    el.style.margin = "0px 0px 0px 0px";
                    el.style.padding = "0px 0px 0px 0px";
                    el.style.position = "absolute";

                    const grid = objMgr.calculateGridByElement("test");
                    expect(typeof grid).toBe("object");
                    expect(grid.width).toBe(200);
                    expect(grid.height).toBe(100);
                    expect(grid.top).toBe(0);
                    expect(grid.bottom).toBe(100);
                    expect(grid.right).toBe(200);
                    document.body.removeChild(el);
                    done();
                });
            });

            it("calculates grid from given element considering padding and margin", done => {
                injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                    const el = document.createElement("div");
                    document.body.appendChild(el);
                    el.id = "test";
                    el.style.top = "0px";
                    el.style.left = "0px";
                    el.style.maxHeight = "100px";
                    el.style.maxWidth = "200px";
                    el.style.minHeight = "100px";
                    el.style.minWidth = "200px";
                    el.style.margin = "0px 0px 0px 0px";
                    el.style.padding = "10px 20px 10px 20px"; // top, right, bottom, left
                    el.style.position = "absolute";
                    const gestures = {
                        Pan: {
                            direction:'DIRECTION_VERTICAL',
                            events:['panstart','panmove','panend'],
                            enable: false,
                        }
                    };

                    const cont = {
                        top: 100,
                        left: 100,
                        width: 400,
                        height: 200
                    };

                    let grid = objMgr.calculateGridByElement("test");
                    expect(typeof grid).toBe("object");
                    expect(grid.width).toBe(240);
                    expect(grid.height).toBe(120);
                    expect(grid.top).toBe(10);
                    expect(grid.bottom).toBe(130);
                    expect(grid.right).toBe(240);

                    // now increase margins
                    el.style.margin = "10px 10px 10px 10px";
                    grid = objMgr.calculateGridByElement("test");
                    expect(grid.width).toBe(260);
                    expect(grid.height).toBe(140);
                    expect(grid.top).toBe(10);
                    expect(grid.bottom).toBe(150);
                    expect(grid.right).toBe(270);

                    document.body.removeChild(el);
                    done();
                });
            });

        });

        describe("GestureElement", () => {
            const CONTAINER_ID = "containerIdTest";
            beforeEach(() => {
                this.MOB_CONFIG = {
                    element: jQuery("<div>")[0],
                    target: this.element,
                    grid: {
                        top: 100,
                        left: 20
                    },
                    options: {},
                    gestures: {},
                    containment:{
                        top: 0,
                        bottom: 1000,
                        left: 0,
                        right: 1000,
                        width: 1000,
                        height: 1000
                    },
                    containerId: CONTAINER_ID,
                    listElementName: void 0,
                    notificationHandler: void 0,
                };
            });

            describe("movement", () => {
                it("skips moveToLogicalPosition if position is the current", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                        // @first let mgr create GestureElement
                        let configMob1 = this.MOB_CONFIG;

                        objMgr.add(configMob1);
                        expect(objMgr.mobs.length).toBe(1);
                        let ourMob = objMgr.mobs[0];

                        // fake some stuff
                        ourMob.jElement.transition = jasmine.createSpy("transition").and.callFake(({x:x, y:y}) => {
                            ourMob.x = x;
                            ourMob.y = y;
                        });

                        let cssSpy = spyOn(ourMob.jElement, "css");
                        ourMob.gestures = {};
                        ourMob.hammertime = {
                            recognizers: [],
                            remove: jasmine.createSpy("hammertime::remove"),
                            off: jasmine.createSpy("hammertime::off"),
                            destroy: jasmine.createSpy("hammertime::destroy")
                        };
                        spyOn(ourMob, "getLogicalPosition").and.returnValue({x: 123, y: 123});
                        spyOn(ourMob, "getLogicalDimensions");
                        ourMob.moveToLogicalPosition(123,123)
                            .then(() => {
                                expect(ourMob.getLogicalDimensions).not.toHaveBeenCalled();
                                done();
                            }).catch(done.fail)
                    });
                });

                it("rejects moveToLogicalPosition if no grid is configured", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                        // @first let mgr create GestureElement
                        let configMob1 = this.MOB_CONFIG;
                        configMob1.grid = {};

                        objMgr.add(configMob1);
                        expect(objMgr.mobs.length).toBe(1);
                        let ourMob = objMgr.mobs[0];

                        // fake some stuff
                        ourMob.jElement.transition = jasmine.createSpy("transition").and.callFake(({x:x, y:y}) => {
                            ourMob.x = x;
                            ourMob.y = y;
                        });

                        let cssSpy = spyOn(ourMob.jElement, "css");
                        ourMob.gestures = {};
                        ourMob.hammertime = {
                            recognizers: [],
                            remove: jasmine.createSpy("hammertime::remove"),
                            off: jasmine.createSpy("hammertime::off"),
                            destroy: jasmine.createSpy("hammertime::destroy")
                        };
                        spyOn(ourMob, "getLogicalDimensions");
                        ourMob.moveToLogicalPosition(123,123)
                            .then(() => {
                                done.fail();
                            })
                            .catch(() => {
                                // do not pass done reference to catch function directly!
                                // Otherwise a passed Error would fail the test
                                done();
                            })
                    });
                });

                it("does NOT move parent container (in opposite direction) in list mode if mob hits border", async () => {
                    const [objMgr] = await injector.require(['GUIAPP/content/viewmodels/base/UIMovements']);
                    // @first let mgr create GestureElement
                    let configMob1 = this.MOB_CONFIG;
                    configMob1.grid = {};
                    configMob1.listElementName = "mylistelement";

                    objMgr.add(configMob1);
                    expect(objMgr.mobs.length).toBe(1);
                    let ourMob = objMgr.mobs[0];

                    // fake some stuff
                    spyOn(objMgr, "getElementsByContainer");
                    spyOn(objMgr, "getParentContainer").and.returnValue("sampleParentContainer");
                    ourMob.elementMovesContainer(123,123, {});
                    expect(objMgr.getElementsByContainer).not.toHaveBeenCalled();
                });

                it("does move parent container (in opposite direction) if mob hits border", async () => {
                    const [objMgr] = await injector.require(['GUIAPP/content/viewmodels/base/UIMovements']);
                    // @first let mgr create GestureElement
                    let configMob1 = this.MOB_CONFIG;
                    configMob1.grid = {};

                    objMgr.add(configMob1);
                    expect(objMgr.mobs.length).toBe(1);
                    let ourMob = objMgr.mobs[0];

                    // fake some stuff
                    spyOn(objMgr, "getElementsByContainer").and.returnValue([{}]);
                    spyOn(objMgr, "getParentContainer").and.returnValue("sampleParentContainer");
                    ourMob.elementMovesContainer(123,123, {}); // event lacks direction to drop through, so we don't have to mock up following calls
                    expect(objMgr.getElementsByContainer).toHaveBeenCalled();
                });
            });

            describe("disposing", () => {
                it("frees references and resets manipulated layout", done => {
                    // we create an own function chain to avoid the container running "dispose" on it's own
                    Wincor.UI.Content.ViewModelContainer = Wincor.createMockObject("whenActivated.then.then", Wincor.UI.Content.ViewModelContainer, true);
                    injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                        // @first let mgr create GestureElement
                        let configMob1 = this.MOB_CONFIG;

                        objMgr.add(configMob1);
                        expect(objMgr.mobs.length).toBe(1);
                        let ourMob = objMgr.mobs[0];

                        // fake some stuff
                        ourMob.jElement.transition = jasmine.createSpy("transition").and.callFake(({x:x, y:y}) => {
                            ourMob.x = x;
                            ourMob.y = y;
                        });

                        let cssSpy = spyOn(ourMob.jElement, "css");
                        ourMob.gestures = {"test":{}}; // for remove to be called in hammer fake

                        spyOn(Wincor.UI.Content.ViewModelContainer, "whenActivationStarted")
                            .and.callFake(() => {
                                return {
                                    then: resolver => {
                                        resolver();
                                        expect(cssSpy).toHaveBeenCalledWith({x: 0, y: 0});
                                        done();
                                    }
                                };
                            });

                        expect(ourMob.jElement).not.toBeUndefined();
                        ourMob.move(10, 10);
                        expect(ourMob.x).toBe(0); //only the ending event will set x, y of our element if there is no grid but a containment
                        expect(ourMob.y).toBe(0);
                        jasmine.clock().install();
                        ourMob.dispose();
                        jasmine.clock().tick(1000);
                        expect(ourMob.jElement).toBeNull();
                        expect(ourMob.element).toBeNull();
                        expect(ourMob.boundToElement).toBeNull();
                        expect(ourMob.hammertime).toBeNull();
                        expect(ourMob.objectManager).toBeNull();
                        expect(ourMob.gestures).toBeNull();
                        expect(ourMob.grid).toBeNull();
                        expect(ourMob.gridPositions).toBeNull();
                        expect(ourMob.lastGesture).toBeNull();
                        expect(ourMob.jElement).toBeNull();
                        expect(ourMob.target).toBeNull();
                        expect(ourMob.parent).toBeNull();
                        expect(ourMob.notificationHandler).toBeNull();
                        expect(ourMob.collisionHandler).toBeNull();
                        expect(ourMob.recognizerOpts).toBeNull();
                        // check if hammer gets disposed
                        expect(this.Hammer_off).toHaveBeenCalled();
                        expect(this.Hammer_remove).toHaveBeenCalled();
                        expect(this.Hammer_destroy).toHaveBeenCalled();
                        jasmine.clock().uninstall();
                    });
                });
    
                it("ensures jElement (container) is null after reset to x/y 0 position", done => {
                    // we create an own function chain to avoid the container running "dispose" on it's own
                    Wincor.UI.Content.ViewModelContainer = Wincor.createMockObject("whenActivated.then.then", Wincor.UI.Content.ViewModelContainer, true);
                    injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                        // @first let mgr create GestureElement
                        let configMob1 = this.MOB_CONFIG;
            
                        objMgr.add(configMob1);
                        expect(objMgr.mobs.length).toBe(1);
                        let ourMob = objMgr.mobs[0];
            
                        // fake some stuff
                        ourMob.jElement.transition = jasmine.createSpy("transition").and.callFake(({x: x, y: y}) => {
                            ourMob.x = x;
                            ourMob.y = y;
                        });
            
                        let cssSpy = spyOn(ourMob.jElement, "css");
                        ourMob.gestures = {"test": {}}; // for remove to be called in hammer fake
            
                        spyOn(Wincor.UI.Content.ViewModelContainer, "whenActivationStarted")
                            .and.callFake(() => {
                                return {
                                    then: resolver => {
                                        resolver();
                                        expect(cssSpy).toHaveBeenCalledWith({x: 0, y: 0});
                                        done();
                                    }
                                };
                            });
            
                        expect(ourMob.jElement).not.toBeNull();
                        ourMob.move(10, 10);
                        expect(ourMob.x).toBe(0); //only the ending event will set x, y of our element if there is no grid but a containment
                        expect(ourMob.y).toBe(0);
                        jasmine.clock().install();
                        ourMob.dispose();
                        jasmine.clock().tick(10);
                        expect(ourMob.jElement).toBeNull();
                        jasmine.clock().uninstall();
                    });
                });
    
                it("does not invalidate the managers options object (may throw during last recognition cycle otherwise)", async() => {
                    // we create an own function chain to avoid the container running "dispose" on it's own
                    Wincor.UI.Content.ViewModelContainer = Wincor.createMockObject("whenActivated.then.then", Wincor.UI.Content.ViewModelContainer, true);
                    let [objMgr] = await injector.require(['GUIAPP/content/viewmodels/base/UIMovements']);
                    // @first let mgr create GestureElement
                    let configMob1 = this.MOB_CONFIG;

                    objMgr.add(configMob1);
                    expect(objMgr.mobs.length).toBe(1);
                    let ourMob = objMgr.mobs[0];
                    let nulled = false;
                    Object.defineProperty(ourMob.hammertime, "options", {
                        set: (arg) => {
                            if (!arg) {
                                nulled = true;
                            }
                        }
                    });


                    // fake some stuff
                    ourMob.jElement.transition = jasmine.createSpy("transition").and.callFake(({x:x, y:y}) => {
                        ourMob.x = x;
                        ourMob.y = y;
                    });

                    let cssSpy = spyOn(ourMob.jElement, "css");
                    ourMob.gestures = {"test":{}}; // for remove to be called in hammer fake

                    ourMob.dispose();
                    // check if hammer gets disposed
                    expect(this.Hammer_stop).toHaveBeenCalledWith(true);
                    expect(this.Hammer_off).toHaveBeenCalled();
                    expect(this.Hammer_remove).toHaveBeenCalled();
                    expect(this.Hammer_destroy).toHaveBeenCalled();
                    expect(nulled).toBe(false);
                });
            });

            describe("Calculations", () => {

                it("reCalculateObjects invalidates lastPosition before recalculation", async () => {
                    const [objMgr] = await injector.require(['GUIAPP/content/viewmodels/base/UIMovements']);
                    const CONTAINER_IDS = ["TEST_ID"];
                    const FAKE_OBJS = [{
                        calculateDimensions: jasmine.createSpy("calculateDimensions"),
                        calculateLogicalPositions: jasmine.createSpy("calculateLogicalPositions"),
                        jElement: {
                            css: () => {}
                        }
                    }];
                    const lastPositionSpy = jasmine.createSpy("lastPosition");
                    Object.defineProperty(FAKE_OBJS[0], "lastPosition", {
                        set: lastPositionSpy
                    });
                    objMgr.getElementsByContainer = jasmine.createSpy("getElementsByContainer").and.callFake(() => {
                        return FAKE_OBJS;
                    });
                    spyOn(objMgr, "snapAllToGrid");
                    await objMgr.reCalculateObjects(CONTAINER_IDS);
                    expect(lastPositionSpy).toHaveBeenCalledBefore(FAKE_OBJS[0].calculateDimensions);
                    expect(FAKE_OBJS[0].calculateDimensions).toHaveBeenCalledBefore(FAKE_OBJS[0].calculateLogicalPositions);
                });
    
                it("reCalculateObjects ensure container CSS reset before recalculation", async() => {
                    const [objMgr] = await injector.require(['GUIAPP/content/viewmodels/base/UIMovements']);
                    const CONTAINER_IDS = ["TEST_ID"];
                    const FAKE_OBJS = [{
                        calculateDimensions: jasmine.createSpy("calculateDimensions"),
                        calculateLogicalPositions: jasmine.createSpy("calculateLogicalPositions"),
                        jElement: {
                            css: jasmine.createSpy("css")
                        }
                    }];
                    const lastPositionSpy = jasmine.createSpy("lastPosition");
                    Object.defineProperty(FAKE_OBJS[0], "lastPosition", {
                        set: lastPositionSpy
                    });
                    objMgr.getElementsByContainer = jasmine.createSpy("getElementsByContainer").and.callFake(() => {
                        return FAKE_OBJS;
                    });
                    spyOn(objMgr, "snapAllToGrid");
                    await objMgr.reCalculateObjects(CONTAINER_IDS);
                    expect(lastPositionSpy).toHaveBeenCalledBefore(FAKE_OBJS[0].calculateDimensions);
                    expect(FAKE_OBJS[0].jElement.css).toHaveBeenCalledBefore(FAKE_OBJS[0].calculateDimensions);
                    expect(FAKE_OBJS[0].calculateDimensions).toHaveBeenCalledBefore(FAKE_OBJS[0].calculateLogicalPositions);
                });
    
                it("skips calculation of logical positions on no grid or container available", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                        // @first let mgr create GestureElement
                        const CONTAINER_ID = "containerIdTest";
                        let configMob1 = {
                            element: jQuery("<div>")[0],
                            target: this.element,
                            options: {},
                            gestures: {},
                            containment:{
                                top: 0,
                                bottom: 1000,
                                left: 0,
                                right: 1000,
                                width: 1000,
                                height: 1000
                            },
                            containerId: CONTAINER_ID,
                            listElementName: void 0,
                            notificationHandler: void 0,
                        };

                        objMgr.add(configMob1);
                        expect(objMgr.mobs.length).toBe(1);
                        expect(objMgr.getElementsByContainer(CONTAINER_ID).length).toBe(1);

                        spyOn(objMgr.mobs[0], "calculateLogicalPositions").and.callThrough();
                        spyOn(objMgr.mobs[0], "getGridPositions").and.returnValue({left:[], top:[]});
                        objMgr.calculateLogicalPositions();
                        expect(objMgr.mobs[0].calculateLogicalPositions).toHaveBeenCalledTimes(1);
                        expect(objMgr.mobs[0].getGridPositions).not.toHaveBeenCalled();
                        expect(CONTAINER_ID in objMgr.grids).toBe(false);
                        done();
                    });
                });
            });

            describe("Scrollbar", () => {

                it("is hidden if element fits into containment", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                        const scrollbarVertical = document.createElement("div");
                        scrollbarVertical.id = "ScrollbarVerticalTest";
                        scrollbarVertical.style.display = "block";
                        const el = document.createElement("div");
                        el.id = "test123";
                        el.style.top = "0px";
                        el.style.left = "0px";
                        el.style.maxHeight = "10px";
                        el.style.maxWidth = "20px";
                        el.style.minHeight = "10px";
                        el.style.minWidth = "20px";
                        el.style.margin = "0px 0px 0px 0px";
                        el.style.padding = "0px 0px 0px 0px";
                        el.style.position = "absolute";
                        document.body.appendChild(el);
                        document.body.appendChild(scrollbarVertical);

                        const gestures = {
                            Pan: {
                                direction:'DIRECTION_VERTICAL',
                                events:['panstart','panmove','panend'],
                                enable: false,
                            }
                        };


                        objMgr.add(
                            {
                                element: el,
                                target: el,
                                options: {},
                                gestures: gestures,
                                containment:{
                                    top: 0,
                                    bottom: 1000,
                                    left: 0,
                                    right: 1000,
                                    width: 1000,
                                    height: 1000
                                },
                                containerId: "containerIdTest",
                                grid: {
                                    top: 0,
                                    bottom: 10,
                                    left: 0,
                                    right: 10,
                                    width: 10,
                                    height: 10
                                },
                                listElementName: void 0,
                                verticalScrollbarElementName: scrollbarVertical.id,
                                horizontalScrollbarElementName: void 0,
                                notificationHandler: void 0});

                        expect(scrollbarVertical.style.display).toEqual("none");
                        expect(objMgr.grids["containerIdTest"].top.length).toBe(1);
                        expect(objMgr.grids["containerIdTest"].left.length).toBe(1);

                        document.body.removeChild(el);
                        document.body.removeChild(scrollbarVertical);
                        done();
                    });
                });

                it("is visible if element does not fit into containment", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                        const scrollbarVertical = document.createElement("div");
                        scrollbarVertical.id = "ScrollbarVerticalTest";
                        const el = document.createElement("div");
                        el.id = "test123";
                        el.style.top = "0px";
                        el.style.left = "0px";
                        el.style.maxHeight = "1000px";
                        el.style.maxWidth = "20px";
                        el.style.minHeight = "1000px";
                        el.style.minWidth = "20px";
                        el.style.margin = "0px 0px 0px 0px";
                        el.style.padding = "0px 0px 0px 0px";
                        el.style.position = "absolute";
                        document.body.appendChild(el);
                        document.body.appendChild(scrollbarVertical);

                        jQuery["fn"]["transition"] = jasmine.createSpy("jqTransit");

                        const gestures = {
                            Pan: {
                                direction:'DIRECTION_VERTICAL',
                                events:['panstart','panmove','panend'],
                                enable: false,
                            }
                        };


                        objMgr.add(
                            {
                                element: el,
                                target: el,
                                options: {},
                                gestures: gestures,
                                containment:{
                                    top: 0,
                                    bottom: 10,
                                    left: 0,
                                    right: 1000,
                                    width: 1000,
                                    height: 10
                                },
                                containerId: "containerIdTest",
                                grid: {
                                    top: 0,
                                    bottom: 10,
                                    left: 0,
                                    right: 10,
                                    width: 10,
                                    height: 10
                                },
                                listElementName: void 0,
                                verticalScrollbarElementName: scrollbarVertical.id,
                                horizontalScrollbarElementName: void 0,
                                notificationHandler: void 0});

                        expect(scrollbarVertical.style.display).toEqual("inline");
                        expect(objMgr.grids["containerIdTest"].top.length).toBe(100);
                        expect(objMgr.grids["containerIdTest"].left.length).toBe(1);
                        document.body.removeChild(el);
                        document.body.removeChild(scrollbarVertical);
                        done();
                    });
                });

                it("recognizes disposed element before storing position", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/UIMovements'], objMgr => {
                        const scrollbarVertical = document.createElement("div");
                        scrollbarVertical.id = "ScrollbarVerticalTest";
                        scrollbarVertical.style.display = "block";
                        const el = document.createElement("div");
                        el.id = "test123";
                        el.style.top = "0px";
                        el.style.left = "0px";
                        el.style.maxHeight = "1000px";
                        el.style.maxWidth = "20px";
                        el.style.minHeight = "1000px";
                        el.style.minWidth = "20px";
                        el.style.margin = "0px 0px 0px 0px";
                        el.style.padding = "0px 0px 0px 0px";
                        el.style.position = "absolute";
                        document.body.appendChild(el);
                        document.body.appendChild(scrollbarVertical);

                        jQuery["fn"]["transition"] = jasmine.createSpy("jqTransit");

                        const gestures = {
                            Pan: {
                                direction:'DIRECTION_VERTICAL',
                                events:['panstart','panmove','panend'],
                                enable: false,
                            }
                        };


                        objMgr.add(
                            {
                                element: el,
                                target: el,
                                options: {},
                                gestures: gestures,
                                containment:{
                                    top: 0,
                                    bottom: 10,
                                    left: 0,
                                    right: 1000,
                                    width: 1000,
                                    height: 10
                                },
                                containerId: "containerIdTest",
                                grid: {
                                    top: 0,
                                    bottom: 10,
                                    left: 0,
                                    right: 10,
                                    width: 10,
                                    height: 10
                                },
                                listElementName: void 0,
                                verticalScrollbarElementName: scrollbarVertical.id,
                                horizontalScrollbarElementName: void 0,
                                notificationHandler: void 0});

                        // store reference an try to call "storeScrollbarPosition" after disposal
                        const mob = objMgr.mobs[0];
                        mob.recognizers = [];
                        mob.gestures = {};
                        objMgr.remove(el);
                        expect(mob.storeScrollbarPosition.bind(mob)).not.toThrow();
                        document.body.removeChild(el);
                        done();
                    });
                });
            });
        });
    });
});