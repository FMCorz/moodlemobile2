// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var flushes = [];
function mmFlush(fn, delay) {
    flushes.push(setTimeout(fn, 1000));
}

(function() {
    // angular
    // .module('mm.core')
    // .run(function($httpBackend) {
    //     $httpBackend.whenGET(/core\/assets.*/).respond(200, '');
    //     $httpBackend.whenGET(/build.*/).respond(200, '');
    //     $httpBackend.whenGET(/config.json/).respond(200, {});
    //     console.log('testsssssssssssssssssssssssssssssssssssssssssssssssssssssss');
    // });
    // console.log('==============================================');

    beforeEach(function() {
        flushes = [];
        // window.indexedDB.webkitGetDatabaseNames().onsuccess = function(sender,args){
        //     var r = sender.target.result;
        //     for(var i in r)
        //     {
        //         indexedDB.deleteDatabase(r[i]);
        //     }
        // };
    });
    afterEach(function() {
        angular.forEach(flushes, function(v) {
            console.log("==================================");
            console.log(v);
            clearTimeout(v);
        });
    });

    // beforeEach(module('mm.core', function($translateProvider) {
    //     var translationMock = {
    //         'mm.core.day': 'day',
    //         'mm.core.days': 'days',
    //         'mm.core.hour': 'hour',
    //         'mm.core.hours': 'hours',
    //         'mm.core.min': 'min',
    //         'mm.core.mins': 'mins',
    //         'mm.core.sec': 'sec',
    //         'mm.core.secs': 'secs',
    //         'mm.core.year': 'year',
    //         'mm.core.years': 'years',
    //         'mm.core.now': 'now'
    //     };
    //     $translateProvider.translations('en', translationMock).preferredLanguage('en');
    // }));

    // beforeEach(inject(function(_$httpBackend_) {
    //     $httpBackend = _$httpBackend_;

    //     $httpBackend.whenGET(/core\/assets.*/).respond(200, '');
    //     $httpBackend.whenGET(/build.*/).respond(200, '');
    //     $httpBackend.whenGET(/config.json/).respond(200, {});
    // }));
})();
