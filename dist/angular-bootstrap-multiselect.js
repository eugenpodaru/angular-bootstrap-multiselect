(function() {
    'use strict';

    var multiselect = angular.module('btorfs.multiselect', ['btorfs.multiselect.templates']);

    multiselect.getRecursiveProperty = function(object, path) {
        return path.split('.').reduce(function(object, x) {
            if (object) {
                return object[x];
            } else {
                return null;
            }
        }, object)
    };

    multiselect.directive('multiselect', ['$filter', '$document', '$log', function($filter, $document, $log) {
        return {
            restrict: 'AE',
            scope: {
                options: '=',
                displayProp: '@',
                idProp: '@',
                bindId: '@',
                searchLimit: '=?',
                selectionLimit: '=?',
                showSelectAll: '=?',
                showUnselectAll: '=?',
                showSearch: '=?',
                searchFilter: '=?',
                disabled: '=?ngDisabled',
                defaultText: '@',
                containerClass: '@',
                toggleClass: '@',
                dropdownClass: '@'
            },
            require: 'ngModel',
            templateUrl: 'multiselect.html',
            link: function($scope, $element, $attrs, $ngModelCtrl) {
                $scope.selectionLimit = $scope.selectionLimit || 0;
                $scope.searchLimit = $scope.searchLimit || 25;
                $scope.defaultText = $scope.defaultText || 'Select';
                $scope.bindId = $scope.bindId || false;

                // custom classes
                $scope.containerClass = $scope.containerClass || 'multiselect-container';
                $scope.toggleClass = $scope.toggleClass || 'multiselect-toggle';
                $scope.dropdownClass = $scope.dropdownClass || 'multiselect-dropdown';

                $scope.searchFilter = '';

                $scope.resolvedOptions = [];

                if (typeof $attrs.disabled != 'undefined') {
                    $scope.disabled = true;
                }

                $scope.toggleDropdown = function() {
                    $scope.open = !$scope.open;
                };

                var closeHandler = function(event) {
                    if (!$element[0].contains(event.target)) {
                        $scope.$apply(function() {
                            $scope.open = false;
                        });
                    }
                };

                $document.on('click', closeHandler);

                var updateSelectionLists = function() {
                    if (!$ngModelCtrl.$viewValue) {
                        if ($scope.selectedOptions) {
                            $scope.selectedOptions = [];
                        }

                        // take a copy
                        $scope.unselectedOptions = $scope.resolvedOptions.slice();
                    } else {
                        $scope.selectedOptions = $scope.resolvedOptions.filter(function(el) {
                            var id = $scope.getId(el);
                            var selectedId = undefined;
                            if (angular.isString($ngModelCtrl.$viewValue) ||
                                angular.isObject($ngModelCtrl.$viewValue)) {
                                selectedId = $scope.getId($ngModelCtrl.$viewValue);
                                if (id === selectedId) {
                                    return true;
                                }
                            } else if (angular.isArray($ngModelCtrl.$viewValue)) {
                                for (var i = 0; i < $ngModelCtrl.$viewValue.length; i++) {
                                    var selectedId = $scope.getId($ngModelCtrl.$viewValue[i]);
                                    if (id === selectedId) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        });

                        $scope.unselectedOptions = $scope.resolvedOptions.filter(function(el) {
                            return $scope.selectedOptions.indexOf(el) < 0;
                        });
                    }
                };

                var updateOptions = function() {
                    $scope.resolvedOptions = [];
                    if (typeof $scope.options === 'function') {
                        $scope.options().then(function(resolvedOptions) {
                            $scope.resolvedOptions = resolvedOptions;
                            updateSelectionLists();
                        });
                    } else {
                        $scope.resolvedOptions = $scope.options;
                        updateSelectionLists();
                    }
                };
                
                var updateViewValue = function(){
                  var viewValue = undefined;
                    if ($scope.selectedOptions.length === 1) {
                        if ($scope.bindId) {
                            viewValue = $scope.getId($scope.selectedOptions[0]);
                        } else {
                            viewValue = $scope.selectedOptions[0];
                        }
                    } else if ($scope.selectedOptions.length > 1) {
                        if ($scope.bindId) {
                            viewValue = $scope.selectedOptions.map(function(el) {
                                return $scope.getId(el);
                            });
                        } else {
                            viewValue = angular.copy($scope.selectedOptions);
                        }
                    }
                    $ngModelCtrl.$setViewValue(viewValue);  
                };

                $ngModelCtrl.$render = function() {
                    updateSelectionLists();
                };

                $ngModelCtrl.$viewChangeListeners.push(function() {
                    updateSelectionLists();
                });

                $ngModelCtrl.$isEmpty = function(value) {
                    if (value) {
                        return (value.length === 0);
                    } else {
                        return true;
                    }
                };

                var selectedOptionsWatcher = $scope.$watch('selectedOptions', function() {
                    updateViewValue();
                }, true);

                var optionsWatcher = $scope.$watch('options', function() {
                    updateOptions();
                }, true);

                $scope.$on('$destroy', function() {
                    $document.off('click', closeHandler);
                    if (selectedOptionsWatcher) {
                        selectedOptionsWatcher(); // Clean watcher
                    }
                    if (optionsWatcher) {
                        optionsWatcher();
                    }
                });

                $scope.getButtonText = function() {
                    if ($scope.selectedOptions && $scope.selectedOptions.length === 1) {
                        return $scope.getDisplay($scope.selectedOptions[0]);
                    }
                    if ($scope.selectedOptions && $scope.selectedOptions.length > 1) {
                        var totalSelected;
                        totalSelected = angular.isDefined($scope.selectedOptions) ? $scope.selectedOptions.length : 0;
                        if (totalSelected === 0) {
                            return $scope.defaultText;
                        } else {
                            return totalSelected + ' ' + 'selected';
                        }
                    } else {
                        return $scope.defaultText;
                    }
                };

                $scope.selectAll = function() {
                    $scope.selectedOptions = $scope.resolvedOptions;
                    $scope.unselectedOptions = [];
                };

                $scope.unselectAll = function() {
                    $scope.selectedOptions = [];
                    $scope.unselectedOptions = $scope.resolvedOptions;
                };

                $scope.toggleItem = function(item) {
                    if (typeof $scope.selectedOptions === 'undefined') {
                        $scope.selectedOptions = [];
                    }
                    var selectedIndex = $scope.selectedOptions.indexOf(item);
                    var currentlySelected = (selectedIndex !== -1);
                    if (currentlySelected && $scope.selectionLimit > 1) {
                        $scope.unselectedOptions.push($scope.selectedOptions[selectedIndex]);
                        $scope.selectedOptions.splice(selectedIndex, 1);
                    } else if (!currentlySelected && ($scope.selectionLimit === 0 || $scope.selectedOptions.length < $scope.selectionLimit)) {
                        var unselectedIndex = $scope.unselectedOptions.indexOf(item);
                        $scope.unselectedOptions.splice(unselectedIndex, 1);
                        $scope.selectedOptions.push(item);
                    } else if (!currentlySelected && $scope.selectionLimit === 1) {
                        var unselectedIndex = $scope.unselectedOptions.indexOf(item);
                        $scope.unselectedOptions.splice(unselectedIndex, 1);
                        $scope.selectedOptions.splice(0, 1);
                        $scope.selectedOptions.push(item);

                        closeHandler();
                    }
                };

                $scope.getId = function(item) {
                    if (angular.isString(item)) {
                        return item;
                    } else if (angular.isObject(item)) {
                        if ($scope.idProp) {
                            return multiselect.getRecursiveProperty(item, $scope.idProp);
                        } else {
                            $log.error('Multiselect: when using objects as model, a idProp value is mandatory.');
                            return '';
                        }
                    } else {
                        return item;
                    }
                };

                $scope.getDisplay = function(item) {
                    if (angular.isString(item)) {
                        return item;
                    } else if (angular.isObject(item)) {
                        if ($scope.displayProp) {
                            return multiselect.getRecursiveProperty(item, $scope.displayProp);
                        } else {
                            $log.error('Multiselect: when using objects as model, a displayProp value is mandatory.');
                            return '';
                        }
                    } else {
                        return item;
                    }
                };

                $scope.isSelected = function(item) {
                    if (!$scope.selectedOptions) {
                        return false;
                    }
                    var itemId = $scope.getId(item);
                    for (var i = 0; i < $scope.selectedOptions.length; i++) {
                        var selectedElement = $scope.selectedOptions[i];
                        if ($scope.getId(selectedElement) === itemId) {
                            return true;
                        }
                    }
                    return false;
                };

                // This search function is optimized to take into account the search limit.
                // Using angular limitTo filter is not efficient for big lists, because it still runs the search for
                // all elements, even if the limit is reached
                $scope.search = function() {
                    var counter = 0;
                    return function(item) {
                        if (counter > $scope.searchLimit) {
                            return false;
                        }
                        var displayName = $scope.getDisplay(item);
                        if (displayName) {
                            var result = displayName.toLowerCase().indexOf($scope.searchFilter.toLowerCase()) > -1;
                            if (result) {
                                counter++;
                            }
                            return result;
                        }
                    }
                };

                updateOptions();
            }
        };
    }]);
} ());

angular.module('btorfs.multiselect.templates', ['multiselect.html']);

angular.module("multiselect.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("multiselect.html",
    "<div class=\"btn-group {{::containerClass}}\">\n" +
    "    <button type=\"button\" class=\"form-control btn btn-default btn-block dropdown-toggle {{::toggleClass}}\" ng-click=\"toggleDropdown()\" ng-disabled=\"disabled\">\n" +
    "        {{getButtonText()}}&nbsp;<span class=\"caret\"></span>\n" +
    "    </button>\n" +
    "    <ul class=\"dropdown-menu dropdown-menu-form {{::dropdownClass}}\"\n" +
    "        ng-style=\"{display: open ? 'block' : 'none'}\" style=\"width: 100%; overflow-x: auto\">\n" +
    "\n" +
    "        <li ng-show=\"showSelectAll\">\n" +
    "            <a ng-click=\"selectAll()\" href=\"\">\n" +
    "                <span class=\"glyphicon glyphicon-ok\"></span> Select All\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"showUnselectAll\">\n" +
    "            <a ng-click=\"unselectAll()\" href=\"\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\"></span> Unselect All\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"(showSelectAll || showUnselectAll)\"\n" +
    "            class=\"divider\">\n" +
    "        </li>\n" +
    "\n" +
    "        <li role=\"presentation\" ng-repeat=\"option in selectedOptions\" class=\"active\"\n" +
    "            ng-if=\"selectionLimit && selectionLimit > 1\">\n" +
    "            <a class=\"item-selected\" href=\"\" ng-click=\"toggleItem(option); $event.stopPropagation()\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\"></span>\n" +
    "                {{getDisplay(option)}}\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"selectedOptions.length > 0\" class=\"divider\"></li>\n" +
    "\n" +
    "        <li ng-show=\"showSearch\">\n" +
    "            <div class=\"dropdown-header\">\n" +
    "                <input type=\"text\" class=\"form-control input-sm\" style=\"width: 100%;\"\n" +
    "                       ng-model=\"searchFilter\" placeholder=\"Search...\" ng-change=\"updateOptions()\"/>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "\n" +
    "        <li ng-show=\"showSearch\" class=\"divider\"></li>\n" +
    "        <li role=\"presentation\" ng-repeat=\"option in unselectedOptions | filter:search() | limitTo: searchLimit\"\n" +
    "            ng-if=\"!isSelected(option)\"\n" +
    "            ng-class=\"{disabled : selectionLimit && selectionLimit > 1 && selectedOptions.length >= selectionLimit}\">\n" +
    "            <a class=\"item-unselected\" href=\"\" ng-click=\"toggleItem(option); $event.stopPropagation()\">\n" +
    "                {{getDisplay(option)}}\n" +
    "            </a>\n" +
    "        </li>\n" +
    "\n" +
    "        <li class=\"divider\" ng-show=\"selectionLimit > 1\"></li>\n" +
    "        <li role=\"presentation\" ng-show=\"selectionLimit > 1\">\n" +
    "            <a>{{selectedOptions.length || 0}} / {{selectionLimit}} selected</a>\n" +
    "        </li>\n" +
    "\n" +
    "    </ul>\n" +
    "</div>");
}]);
