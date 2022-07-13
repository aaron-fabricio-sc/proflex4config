/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ViewServiceMock_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/servicemocks/wn.UI.Service.ViewServiceMock.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("ViewServiceMock", () => {

    beforeEach(done => {
        Wincor = new WincorNamespace();
        class BaseServiceMock extends Wincor.UI.Service.BaseServiceMock {
            replaceInMapping() {}
    
            async retrieveJSONData(name) {
                switch(name) {
                case "../servicedata/BusinessPropertyKeyMap.json":
                    return {
                        PROP_A: "CCTAFW_PROP_A",
                        PROP_B: "CCTAFW_PROP_B",
                        PROP_C: "CCTAFW_PROP_C",
                        PROP_D: "CCTAFW_PROP_D",
                    };
                case "../servicemocks/mockdata/BusinessData.json":
                    return {
                        CCTAFW_PROP_A: {"*": "xyz"},
                        CCTAFW_PROP_B: {"*": "uvw"},
                        CCTAFW_PROP_C: {"*": "123"},
                        CCTAFW_PROP_D: {"*": ["A", "B", "C"]},
                    };
        
                default:
                    return {};
                }
            }
        }
    
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ jQuery, Wincor, BaseService: BaseServiceMock, ext: getExtensions({Wincor, LogProvider}), LogProvider });

        done();
    });

    afterEach(() => {
    });

    describe("setup", () => {
        it("checks onSetup with empty arg", async() => {
            const viewSvc = new Svc();
            spyOn(localStorage, "getItem").and.returnValue("touch");
            viewSvc.requestMap = new Map();
            await viewSvc.onSetup({});
            expect(viewSvc.viewSetName).toBe("touch");
            expect(viewSvc.initialViewSet).toBe("touch");
        });

        it("checks onSetup with view set name arg", async() => {
            const viewSvc = new Svc();
            spyOn(localStorage, "getItem").and.returnValue("touch");
            viewSvc.requestMap = new Map();
            await viewSvc.onSetup({viewSetName: "touch"});
            expect(viewSvc.viewSetName).toBe("touch");
            expect(localStorage.getItem).not.toHaveBeenCalled();
            // check default value hasn't change
            expect(viewSvc.initialViewSet).toBe("softkey");
        });
    });
});

