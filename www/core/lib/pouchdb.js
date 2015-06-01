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

angular.module('mm.core')

/**
 * @ngdoc service
 * @name $mmPouch
 * @module mm.core
 * @description
 * This service allows to interact with the local database to store and retrieve data.
 */
.factory('$mmPouch', function($q, $log, pouchDB) {

    $log = $log.getInstance('$mmPouch');

    var self = {},
        dbInstances = {};

    function DB(name) {
        this.db = pouchDB(name);
    }

    self.destroy = function(name) {
        var db = self.get(name);
        delete dbInstances[name];
        return db.destroy();
    };

    self.get = function(name) {
        if (typeof dbInstances[name] === 'undefined') {
            dbInstances[name] = new DB(name);
        }
        return dbInstances[name];
    };

    return self;

});
