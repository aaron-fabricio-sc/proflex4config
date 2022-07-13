/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ Calculations_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/
/*global define:false*/
define(['lib/Squire'], function(Squire) {

    let injector;
    let Wincor;

    describe("Calculations", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                
                injector.mock("config/Config", {viewType: "softkey"});
                done();
            });
            jasmine.clock().install();
        });

        afterEach(() => {
            injector.remove();
            jasmine.clock().uninstall();
        });
    
        describe("bill split mode checks", () => {
            it("checks bill split: Denom counts in range 1", async done => {
                try {
                    let [cal] = await injector.require(["GUIAPP/content/viewmodels/base/Calculations"]);
                    const settings = {
                        maxItems: 0, // let algo calculate
                        amount: 40000,
                        maxNotes: 200,
                        maxCoins: 50,
                        types: [0, 0, 0],
                        items: [1000, 5000, 10000],
                        counts: [40, 10, 1],
                        maxTries: 25000,
                        algoMode: cal.ALGO_MODE.SPLIT_DISTRIBUTIONS
                    };
                    let ctx = cal.doAlgo(settings);
                    expect(ctx.isSolutionFound).toBe(true);
                    let i = 0;
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                               (ctx.distributions[i][1] * settings.items[1]) +
                               (ctx.distributions[i][2] * settings.items[2])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBeLessThanOrEqual(settings.counts[0]);
                        expect(ctx.distributions[i][1]).toBeLessThanOrEqual(settings.counts[1]);
                        expect(ctx.distributions[i][2]).toBeLessThanOrEqual(settings.counts[2]);
                        i++;
                    }
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1]) +
                            (ctx.distributions[i][2] * settings.items[2])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBeLessThanOrEqual(settings.counts[0]);
                        expect(ctx.distributions[i][1]).toBeLessThanOrEqual(settings.counts[1]);
                        expect(ctx.distributions[i][2]).toBeLessThanOrEqual(settings.counts[2]);
                        i--;
                    }
    
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks bill split: Denom counts in range 2", async done => {
                try {
                    let [cal] = await injector.require(["GUIAPP/content/viewmodels/base/Calculations"]);
                    const settings = {
                        maxItems: 0, // let algo calculate
                        amount: 200000,
                        maxNotes: 200,
                        maxCoins: 50,
                        types: [0, 0, 0],
                        items: [1000, 5000, 100000],
                        counts: [2000, 2000, 1],
                        maxTries: 25000,
                        algoMode: cal.ALGO_MODE.SPLIT_DISTRIBUTIONS
                    };
                    let ctx = cal.doAlgo(settings);
                    expect(ctx.isSolutionFound).toBe(true);
                    let i = 0;
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1]) +
                            (ctx.distributions[i][2] * settings.items[2])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBeLessThanOrEqual(settings.counts[0]);
                        expect(ctx.distributions[i][1]).toBeLessThanOrEqual(settings.counts[1]);
                        expect(ctx.distributions[i][2]).toBeLessThanOrEqual(settings.counts[2]);
                        i++;
                    }
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1]) +
                            (ctx.distributions[i][2] * settings.items[2])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBeLessThanOrEqual(settings.counts[0]);
                        expect(ctx.distributions[i][1]).toBeLessThanOrEqual(settings.counts[1]);
                        expect(ctx.distributions[i][2]).toBeLessThanOrEqual(settings.counts[2]);
                        i--;
                    }
            
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks bill split: The 80EUR test", async done => {
                try {
                    let [cal] = await injector.require(["GUIAPP/content/viewmodels/base/Calculations"]);
                    const settings = {
                        maxItems: 0, // let algo calculate
                        amount: 8000,
                        maxNotes: 60,
                        maxCoins: 50,
                        types: [0, 0, 0],
                        items: [2000, 5000, 10000],
                        counts: [10, 10, 10],
                        maxTries: 25000,
                        algoMode: cal.ALGO_MODE.SPLIT_DISTRIBUTIONS
                    };
                    let ctx = cal.doAlgo(settings);
                    expect(ctx.isSolutionFound).toBe(true);
                    let i = 0;
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1]) +
                            (ctx.distributions[i][2] * settings.items[2])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBeLessThanOrEqual(settings.counts[0]);
                        expect(ctx.distributions[i][1]).toBe(0);
                        expect(ctx.distributions[i][2]).toBe(0);
                        i++;
                    }
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1]) +
                            (ctx.distributions[i][2] * settings.items[2])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBeLessThanOrEqual(settings.counts[0]);
                        expect(ctx.distributions[i][1]).toBe(0);
                        expect(ctx.distributions[i][2]).toBe(0);
                        i--;
                    }
            
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks bill split: The 80EUR test with 20's/50's", async done => {
                try {
                    let [cal] = await injector.require(["GUIAPP/content/viewmodels/base/Calculations"]);
                    const settings = {
                        maxItems: 0, // let algo calculate
                        amount: 8000,
                        maxNotes: 60,
                        maxCoins: 50,
                        types: [0, 0],
                        items: [2000, 5000],
                        counts: [10, 10],
                        maxTries: 25000,
                        algoMode: cal.ALGO_MODE.SPLIT_DISTRIBUTIONS
                    };
                    let ctx = cal.doAlgo(settings);
                    expect(ctx.isSolutionFound).toBe(true);
                    let i = 0;
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBe(4);
                        expect(ctx.distributions[i][1]).toBe(0);
                        i++;
                    }
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBe(4);
                        expect(ctx.distributions[i][1]).toBe(0);
                        i--;
                    }
            
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks bill split: The 80EUR test with 50's", async done => {
                try {
                    let [cal] = await injector.require(["GUIAPP/content/viewmodels/base/Calculations"]);
                    const settings = {
                        maxItems: 0, // let algo calculate
                        amount: 8000,
                        maxNotes: 60,
                        maxCoins: 50,
                        types: [0, 0],
                        items: [2000, 5000],
                        counts: [0, 10],
                        maxTries: 25000,
                        algoMode: cal.ALGO_MODE.SPLIT_DISTRIBUTIONS
                    };
                    let ctx = cal.doAlgo(settings);
                    expect(ctx.isSolutionFound).toBe(false);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks bill split: The 50EUR test", async done => {
                try {
                    let [cal] = await injector.require(["GUIAPP/content/viewmodels/base/Calculations"]);
                    const settings = {
                        maxItems: 0, // let algo calculate
                        amount: 5000,
                        maxNotes: 60,
                        maxCoins: 50,
                        types: [0, 0, 0],
                        items: [1000, 2000, 5000],
                        counts: [10, 10, 10],
                        maxTries: 25000,
                        algoMode: cal.ALGO_MODE.SPLIT_DISTRIBUTIONS
                    };
                    let ctx = cal.doAlgo(settings);
                    expect(ctx.isSolutionFound).toBe(true);
                    let i = 0;
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1]) +
                            (ctx.distributions[i][2] * settings.items[2])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBeLessThanOrEqual(5);
                        expect(ctx.distributions[i][1]).toBeLessThanOrEqual(2);
                        expect(ctx.distributions[i][2]).toBeLessThanOrEqual(1);
                        i++;
                    }
                    while(ctx.distributions[i] !== void 0) {
                        expect((ctx.distributions[i][0] * settings.items[0]) +
                            (ctx.distributions[i][1] * settings.items[1]) +
                            (ctx.distributions[i][2] * settings.items[2])).toBe(settings.amount);
                        expect(ctx.distributions[i][0]).toBeLessThanOrEqual(5);
                        expect(ctx.distributions[i][1]).toBeLessThanOrEqual(2);
                        expect(ctx.distributions[i][2]).toBeLessThanOrEqual(1);
                        i--;
                    }
            
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
    
        });
    
    });

});

