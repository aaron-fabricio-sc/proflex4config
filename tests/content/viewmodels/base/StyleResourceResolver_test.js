/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ StyleResourceResolver_test.js 4.3.1-210204-21-7f39c59f-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let Wincor;
    let jQuery;

    describe("StyleResourceResolver", () => {
        
        let dummyHead;
    
        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                jQuery = window.jQuery = bundle.jQuery;
    
                const STYLE_RESOURCE_MAPPING = {
                    touch: {
                        resolution: {
                            "default/": {
                                base: [
                                    "default/default/default/layouts.css",
                                    "default/default/default/sizes-positions.css",
                                    "default/default/default/sizes-positions-custom.css",
                                    "default/default/default/layouts-custom.css",
                                    "default/default/default/svg.css"
                                ],
                                vendor: {
                                    "default/": [],
                                    type: {
                                        "MercuryDark/": ["default/default/MercuryDark/layouts-custom.css", "default/default/MercuryDark/svg.css"],
                                        "MercuryLight/": ["default/default/MercuryLight/layouts-custom.css", "default/default/MercuryLight/svg.css"]
                                    }
                                },
                                additional: []
                            }
                        }
                    },
                    softkey: {
                        resolution: {
                            "default/": {
                                base: [
                                    "default/default/default/layouts.css",
                                    "default/default/default/sizes-positions.css",
                                    "default/default/default/sizes-positions-custom.css",
                                    "default/default/default/layouts-custom.css",
                                    "default/default/default/svg.css"
                                ],
                                vendor: {
                                    "default/": ["default/default/default/softkey-custom.css"],
                                    "NCR/": ["default/NCR/default/softkey-custom.css"],
                                    "DIEBOLD/": ["default/DIEBOLD/default/softkey-custom.css"],
                                    "WN-NCR/": ["default/WN-NCR/default/softkey-custom.css"],
                                    type: {
                                        "MercuryDark/": ["default/default/MercuryDark/layouts-custom.css", "default/default/MercuryDark/svg.css"],
                                        "MercuryLight/": ["default/default/MercuryLight/layouts-custom.css", "default/default/MercuryLight/svg.css", "[ADAHideScreen/]", "[ADAHighContrast/]"],
                                        "ADAHideScreen/": ["default/default/ADAHideScreen/layouts-custom.css"],
                                        "ADAHighContrast/": ["default/default/ADAHighContrast/layouts-custom.css"]
                                    }
                                },
                                additional: []
                            },
                        }
                    }
                };
                Wincor.UI.Content.ViewHelper.isWaitSpinnerActive = () => { return false; };
                Wincor.UI.Content.ViewHelper.forceElementsRedraw = () => {};
                Wincor.UI.Content.ViewHelper.setStyleResolver = () => {};
                
                injector
                    .mock("jquery", jQuery)
                    .mock("knockout", bundle.ko)
                    .mock("extensions", bundle.ext)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("code-behind/ViewHelper", Wincor.UI.Content.ViewHelper)
                    .mock("config/Config", {
                        RES_1920X1080: "1920x1080/",
                        RES_1280X1024: "1280x1024/",
                        RES_1024X1280: "1024x1280/",
                        RES_1050X1680: "1050x1680/",
                        ROOT_DEFAULT: "style/",
                        STYLE_VENDOR: "default/",
                        STYLE_TYPE: "default/",
                        RVT_DEFAULT_NAME: "default/",
                        viewType: "softkey",
                        CUSTOM_STYLE_RESOURCES_SOFTKEY: [],
                        STYLE_RESOURCE_MAPPING
                    });
                
                // Fake DOM head + body to avoid browser is loading css resources AND to not pollute the real DOM with stuff that the resolver usually does in PF4 UI.
                // Note that this only make sense when each test uses jQuery selector rather than using document query selectors.
                let dummyBody = jQuery("<body>");
                dummyHead = jQuery("<head>");
                dummyHead.append("<script>");
                spyOn(jQuery.fn, "find").and.callFake(arg => {
                    if(arg === "head") {
                        return dummyHead;
                    }
                    if(arg === "body") {
                        return dummyBody;
                    }
                    if(arg.includes("link")) {
                        return dummyHead.children(arg);
                    }
                    if(arg.includes("script")) {
                        return dummyHead.children(arg);
                    }
                    return dummyHead;
                });
    
                done();
            });
            jasmine.clock().install();
        });

        afterEach(() => {
            injector.remove();
            jasmine.clock().uninstall();
        });

        describe("explicit style configuration", () => {
            beforeEach(() => {
                jQuery("body").removeAttr("data-style-resolution");
            });
    
            it("update resources for 'default' type", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
    
                
                
                await StyleResourceResolver.updateResources();
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/default/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/default/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
            });
    
            it("set type for 'MercuryLight'", async() => {
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
        
                await StyleResourceResolver.setType("MercuryLight/");
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/MercuryLight/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/MercuryLight/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
            });
    
            it("set type for 'mercurydark' and check mapper to 'MercuryDark/'", async() => {
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
        
                await StyleResourceResolver.setType("mercurydark");
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/MercuryDark/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/MercuryDark/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
            });
    
            it("set type for 'merCuryDark' and check mapper to standard 'MercuryDark/'", async() => {
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
        
                await StyleResourceResolver.setType("merCuryDark");
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/MercuryDark/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/MercuryDark/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
            });
    
            it("set type for 'ADAHideScreen'", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                
                await StyleResourceResolver.setType("ADAHideScreen/");
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/ADAHideScreen/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/default/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
            });
    
            it("set type for 'ADAHighContrast'", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
        
                await StyleResourceResolver.setType("ADAHighContrast/");
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/ADAHighContrast/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/default/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
            });
    
            it("set type for a combined type (MercuryLight + ADAHideScreen)", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                
                await StyleResourceResolver.setType("MercuryLight/");
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/MercuryLight/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/MercuryLight/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
                // now let combine MercuryLight together with ADAHideScreen
                await StyleResourceResolver.setType("ADAHideScreen/");
                $links = jQuery("head link");
                expect($links.length).toBe(7);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/MercuryLight/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/MercuryLight/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
                expect($links[6].href).toContain("style/default/default/ADAHideScreen/layouts-custom.css");
            });
        });
    
        describe("explicit style configuration update overlapping resources", () => {
            beforeEach(() => {
                jQuery("body").removeAttr("data-style-resolution");
            });
    
            it("update resources from 'default' to 'MercuryLight' to 'default'", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                spyOn(StyleResourceResolver, "updateResources").and.callThrough();
                StyleResourceResolver.getStyleResourceConfig().type = "Something"; // ensure current type other than default
                await StyleResourceResolver.setType("default/");
    
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/default/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/default/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
    
                await StyleResourceResolver.setType("MercuryLight/");
                $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/MercuryLight/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/MercuryLight/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
                await StyleResourceResolver.setType("default/");
                $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/default/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/default/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
            });
        });
    
        describe("manually stylesheets API", () => {
            beforeEach(() => {
                jQuery("body").removeAttr("data-style-resolution");
            });
        
            it("calls addStyleSheet", async() => {
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const NEW_RES = "1024x1280/";
                StyleResourceResolver.updateResources = jasmine.createSpy("updateResources").and.returnValue(Promise.resolve());
                expect(StyleResourceResolver.resolution()).toBe("default/"); // before
                await StyleResourceResolver.setResolution(NEW_RES);
                expect(StyleResourceResolver.updateResources).toHaveBeenCalled();
    
                // add a stylesheet manually:
                StyleResourceResolver.addStyleSheet("project-custom_1.css", "style/default/default/project/");
                StyleResourceResolver.addStyleSheet("project-custom_2.css", "style/default/default/project/");
    
                let $links = jQuery("head link");
                expect($links.length).toBe(2);
                expect($links[0].href).toContain("style/default/default/project/project-custom_1.css");
                expect($links[1].href).toContain("style/default/default/project/project-custom_2.css");
            });
    
            it("calls addStyleSheet without path arg", async() => {
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const NEW_RES = "1024x1280/";
                StyleResourceResolver.updateResources = jasmine.createSpy("updateResources").and.returnValue(Promise.resolve());
                expect(StyleResourceResolver.resolution()).toBe("default/"); // before
                await StyleResourceResolver.setResolution(NEW_RES);
                expect(StyleResourceResolver.updateResources).toHaveBeenCalled();
        
                // add a stylesheet manually:
                StyleResourceResolver.addStyleSheet("style/default/default/project/project-custom_1.css");
                StyleResourceResolver.addStyleSheet("style/default/default/project/project-custom_2.css");
        
                let $links = jQuery("head link");
                expect($links.length).toBe(2);
                expect($links[0].href).toContain("style/default/default/project/project-custom_1.css");
                expect($links[1].href).toContain("style/default/default/project/project-custom_2.css");
            });
    
            it("calls removeStyleSheet", async() => {
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const NEW_RES = "1024x1280/";
                StyleResourceResolver.updateResources = jasmine.createSpy("updateResources").and.returnValue(Promise.resolve());
                expect(StyleResourceResolver.resolution()).toBe("default/"); // before
                await StyleResourceResolver.setResolution(NEW_RES);
                expect(StyleResourceResolver.updateResources).toHaveBeenCalled();
    
                // add a stylesheet manually:
                StyleResourceResolver.addStyleSheet("project-custom_1.css", "style/default/default/project/");
                StyleResourceResolver.addStyleSheet("project-custom_2.css", "style/default/default/project/");
    
                let $links = jQuery("head link");
                expect($links.length).toBe(2);
                expect($links[0].href).toContain("style/default/default/project/project-custom_1.css");
                expect($links[1].href).toContain("style/default/default/project/project-custom_2.css");
    
                // remove stylesheet manually:
                StyleResourceResolver.removeStyleSheet("project-custom_1.css");
                StyleResourceResolver.removeStyleSheet("project-custom_2.css");
                $links = jQuery("head link");
                expect($links.length).toBe(0);
            });
        });
    
        describe("resolution", () => {
            beforeEach(() => {
                jQuery("body").removeAttr("data-style-resolution");
            });
        
            it("checks setResolution", async() => {
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const NEW_RES = "1024x1280/";
                StyleResourceResolver.updateResources = jasmine.createSpy("updateResources").and.returnValue(Promise.resolve());
                expect(StyleResourceResolver.resolution()).toBe("default/"); // before
                await StyleResourceResolver.setResolution(NEW_RES);
                expect(StyleResourceResolver.updateResources).toHaveBeenCalled();
                expect(jQuery("body").attr("data-style-resolution")).toBe("1024x1280");
                expect(StyleResourceResolver.resolution()).toBe(NEW_RES); // after
                expect(StyleResourceResolver.getStyleResourceConfig().resolution).toBe(NEW_RES);
                expect(Wincor.UI.Service.Provider.ViewService.currentResolution).toBe("1024x1280");
            });
    
            it("checks setResolution is called twice for different resolutions", async() => {
                // This test is in respect to the fact that PF4 application browser window may start with a title bar and frame,
                // which means a smaller viewport and thus a different start resolution than the expected set target resolution!
                // While the start phase of the browser window the setResolution() and thus the updateResources() is always called twice in such a
                // case.
                const config = injector.mocks["config/Config"];
                const PROJECT_STYLE_TYPE = "ProjectSpecificBrand/";
                config.viewType = "touch";
                config.STYLE_TYPE = PROJECT_STYLE_TYPE;
                config.STYLE_RESOURCE_MAPPING.touch.resolution["1024x1280/"] = {
                    base: [
                        "default/default/default/sizes-positions.css",
                        "default/default/default/sizes-positions-custom.css",
                        "default/default/default/svg.css",
                        "default/default/default/layouts.css",
                        "default/default/default/layouts-custom.css"
                    ],
                    vendor: {
                        "default/": [],
                        type: {
                            "ProjectSpecificBrand/": ["default/default/ProjectSpecificBrand/Anew1.css", "default/default/ProjectSpecificBrand/Anew2.css"]
                        }
                    },
                    additional: []
                };
    
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const DEFAULT_RES = "default";
                const NEW_RES = "1024x1280";
                
                expect(StyleResourceResolver.resolution()).toBe("default/"); // before
                spyOn(StyleResourceResolver,"updateResources").and.callThrough();
                // first we force to another res than the 'default/' since the setResolution only triggers updateResources if we
                // there is a difference from the current resolution:
                await StyleResourceResolver.setResolution(NEW_RES);
    
                let $links = jQuery("head link");
                expect($links.length).toBe(7);
                expect($links[0].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[2].href).toContain("style/default/default/default/svg.css");
                expect($links[3].href).toContain("style/default/default/default/layouts.css");
                expect($links[4].href).toContain("style/default/default/default/layouts-custom.css");
                expect($links[5].href).toContain("style/default/default/ProjectSpecificBrand/Anew1.css");
                expect($links[6].href).toContain("style/default/default/ProjectSpecificBrand/Anew2.css");
    
                expect(jQuery("body").attr("data-style-resolution")).toBe(NEW_RES);
                expect(StyleResourceResolver.resolution()).toBe(NEW_RES + "/"); // after
                expect(StyleResourceResolver.getStyleResourceConfig().resolution).toBe(NEW_RES + "/");
                expect(Wincor.UI.Service.Provider.ViewService.currentResolution).toBe(NEW_RES);
                expect(StyleResourceResolver.updateResources).toHaveBeenCalledTimes(1);
    
                // second force the resolution to be change again, we expect a new style config based on the "default/"
                // note that the type is still set on PROJECT_STYLE_TYPE, unless we would call StyleResourceResolver.setType()
                await StyleResourceResolver.setResolution(DEFAULT_RES);
    
                expect(jQuery("body").attr("data-style-resolution")).toBe(DEFAULT_RES);
                expect(StyleResourceResolver.resolution()).toBe(DEFAULT_RES + "/"); // after
                expect(StyleResourceResolver.getStyleResourceConfig().resolution).toBe(DEFAULT_RES + "/");
                expect(Wincor.UI.Service.Provider.ViewService.currentResolution).toBe(DEFAULT_RES);
                expect(StyleResourceResolver.updateResources).toHaveBeenCalledTimes(2);
                
                $links = jQuery("head link");
                expect($links.length).toBe(5);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/default/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/default/svg.css");
            });
    
            it("checks manually added stylesheets are still part of the list after setResolution is called twice for different resolutions", async() => {
                // This test is in respect to the fact that PF4 application browser window may start with a title bar and frame,
                // which means a smaller viewport and thus a different start resolution than the expected set target resolution!
                // While the start phase of the browser window the setResolution() and thus the updateResources() is always called twice in such a
                // case.
                // Additionally we have to ensure that one or more stylesheets which have been added via API (addStyleSheet()) become still part of
                // the resulting list as expected.
                const config = injector.mocks["config/Config"];
                const PROJECT_STYLE_TYPE = "ProjectSpecificBrand/";
                config.viewType = "touch";
                config.STYLE_TYPE = PROJECT_STYLE_TYPE;
                config.STYLE_RESOURCE_MAPPING.touch.resolution["1024x1280/"] = {
                    base: [
                        "default/default/default/sizes-positions.css",
                        "default/default/default/sizes-positions-custom.css",
                        "default/default/default/svg.css",
                        "default/default/default/layouts.css",
                        "default/default/default/layouts-custom.css"
                    ],
                    vendor: {
                        "default/": [],
                        type: {
                            "ProjectSpecificBrand/": ["default/default/ProjectSpecificBrand/Anew1.css", "default/default/ProjectSpecificBrand/Anew2.css"]
                        }
                    },
                    additional: []
                };
        
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const DEFAULT_RES = "default";
                const NEW_RES = "1024x1280";
        
                expect(StyleResourceResolver.resolution()).toBe("default/"); // before
                spyOn(StyleResourceResolver, "updateResources").and.callThrough();
    
                // first we force to another res than the 'default/' since the setResolution only triggers updateResources if we
                // there is a difference from the current resolution:
                await StyleResourceResolver.setResolution(NEW_RES);
    
                // add a stylesheet manually:
                StyleResourceResolver.addStyleSheet("project-custom_1.css", "style/default/default/project/");
                StyleResourceResolver.addStyleSheet("project-custom_2.css", "style/default/default/project/");
    
                let $links = jQuery("head link");
                expect($links.length).toBe(9);
                expect($links[0].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[2].href).toContain("style/default/default/default/svg.css");
                expect($links[3].href).toContain("style/default/default/default/layouts.css");
                expect($links[4].href).toContain("style/default/default/default/layouts-custom.css");
                expect($links[5].href).toContain("style/default/default/ProjectSpecificBrand/Anew1.css");
                expect($links[6].href).toContain("style/default/default/ProjectSpecificBrand/Anew2.css");
                expect($links[7].href).toContain("style/default/default/project/project-custom_1.css");
                expect($links[8].href).toContain("style/default/default/project/project-custom_2.css");
    
                expect(jQuery("body").attr("data-style-resolution")).toBe(NEW_RES);
                expect(StyleResourceResolver.resolution()).toBe(NEW_RES + "/"); // after
                expect(StyleResourceResolver.getStyleResourceConfig().resolution).toBe(NEW_RES + "/");
                expect(Wincor.UI.Service.Provider.ViewService.currentResolution).toBe(NEW_RES);
                expect(StyleResourceResolver.updateResources).toHaveBeenCalledTimes(1);
        
                // second force the resolution to be change again, we expect a new style config based on the "default/"
                // note that the type is still set on PROJECT_STYLE_TYPE, unless we would call StyleResourceResolver.setType()
                // Additionally we expect that our manually added stylesheets of before are restored and be part the end of list:
                await StyleResourceResolver.setResolution(DEFAULT_RES);
        
                expect(jQuery("body").attr("data-style-resolution")).toBe(DEFAULT_RES);
                expect(StyleResourceResolver.resolution()).toBe(DEFAULT_RES + "/"); // after
                expect(StyleResourceResolver.getStyleResourceConfig().resolution).toBe(DEFAULT_RES + "/");
                expect(Wincor.UI.Service.Provider.ViewService.currentResolution).toBe(DEFAULT_RES);
                expect(StyleResourceResolver.updateResources).toHaveBeenCalledTimes(2);
        
                $links = jQuery("head link");
                expect($links.length).toBe(7);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/default/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/default/svg.css");
                expect($links[5].href).toContain("style/default/default/project/project-custom_1.css");
                expect($links[6].href).toContain("style/default/default/project/project-custom_2.css");
            });
    
        });
    
        describe("style type", () => {
            it("checks setType", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                spyOn(StyleResourceResolver, "updateResources").and.callThrough();
                // header is empty and setType won't set links cause of default
                await StyleResourceResolver.setType("default/");
                expect(StyleResourceResolver.updateResources).not.toHaveBeenCalled();
                await StyleResourceResolver.setType("MercuryLight/");
                expect(StyleResourceResolver.updateResources).toHaveBeenCalled();
                let $links = jQuery("head link");
                expect($links.length).toBe(6);
                expect($links[0].href).toContain("style/default/default/default/layouts.css");
                expect($links[1].href).toContain("style/default/default/default/sizes-positions.css");
                expect($links[2].href).toContain("style/default/default/default/sizes-positions-custom.css");
                expect($links[3].href).toContain("style/default/default/MercuryLight/layouts-custom.css");
                expect($links[4].href).toContain("style/default/default/MercuryLight/svg.css");
                expect($links[5].href).toContain("style/default/default/default/softkey-custom.css");
            });
        });
    
        describe("collect resources", () => {
            beforeEach(() => {
                jQuery("body").removeAttr("data-style-resolution");
            });
        
            it("checks collectStyleResources on explicit style config", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "softkey";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                await StyleResourceResolver.collectStyleResources();
                let resourceConf = StyleResourceResolver.getStyleResourceConfig();
                expect(resourceConf.resourceRepos.length).toBe(5);
            });
    
            it("checks collectStyleResources on legacy style config", async() => {
                const config = injector.mocks["config/Config"];
                config.STYLE_RESOURCE_MAPPING.softkey = null; // remove config
                config.viewType = "softkey";
                config.CUSTOM_STYLE_RESOURCES_SOFTKEY = [];
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                let link = document.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.setAttribute("data-style-resource", "layouts.css");
                dummyHead.append(link);
                await StyleResourceResolver.collectStyleResources();
                let resourceConf = StyleResourceResolver.getStyleResourceConfig();
                expect(resourceConf.resourceRepos.length).toBe(1);
                expect(resourceConf.resourceRepos[0]).toBe("layouts.css");
            });
    
            it("checks collectStyleResources on no styles", async() => {
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const config = injector.mocks["config/Config"];
                config.STYLE_RESOURCE_MAPPING.softkey = null; // remove config
                try {
                    await StyleResourceResolver.collectStyleResources();
                } catch(e) {
                    expect(e).toContain("No style resources configured");
                    expect(StyleResourceResolver.getStyleResourceConfig().resourceRepos.length).toBe(0);
                }
            });
    
        });
        
        describe("handle events", () => {
            it("adds an event listener and receives an event", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "touch";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const listener = jasmine.createSpy("eventListener");
                const id = StyleResourceResolver.addEventListener(listener);
                StyleResourceResolver.fireEvent(StyleResourceResolver.EVENTS.RESIZE_WINDOW, {winX: 1024, winY: 1280});
                expect(listener).toHaveBeenCalledWith(StyleResourceResolver.EVENTS.RESIZE_WINDOW, {winX: 1024, winY: 1280});
                expect(id).toBe(1);
            });
            
            it("removes an event listener", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "touch";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const listener = jasmine.createSpy("eventListener")
                const id = StyleResourceResolver.addEventListener(listener);
                StyleResourceResolver.removeEventListener(id);
                StyleResourceResolver.fireEvent(StyleResourceResolver.EVENTS.RESIZE_WINDOW, {winX: 1024, winY: 1280});
                expect(listener).not.toHaveBeenCalled();
            });

            it("fire an event to all listeners", async() => {
                const config = injector.mocks["config/Config"];
                config.viewType = "touch";
                let [StyleResourceResolver] = await injector.require(["GUIAPP/content/viewmodels/base/StyleResourceResolver"]);
                const listener1 = jasmine.createSpy("eventListener1");
                const listener2 = jasmine.createSpy("eventListener2");
                const id1 = StyleResourceResolver.addEventListener(listener1);
                const id2 = StyleResourceResolver.addEventListener(listener2);
                StyleResourceResolver.fireEvent(StyleResourceResolver.EVENTS.RESIZE_WINDOW, {winX: 1024, winY: 1280});
                expect(listener1).toHaveBeenCalledWith(StyleResourceResolver.EVENTS.RESIZE_WINDOW, {winX: 1024, winY: 1280});
                expect(listener2).toHaveBeenCalledWith(StyleResourceResolver.EVENTS.RESIZE_WINDOW, {winX: 1024, winY: 1280});
                expect(id1).toBe(1);
                expect(id2).toBe(2);
                StyleResourceResolver.removeEventListener(id2);
                StyleResourceResolver.fireEvent(StyleResourceResolver.EVENTS.RESIZE_WINDOW, {winX: 1024, winY: 1280});
                expect(listener2).toHaveBeenCalledTimes(1);
                expect(listener1).toHaveBeenCalledTimes(2);
                StyleResourceResolver.removeEventListener(id1);
                StyleResourceResolver.fireEvent(StyleResourceResolver.EVENTS.RESIZE_WINDOW, {winX: 1024, winY: 1280});
                expect(listener2).toHaveBeenCalledTimes(1);
                expect(listener1).toHaveBeenCalledTimes(2);
            });
            
        });
    
    });
});