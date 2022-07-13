/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.VideoService_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.VideoService.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("wn.UI.Service.VideoService", () => {
    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();
    
        class PTService extends Wincor.UI.Service.PTService {
            hasReceivers = () => true;
        
            translateResponse() {
            }
        
            sendRequest() {
            }
        
            sendEvent() {
            }
        }
    
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ Wincor, ext: getExtensions({Wincor, LogProvider}), LogProvider, PTService });
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    it("implements basic service attributes", done => {
        const viewSvc = new Svc();
        expect(viewSvc.NAME).toBe("VideoService");
        done();
    });

    it("only moves to initialLocation on session end event, if location changed before", done => {
        //prepare service fakes before requiring!
        const INITIAL_LOCATION = {
            "WINDOW_POSY": 10,
            "WINDOW_POSX": 20,
            "WINDOW_SIZEX": 30,
            "WINDOW_SIZEY": 40
        };

        Wincor.UI.Service.Provider.ConfigService.whenReady = Promise.resolve();
        Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
            return Promise.resolve(INITIAL_LOCATION)
        };

        Wincor.UI.Service.Provider.EventService.whenReady = Promise.resolve();
        Wincor.UI.Service.Provider.ViewService.whenReady = Promise.resolve();
        Wincor.UI.Service.Provider.ViewService.initialLocation = {
            width: 1024,
            height: 768
        };

        let sessionEndCallback;
        Wincor.UI.Service.Provider.EventService.registerForEvent = jasmine.createSpy("registerForEvent")
            .and.callFake((eventId, fwName, callback, persistent) => {
                expect(eventId).toBe("UNIT_TEST_SESSION_END");
                sessionEndCallback = callback;
            });

        Wincor.UI.Service.Provider.EventService.getEventInfo = jasmine.createSpy("getEventInfo")
            .and.callFake((name) => {
                expect(name).toBe("TRANSACTION_MODULE");
                return {
                    NAME: "UNIT_TEST_FW",
                    ID_SESSION_END: "UNIT_TEST_SESSION_END"
                };
            });

        Wincor.UI.Service.Provider.getInstanceName = () => "GUIAPP";
        
        const videoSvc = new Svc();
        spyOn(videoSvc, "resizeWindow");
        jasmine.clock().install();
        videoSvc.onServicesReady()
            .then(() => {
                videoSvc.baseLocation = Object.assign({}, videoSvc.initialLocation);
                // ok, we can trigger the registered callback now :-)
                videoSvc.baseLocation.top = 123;
                sessionEndCallback.call(videoSvc);
                jasmine.clock().tick(5);
                expect(videoSvc.resizeWindow).toHaveBeenCalledTimes(1);
                videoSvc.baseLocation.top = INITIAL_LOCATION.WINDOW_POSY;
                sessionEndCallback.call(videoSvc);
                jasmine.clock().tick(5);
                expect(videoSvc.resizeWindow).toHaveBeenCalledTimes(1);
                jasmine.clock().uninstall();
                done();
            })
            .catch(done.fail);
    });
});

