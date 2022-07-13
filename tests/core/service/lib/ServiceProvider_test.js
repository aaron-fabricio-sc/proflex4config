/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ServiceProvider_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/
import { WincorNamespace } from "../../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../../GUIAPP/core/service/lib/ServiceProvider.js";

let Wincor;
let ServiceProvider;
let GatewayProvider;

/*global jQuery:false*/
describe("wn.UI.Service.Provider", () => {
    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();
        
        class BaseProxy {
        }
        
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        GatewayProvider = Wincor.UI.Gateway.GatewayProvider;
        GatewayProvider.getGateway = () => {
            return {
                sendEvent: jasmine.createSpy("sendEvent")
            };
        };
        
        ServiceProvider = getServiceClass({ Wincor, jQuery, ext: getExtensions({Wincor, LogProvider}), LogProvider, BaseProxy, GatewayProvider });
    
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });


    describe("setup", () => {
    
        it("uses correct logical name", async done => {
            try {
                expect(ServiceProvider.NAME).toBe("ServiceProvider");
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        xit("checks setup", async done => {
            try {
                ServiceProvider.serviceNames.pop("LogProvider");
                // prepare: must fill private -deferredInitObjects of provider
                ServiceProvider.proxyConfiguration = {
                    "ProxyInstance": {
                        __NAME: "ProxyInstance"
                    }
                };
                let resolveSpy = {resolve: jasmine.createSpy("resolve")};
                // private ServiceBundle must be set
                await ServiceProvider.loadServices([], {});
                
                await ServiceProvider.addService({
                    NAME: "ProxyInstance",
                    getServiceName: () => { return "TestService"; },
                    initializeService: () => {
                        return Promise.resolve(resolveSpy);
                    }
                });
                ServiceProvider["TestService"].onSetup = jasmine.createSpy("onSetup").and.callFake(message => {
                    expect(message.myMessage).toBe("Hello provider");
                    return Promise.resolve();
                });
                ServiceProvider["TestService"].onServicesReady = jasmine.createSpy("onServicesReady").and.returnValue(Promise.resolve());
                
                Wincor.UI.Gateway.prototype.EVENT = {};
                await ServiceProvider.setup({myMessage: "Hello provider"});
                expect(resolveSpy.resolve).toHaveBeenCalledTimes(1);
                expect(GatewayProvider.getGateway().sendEvent).toHaveBeenCalledWith({
                    service: "ViewService",
                    eventName: "BrowserInitialized"
                });
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        xit("checks setup: onSetup timeout", async done => {
            try {
                ServiceProvider.serviceNames.pop("LogProvider");
                // prepare: must fill private -deferredInitObjects of provider
                ServiceProvider.proxyConfiguration = {};
                let resolveSpy = {resolve: jasmine.createSpy("resolve")};
                await ServiceProvider.addService({
                    NAME: "ProxyInstance",
                    getServiceName: () => {
                        return "TestService";
                    },
                    initializeService: () => {
                        return Promise.resolve(resolveSpy);
                    }
                });
                jasmine.clock().install();
                ServiceProvider["TestService"].onSetup = jasmine.createSpy("onSetup").and.callFake(message => {
                    expect(message.myMessage).toBe("Hello provider");
                    return new Promise(resolve => {
                        resolve();
                    });
                });
            
                ServiceProvider["TestService"].onServicesReady = jasmine.createSpy("onServicesReady").and.returnValue(Promise.resolve());
        
                Wincor.UI.Gateway.prototype.EVENT = {};
                let p = ServiceProvider.setup({myMessage: "Hello provider"});
                jasmine.clock().tick(20000); // simulate 20s timer and provoke bluebird promise timeout of 15s
                try {
                    await p;
                } catch(e) { // false positive
                    expect(resolveSpy.resolve).not.toHaveBeenCalled();
                    expect(GatewayProvider.getGateway().sendEvent).toHaveBeenCalledWith({
                        "service": "ViewService",
                        "eventName": "BrowserFailed",
                        "eventData": "failed setting up services! Unfinished: <>\nonSetup promise failed TimeoutError: operation timed out "
                    });
                    done();
                }
            } catch(e) {
                done.fail();
            } finally {
                jasmine.clock().uninstall();
            }
        });

        xit("checks setup: onSetup returns no promise", async done => {
            try {
                ServiceProvider.serviceNames.pop("LogProvider");
                spyOn(ServiceProvider.LogProvider, "error");
                ServiceProvider.serviceNames = ["TestService"];
                ServiceProvider["TestService"] = {
                    onSetup: jasmine.createSpy("onSetup").and.callFake(message => {
                        expect(message.myMessage).toBe("Hello provider");
                        return "hello";
                    })
                };
                Wincor.UI.Gateway.prototype.EVENT = {};
                const message = {myMessage: "Hello provider"};
                const gateway = GatewayProvider.getGateway();
                await ServiceProvider.setup(message);
                expect(ServiceProvider["TestService"].onSetup).toHaveBeenCalledWith(message);
                expect(ServiceProvider.LogProvider.error).toHaveBeenCalledWith("Implementation error! Service <TestService::onSetup(...) implemented but not returning promise!>");
                expect(gateway.sendEvent).toHaveBeenCalledWith({
                    service: "ViewService",
                    eventName: "BrowserInitialized"
                });
                done();
            } catch(e) {
                done.fail(e);
            }
        });

    });
});

