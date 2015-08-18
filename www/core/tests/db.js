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

describe('$mmDB', function() {
    var mmDB,
        timeout,
        q,
        dbname = 'randomname' + Math.round(Math.random() * 1000000),
        storeName = 'db_fake_store_name',
        dbschema = {
            stores: [{
                name: storeName,
                keyPath: 'id',
                indexes: [
                    {
                        name: 'name'
                    }, {
                        name: 'type'
                    }
                ]
            }]
        },
        dboptions = {
            autoSchema: true
        };

    // Injecting.
    beforeEach(module('mm.core'));

    beforeEach(inject(function($mmDB, $httpBackend, $timeout, $q) {
        mmDB = $mmDB;
        timeout = $timeout;
        q = $q;

        // Capture loading of templates and json files.
        $httpBackend.whenGET(/.*\/templates.*/).respond(200, '');
        $httpBackend.whenGET(/build.*/).respond(200, '');
        $httpBackend.whenGET(/core\/assets.*/).respond(200, '');
        $httpBackend.when('GET', 'config.json').respond(200, {'app_id': 'com.moodle.moodlemobile'});
    }));

    it('a DB name can be retrieved', function() {
        console.log(' ***** START $mmDB getName ***** ');
        var db = mmDB.getDB(dbname, dbschema, dboptions);
        expect(db.getName()).toEqual(dbname);
        console.log(' ***** FINISH $mmDB getName ***** ');
    });

    it('DB allows inserting/retrieving entries by ID', function(done) {
        console.log(' ***** START $mmDB insert/get - by id ***** ');
        var db = mmDB.getDB(dbname, dbschema, dboptions),
            randomid = 'randomid' + Math.round(Math.random() * 1000000),
            randomname = 'randomname' + Math.round(Math.random() * 1000000);

        // Insert an entry.
        db.insert(storeName, {id: randomid, name: randomname}).then(function() {
            // Retrieve the inserted entry.
            mmFlush(timeout.flush, 100);
            return db.get(storeName, randomid).then(function(entry) {
                expect(entry.name).toEqual(randomname);
            });
        }).catch(function() {
            // Failed test.
            expect(false).toEqual(true);
        }).finally(function() {
            // Clear DB to have a clean DB for next tests (or re-execute this one).
            db.removeAll(storeName).then(function() {
                console.log(' ***** FINISH $mmDB insert/get - by id ***** ');
                done();
            });
            mmFlush(timeout.flush, 100);
        });

        mmFlush(timeout.flush, 100);
    });

    it('DB allows removing all entries in a store', function(done) {
        console.log(' ***** START $mmDB removeAll ***** ');
        var db = mmDB.getDB(dbname, dbschema, dboptions),
            randomid = 'randomid' + Math.round(Math.random() * 1000000),
            randomname = 'randomname' + Math.round(Math.random() * 1000000);

        // Insert an entry.
        db.insert(storeName, {id: randomid, name: randomname}).then(function() {
            // Remove all entries in DB.
            var p = db.removeAll(storeName).then(function() {
                // Try to get the stored entry.
                var p = db.get(storeName, randomid).then(function() {
                    // Entry shouldn't be there, test failed.
                    expect(true).toEqual(false);
                }).catch(function() {
                    // Success.
                });
                mmFlush(timeout.flush, 100);
                return p;
            });
            mmFlush(timeout.flush, 100);
            return p;
        }).catch(function() {
            // Failed test.
            expect(false).toEqual(true);
        }).finally(function() {
            console.log(' ***** FINISH $mmDB removeAll ***** ');
            done();
        });

        mmFlush(timeout.flush, 100);
    });

    it('DB allows counting all entries in a store, or count entries with some conditions', function(done) {
        console.log(' ***** START $mmDB count ***** ');
        var db = mmDB.getDB(dbname, dbschema, dboptions),
            promises = [],
            idsUsed = [];

        // Insert 10 items in DB, with different types.
        for (var i = 0; i < 10; i++) {
            var randomid = 'randomid' + Math.round(Math.random() * 1000000),
                randomname = 'randomname' + Math.round(Math.random() * 1000000),
                type = i < 4 ? 'male' : 'female';
            while (idsUsed.indexOf(randomid) != -1) {
                // ID already used, get another one.
                randomid = 'randomid' + Math.round(Math.random() * 1000000);
            }
            promises.push(db.insert(storeName, {id: randomid, name: randomname, type: type}));
        }

        q.all(promises).then(function() {
            // Count entries.
            var p = db.count(storeName).then(function(count) {
                expect(count).toEqual(10);

                // Count entries of type "male".
                var p =  db.count(storeName, ['type', '=', 'male']).then(function(count) {
                    expect(count).toEqual(4);
                });
                mmFlush(timeout.flush, 100);
                return p;
            });
            mmFlush(timeout.flush, 100);
            return p;

        }).catch(function() {
            // Failed test.
            expect(false).toEqual(true);
        }).finally(function() {
            // Clear DB to have a clean DB for next tests (or re-execute this one).
            db.removeAll(storeName).then(function() {
                console.log(' ***** FINISH $mmDB count ***** ');
                done();
            });
            mmFlush(timeout.flush, 100);
        });

        mmFlush(timeout.flush, 1000);
    });

    it('DB allows querying and ordering', function(done) {
        console.log(' ***** START $mmDB query/where ***** ');
        var db = mmDB.getDB(dbname, dbschema, dboptions),
            promises = [],
            idsUsed = [];

        // Insert 10 items in DB, with different types.
        for (var i = 0; i < 10; i++) {
            var randomid = 'randomid' + Math.round(Math.random() * 1000000),
                randomname = 'randomname' + Math.round(Math.random() * 1000000),
                type = i < 4 ? 'male' : 'female';
            while (idsUsed.indexOf(randomid) != -1) {
                // ID already used, get another one.
                randomid = 'randomid' + Math.round(Math.random() * 1000000);
            }
            promises.push(db.insert(storeName, {id: randomid, name: randomname, type: type}));
        }

        q.all(promises).then(function() {
            // Count entries.
            // Retrieve "female" entries ordered by id.
            var p = db.query(storeName, ['type', '=', 'female'], 'id').then(function(entries) {
                expect(entries.length).toEqual(6);
                for (var i = 1; i < entries.length; i++) {
                    expect(entries[i - 1].id <= entries[i].id).toBe(true);
                }

                // .query method works, let's test .where method.
                var p = db.where(storeName, 'type', '=', 'female').then(function(entries) {
                    expect(entries.length).toEqual(6);
                });
                mmFlush(timeout.flush, 400);
                return p;
            });
            mmFlush(timeout.flush, 400);
            return p;
        }).catch(function() {
            // Failed test.
            expect(false).toEqual(true);
        }).finally(function() {
            // Clear DB to have a clean DB for next tests (or re-execute this one).
            db.removeAll(storeName).then(function() {
                console.log(' ***** FINISH $mmDB query/where ***** ');
                done();
            });
            mmFlush(timeout.flush, 400);
        });

        mmFlush(timeout.flush, 400);
    });

});
