/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.extensions_test.js 4.3.1-201130-21-086c3328-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";

let Wincor;
let ext;

describe("wn.UI.extensions", () => {

    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        ext = getExtensions({Wincor, LogProvider});
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("AsyncJobQueue", () => {

        it("can be set up", done => { // done is used for async behavior
            const queue = new ext.Promises.AsyncJobQueue();
            expect(queue.setName("TESTNAME")).toBe(queue);
            expect(queue.name).toBe("TESTNAME");
            expect(queue.setConcurrency(true)).toBe(queue);
            expect(queue.concurrency).toBe(true);
            expect(queue.setConcurrency(false)).toBe(queue);
            expect(queue.concurrency).toBe(false);
            expect(queue.setDefaultJobTimeout(1234)).toBe(queue);
            expect(queue.defaultJobTimeout).toBe(1234);
            expect(queue.setStopOnError()).toBe(queue);
            expect(queue.stopOnError).toBe(true);
            expect(queue.setStopOnError(true)).toBe(queue);
            expect(queue.stopOnError).toBe(true);
            done();
        });

        it("can serialize jobs: f->f", done => {
            const queue = new ext.Promises.AsyncJobQueue(true);
            expect(queue.concurrency).toBe(true);
            const deferred1 = ext.Promises.deferred();
            const deferred2 = ext.Promises.deferred();
            const f1 = jasmine.createSpy().and.callFake(() => {
                return deferred1.promise;
            });

            const f2 = jasmine.createSpy().and.callFake(() => {
                return deferred2.promise;
            });
            const mainPromise = queue.add(f1);
            expect(mainPromise.isPending()).toBe(true);

            deferred1.promise.catch(() => {});
            deferred2.promise.catch(() => {});
            
            mainPromise
                .finally(() => {
                    expect(mainPromise.isResolved()).toBe(true);
                    done();
                })
                .catch(() => {
                    done();
                });
            

            expect(queue.isRunning()).toBe(true);
            expect(queue.enqueuedJobs.length).toBe(0);
            queue.add(f2);
            expect(queue.enqueuedJobs.length).toBe(1);
            expect(f2).not.toHaveBeenCalled();
            //TODO: How to solve such timing issues? It is a bit odd to just delay for some time...
            deferred1.promise.delay(50).then(() => {
                expect(f2).toHaveBeenCalledTimes(1);
                deferred2.resolve();
            });
            deferred1.resolve();
        });

        it("supports job timeouts with delayed start", done => {
            const queue = new ext.Promises.AsyncJobQueue(true).setStopOnError(true);
            expect(queue.concurrency).toBe(true);
            const deferred1 = ext.Promises.deferred();
            const deferred2 = ext.Promises.deferred();
            const f1 = jasmine.createSpy().and.callFake(() => {
                return deferred1.promise;
            });

            const f2 = jasmine.createSpy().and.callFake(() => {
                return deferred2.promise;
            });
            const mainPromise = queue.add(f1);
            expect(mainPromise.isPending()).toBe(true);

            deferred1.promise.catch(() => {});
            deferred2.promise.catch(() => {});
            
            mainPromise
                .finally(() => {
                    expect(mainPromise.isRejected()).toBe(true);
                    // below decoupling is just for tracing
                    setTimeout(done, 1);
                })
                .catch(() => {
                    done();
                });

            expect(queue.isRunning()).toBe(true);
            expect(queue.enqueuedJobs.length).toBe(0);
            // as soon as p1 resolves, timer should start for f2
            queue.add(f2, void 0, 20, "fx2 timeout", deferred1.promise);
            expect(queue.enqueuedJobs.length).toBe(1);
            expect(f2).not.toHaveBeenCalled();
            //TODO: How to solve such timing issues? It is a bit odd to just delay for some time...
            deferred1.promise.delay(100)
                .then(() => {
                    expect(f2).toHaveBeenCalledTimes(1);
                    expect(queue.isRunning()).toBe(false);
                    expect(queue.enqueuedJobs.length).toBe(0);
                })
                .catch(() => {
                    done();
                });
            deferred1.resolve();
        });

        it("can run jobs with same concurrency id in parallel: f1f1->f2", done => {
            const queue = new ext.Promises.AsyncJobQueue(true);
            expect(queue.concurrency).toBe(true);
            const deferred1 = ext.Promises.deferred();
            const deferred2 = ext.Promises.deferred();
            const deferred3 = ext.Promises.deferred();
            const f1 = jasmine.createSpy().and.callFake(() => {
                return deferred1.promise;
            });

            const f2 = jasmine.createSpy().and.callFake(() => {
                return deferred2.promise;
            });

            const f3 = jasmine.createSpy().and.callFake(() => {
                return deferred3.promise;
            });

            const mainPromise = queue.add(f1, 1);

            deferred1.promise
                .catch(() => {
                });
            deferred2.promise
                .catch(() => {
                });
            deferred3.promise
                .catch(() => {
                });
            
            
            // first passed function should have been invoked immediately
            expect(f1).toHaveBeenCalledTimes(1);
            // mainPromise is pending until all fxs/Proms in the queue have finished/resolved
            expect(mainPromise.isPending()).toBe(true);
            expect(queue.isRunning()).toBe(true);
            queue.add(f2, 1);
            queue.add(f3, 2); // other concurrency id... job will be postponed
            // second job is started immediately and promise is pushed into working queue
            expect(f2).toHaveBeenCalledTimes(1);
            expect(queue.enqueuedJobs.length).toBe(2);
            mainPromise
                .finally(() => {
                    expect(mainPromise.isResolved()).toBe(true);
                    done();
                })
                .catch(() => {
                    done();
                });

            expect(f3).not.toHaveBeenCalled();
            deferred1.resolve();
            expect(f3).not.toHaveBeenCalled();
            deferred2.promise.delay(50)
                .then(() => {
                    expect(f3).toHaveBeenCalledTimes(1);
                    deferred3.resolve();
                })
                .catch(() => {
                });
            
            deferred2.resolve();
        });

        it("takes mixed functions/promises", done => { // done is used for async behavior
            const queue = new ext.Promises.AsyncJobQueue(true);
            expect(queue.concurrency).toBe(true);
            const deferred1 = ext.Promises.deferred();
            const deferred2 = ext.Promises.deferred();
            const f1 = jasmine.createSpy().and.callFake(() => {
                return deferred1.promise;
            });

            deferred1.promise.catch(() => {});
            deferred2.promise.catch(() => {});
            
            const mainPromise = queue.add(f1, 1);
            queue.add(deferred2.promise, 2);
            queue.add(f1, 1);
            expect(f1).toHaveBeenCalledTimes(1);
            deferred1.promise.delay(50).then(() => {
                // 3rd function must only be called after promise2 has been resolved, because they differ in concurrencyId
                expect(f1).toHaveBeenCalledTimes(1);
                deferred2.promise.delay(50).then(() => {
                    expect(f1).toHaveBeenCalledTimes(2);
                });
                deferred2.resolve();
            });
            deferred1.resolve();
            mainPromise.
                finally(done)
                .catch(() => {
                    done();
                });
        });

        it("can process synchronous functions that do not return promises", done => { // done is used for async behavior
            // require base service. All dependencies are mocked by "beforeEach" above
            const queue = new ext.Promises.AsyncJobQueue(true);
            expect(queue.concurrency).toBe(true);
            const deferred2 = ext.Promises.deferred();
            const f1 = jasmine.createSpy().and.callFake(() => {
                // dummy sync function
            });

            const mainPromise = queue.add(f1, 1);
            queue.add(deferred2.promise, 2);
            queue.add(f1, 1);
            expect(f1).toHaveBeenCalledTimes(1);
            deferred2.promise.delay(50)
                .then(() => {
                    expect(f1).toHaveBeenCalledTimes(2);
                })
                .catch(() => {
                    done();
                });
            
            deferred2.resolve();
            mainPromise
                .finally(done)
                .catch(() => {
                    done();
                });
        });

        it("can be cancelled", done => { // done is used for async behavior
            const queue = new ext.Promises.AsyncJobQueue(true);
            expect(queue.concurrency).toBe(true);
            const deferred2 = ext.Promises.deferred();
            const f1 = jasmine.createSpy().and.callFake(() => {
                // dummy sync function
            });

            queue.add(f1, 1);
            queue.add(deferred2.promise, 2);
            queue.add(f1, 1);
            expect(f1).toHaveBeenCalledTimes(1);
            deferred2.promise.delay(50).then(() => {
                expect(f1).toHaveBeenCalledTimes(2);
            });

            // do not resolve deferred2 but cancel queue at this point
            queue.cancel().then(() => {
                expect(queue.isRunning()).toBe(false);
                expect(queue.enqueuedJobs.length).toBe(0);
                expect(queue.mainPromise.isPending()).toBe(false);
                expect(queue.workObjects.next).toThrow();
                done();
            });
        });

        it("generates queue names if not given", done => { // done is used for async behavior
            const queue = new ext.Promises.AsyncJobQueue();
            // expect generated name, if not given
            expect(queue.name).not.toBe("");
            const queue1 = new ext.Promises.AsyncJobQueue();
            expect(queue1.name !== queue.name).toBe(true);
            done();
        });

        it("allows jobs to decide whether any job-reject will continue the whole queue", done => { // done is used for async behavior
            const queue = new ext.Promises.AsyncJobQueue("RejectionTest");
            let mainPromise = queue.add(ext.Promises.promise((res, rej)=>{}), void 0, 1, "Job timed out", void 0, true);
            mainPromise
                .then(done)
                .catch(done.fail);
        });

        it("allows jobs to decide whether a special job-reject will continue the whole queue", done => { // done is used for async behavior
            const queue = new ext.Promises.AsyncJobQueue("RejectionTest");
            let mainPromise = queue.add(ext.Promises.promise((res, rej)=>{}), void 0, 1, "Job timed out", void 0, false);
            const TEST_REASON = "TEST_REASON";
            const TEST_REASON2 = "TEST_REASON2";
            mainPromise
                .catch(() => {
                    let def = ext.Promises.deferred();
                    mainPromise = queue.add(def.promise, void 0, 0, void 0, void 0, true);
                    def.promise.catch(() => {});
                    def.reject(TEST_REASON);
                    
                    return mainPromise; // should be resolved
                })
                .then(() => {
                    let def = ext.Promises.deferred();
                    mainPromise = queue.add(def.promise, void 0, 0, void 0, void 0);
                    def.promise.catch(() => {});
                    def.reject(TEST_REASON2);
                    return mainPromise; // should be rejected
                })
                .then(done.fail)
                .catch(() => {
                    // to not pass error into done function! This will break the test
                    done();
                });
        });

        it("rejects the whole queue on job failure if job did not specify continueOnErrors", done => { // done is used for async behavior
            const queue = new ext.Promises.AsyncJobQueue("RejectionTest");
            let mainPromise = queue.add(ext.Promises.promise((res, rej)=>{}), void 0, 1, "Job timed out", void 0);
            mainPromise
                .then(done.fail)
                .catch(() => {
                    // to not pass error into done function! This will break the test
                    done();
                });
        });

        it("sets 'currentlyExecutingConcurrency' when starting a job", done => {
            const queue = new ext.Promises.AsyncJobQueue(true);
            const CONCURRENCY_1 = "CONCURRENCY_1";
            const CONCURRENCY_2 = "CONCURRENCY_2";
            expect(queue.concurrency).toBe(true);
            const deferred1 = ext.Promises.deferred();
            const deferred2 = ext.Promises.deferred();
            const f1 = jasmine.createSpy().and.callFake(() => {
                // at this point of time 'currentlyExecutingConcurrency' must be correct
                expect(queue.currentlyExecutingConcurrency).toBe(CONCURRENCY_1);
                return deferred1.promise;
            });

            deferred1.promise.catch(() => {});
            deferred2.promise.catch(() => {});
            
            const f2 = jasmine.createSpy().and.callFake(() => {
                expect(queue.currentlyExecutingConcurrency).toBe(CONCURRENCY_2);
                return deferred2.promise;
            });
            const mainPromise = queue.add(f1, CONCURRENCY_1);
            expect(mainPromise.isPending()).toBe(true);

            mainPromise
                .finally(() => {
                    expect(mainPromise.isResolved()).toBe(true);
                    done();
                })
                .catch(() => {
                    done();
                });

            expect(queue.isRunning()).toBe(true);
            expect(queue.enqueuedJobs.length).toBe(0);
            queue.add(f2, CONCURRENCY_2);
            expect(queue.enqueuedJobs.length).toBe(1);
            expect(f2).not.toHaveBeenCalled();
            //TODO: How to solve such timing issues? It is a bit odd to just delay for some time...
            deferred1.promise.delay(50).then(() => {
                expect(f2).toHaveBeenCalledTimes(1);
                deferred2.resolve();
            });
            deferred1.resolve();
        });
    });

    describe("bluebird Promises", () => {
        xit("check when longStackTraces enabled", done => { // done is used for async behavior
            // activate longStackTraces
            Wincor.UI.longStackTraces = true; // TODO this is not working because the loading of extension module is already done once and this is to late here now
            
            expect(ext.Promises.Promise.hasLongStackTraces()).toBe(true);
            // reset
            Wincor.UI.longStackTraces = false;
            done();
        });
    });
});

