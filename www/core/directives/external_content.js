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
 * Directive to handle external content.
 *
 * @module mm.core
 * @ngdoc directive
 * @name mmExternalContent
 * @description
 * Directive to handle external content.
 *
 * This directive should be used with any element that links to external content
 * which we want to have available when the app is offline. Typically images and links.
 *
 * It uses {@link $mmFilepool} in the background.
 *
 * Attributes accepted:
 *     - siteid: Reference to the site ID if different than the site the user is connected to.
 */
.directive('mmExternalContent', function($q, $log, $mmFilepool, $mmSite, $mmSitesManager, $mmUtil) {
    $log = $log.getInstance('mmExternalContent');

    function handleExternalContent(siteId, dom, targetAttr, url, component, componentId) {

        if (!url || !$mmUtil.isPluginFileUrl(url)) {
            if (dom.tagName === 'SOURCE') {
                // Restoring original src.
                e = document.createElement('source');
                e.setAttribute('src', url);
                e.setAttribute('type', dom.getAttribute('type'));
                dom.parentNode.insertBefore(e, dom);
            }
            $log.debug('Ignoring non-pluginfile URL: ' + url);
            return;
        }

        // Get the webservice pluginfile URL, we ignore failures here.
        $mmSitesManager.getSite(siteId).then(function(site) {
            var fn,
                e;

            if (targetAttr === 'src' && dom.tagName !== 'SOURCE') {
                fn = $mmFilepool.getSrcByUrl;
            } else {
                fn = $mmFilepool.getUrlByUrl;
            }

            fn(siteId, url, component, componentId).then(function(finalUrl) {
                $log.debug('Using URL ' + finalUrl + ' for ' + url);
                if (dom.tagName === 'SOURCE' && dom.parentNode.tagName === 'AUDIO') {
                    // The browser does not catch changes in SRC, we need to add a new source.
                    e = document.createElement('source');
                    e.setAttribute('src', finalUrl);
                    e.setAttribute('type', dom.getAttribute('type'));
                    dom.parentNode.insertBefore(e, dom);
                } else {
                    dom.setAttribute(targetAttr, finalUrl);
                }
            });
        });
    }

    return {
        restrict: 'A',
        scope: {
            siteid: '='
        },
        link: function(scope, element, attrs) {
            var dom = element[0],
                component = attrs.component,
                componentId = attrs.componentId,
                sourceAttr,
                targetAttr,
                observe = false;

            if (dom.tagName === 'A') {
                targetAttr = 'href';
                sourceAttr = 'href';
                if (attrs.hasOwnProperty('ngHref')) {
                    observe = true;
                }

            } else if (dom.tagName === 'IMG') {
                targetAttr = 'src';
                sourceAttr = 'src';
                if (attrs.hasOwnProperty('ngSrc')) {
                    observe = true;
                }

            } else if (dom.tagName === 'SOURCE') {
                targetAttr = 'src';
                sourceAttr = 'targetSrc';

            } else {
                // Unsupported tag.
                $log.warn('Directive attached to non-supported tag: ' + dom.tagName);
                return;
            }

            if (observe) {
                attrs.$observe(sourceAttr, function(url) {
                    if (!url) {
                        return;
                    }
                    handleExternalContent(scope.siteid || $mmSite.getId(), dom, targetAttr, url, component, componentId);
                });
            } else {
                handleExternalContent(scope.siteid || $mmSite.getId(), dom, targetAttr, attrs[sourceAttr], component, componentId);
            }

        }
    };
});
