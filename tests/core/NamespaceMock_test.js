/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ NamespaceMock_test.js 4.3.1-201130-21-086c3328-1a04bc7d

*/
import { WincorNamespace } from "../../../GUI_UnitTesting/NamespaceMock.js";

const Wincor = new WincorNamespace();

/*global jQuery:false*/
describe("NamespaceMock self-test", function() {

    beforeEach(function(done) {
        done();
    });

    afterEach(function() {
    });

    it("can createMockObject", function() {
        expect(Wincor.createMockObject()).toEqual({});
        let o = Wincor.createMockObject(["Commanding.commands", "Other.Stuff.From.Space", "Commanding.Should.Not.Delete.Commands.From.Root"]);
        o = Wincor.createMockObject("Added.After.Creation", o);
        expect(typeof o === "object").toBe(true);
        expect("Commanding" in o).toBe(true);
        expect(typeof o.Commanding.commands === "object").toBe(true);
        expect(o.Other.Stuff.From.Space).toBeDefined();
        expect(o.Added.After.Creation).toEqual({});
    });

    it("can createMockObject with target value", function() {
        expect(Wincor.createMockObject()).toEqual({});
        let o = Wincor.createMockObject(["Commanding.commands=\"test\"", "Other.Stuff.From.Space=1", "Commanding.Should.Not.Delete.Commands.From.Root"]);
        o = Wincor.createMockObject("Added.After.Creation={\"test\": 123}", o);
        expect(typeof o === "object").toBe(true);
        expect("Commanding" in o).toBe(true);
        expect(o.Commanding.commands).toBe('test');
        expect(o.Other.Stuff.From.Space).toBeDefined();
        expect(o.Other.Stuff.From.Space).toBe(1);
        expect(o.Added.After.Creation).toEqual({test: 123});
    });

    it("can createMockObject function chain", function() {
        expect(Wincor.createMockObject()).toEqual({});
        let o = Wincor.createMockObject(["timeout.catch.then.then.catch"], {}, true);
        o = Wincor.createMockObject("Added.After.Creation", o);
        expect(typeof o === "object").toBe(true);
        expect("Added" in o).toBe(true);
        o = Wincor.createMockObject("Added.a.new.chain", o, true);
        expect(typeof o.timeout().catch().then().then().catch()).toBe("object");
        expect(typeof o.Added.a().new().chain()).toBe("object");
    });

    it("can createMockObject function chain with target value", function() {
        expect(Wincor.createMockObject()).toEqual({});
        let o = Wincor.createMockObject(["timeout.catch.then.then.catch=123"], {}, true);
        o = Wincor.createMockObject("Added.After.Creation", o);
        expect(typeof o === "object").toBe(true);
        expect("Added" in o).toBe(true);
        o = Wincor.createMockObject("Added.a.new.chain", o, true);
        expect(o.timeout().catch().then().then().catch()).toBe(123);
        expect(typeof o.Added.a().new().chain()).toBe("object");
    });

    it("can deep check hasMembers", function() {
        const a = {
            my: {
                little: {
                    self: {
                        test: ""
                    }
                }
            }
        };

        expect(Wincor.hasMember(a, "my.little.self.test")).toBe(true);
        expect(Wincor.hasMember(a, "my.little.self.test.lacks")).toBe(false);
        expect(Wincor.hasMember.bind(this, null, "my.little.self.test.lacks")).not.toThrow();
    });

    it("simulates commanding in a basic way", () => {
        const CMD = jQuery.extend(true, {id: "TEST"}, Wincor.UI.Content.Command);
        Wincor.UI.Content.Commanding.commands[CMD.id] = CMD;
        const gotCmd = Wincor.UI.Content.Commanding.get("TEST");
        expect(typeof gotCmd).toBe("object");
        expect(Wincor.UI.Content.Commanding.isActive("TEST")).toBe(true);
        Wincor.UI.Content.Commanding.setActive("TEST", false);
        expect(Wincor.UI.Content.Commanding.isActive("TEST")).toBe(false);

        expect(Wincor.UI.Content.Commanding.isVisible("TEST")).toBe(true);
        Wincor.UI.Content.Commanding.setVisible("TEST", false);
        expect(Wincor.UI.Content.Commanding.isVisible("TEST")).toBe(false);

        expect(Wincor.UI.Content.Commanding.isPressed("TEST")).toBe(false); //default is false for pressed
        Wincor.UI.Content.Commanding.setPressed("TEST", true);
        expect(Wincor.UI.Content.Commanding.isPressed("TEST")).toBe(true);
    });

    it("can create functions returning fixed values", () => {
        const VAL = "TEST";
        const obj = {
            fx: Wincor.returnValue(VAL)
        };

        expect(typeof obj.fx).toBe("function");
        spyOn(obj, "fx").and.callThrough();
        expect(obj.fx).not.toThrow();
        expect(obj.fx).toHaveBeenCalledTimes(1);
        expect(obj.fx()).toBe(VAL);
    });

    it("can create functions returning one of their arguments", () => {
        const VAL = "TEST";
        const obj = {
            fx: Wincor.returnArgument(),
            fx2: Wincor.returnArgument(2)
        };

        expect(typeof obj.fx).toBe("function");
        expect(typeof obj.fx2).toBe("function");
        spyOn(obj, "fx").and.callThrough();
        spyOn(obj, "fx2").and.callThrough();
        expect(obj.fx.bind(null, VAL)).not.toThrow();
        expect(obj.fx).toHaveBeenCalledTimes(1);
        expect(obj.fx(VAL, 1, "1234")).toBe(VAL);
        expect(obj.fx2(VAL, 1, "1234")).toBe("1234");
    });

    it("can create functions returning a promise resolving to one of their argument", done => {
        const VAL = "TEST";
        const obj = {
            fx: Wincor.returnPromiseResolvingArg(),
            fx2: Wincor.returnPromiseResolvingArg(2),
            fxCallback: Wincor.returnPromiseResolvingArg(void 0, void 0, 3)
        };

        expect(typeof obj.fx).toBe("function");
        expect(typeof obj.fx2).toBe("function");
        expect(typeof obj.fxCallback).toBe("function");
        spyOn(obj, "fx").and.callThrough();
        spyOn(obj, "fx2").and.callThrough();
        spyOn(obj, "fxCallback").and.callThrough();
        expect(obj.fx.bind(null, VAL)).not.toThrow();
        expect(obj.fx).toHaveBeenCalledTimes(1);

        const ret = obj.fx(VAL, 1, "1234");
        expect(ret instanceof Promise).toBe(true);
        const ret2 = obj.fx2(VAL, 1, "1234");
        expect(ret2 instanceof Promise).toBe(true);

        const cbSpy = jasmine.createSpy("cbSpy");
        const ret3 = obj.fxCallback(VAL, 1, "1234", cbSpy);
        expect(ret3 instanceof Promise).toBe(true);
        Promise.all([ret, ret2, ret3])
            .then((rets) => {
                expect(rets[0]).toBe(VAL);
                expect(rets[1]).toBe("1234");
                expect(rets[2]).toBe(VAL);
                expect(cbSpy).toHaveBeenCalledTimes(1);
                expect(cbSpy).toHaveBeenCalledWith(VAL);

                done();
            })
            .catch((e) => {
                expect(e).toBe("not to come here");
                done();
            });
    });

    it("can wait for calls and deliver arguments", done => {
        const TEST_EVENT = "TEST_EVENT";
        const RETURN_VALUE = 4711;
        const spy = jasmine.createSpy("callback");
        // the "waitForCall" creates a spy and resolves when the original function is called!
        const promise = Wincor.waitForCall(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent", (...args) => args[0] === TEST_EVENT, RETURN_VALUE);
        // now we call original in another time line as it would be for our case
        let res;
        window.setTimeout(() => {
            res = Wincor.UI.Service.Provider.ViewService.registerForServiceEvent(TEST_EVENT, spy);
        }, 1);
        promise
            .then((args) => {
                expect(args[0]).toBe(TEST_EVENT);
                expect(res).toBe(RETURN_VALUE);
                done();
            })
            .catch(done.fail);
    });
});
