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

    multiselect.directive('multiselect', function($filter, $document, $log) {
        return {
            restrict: 'AE',
            scope: {
                options: '=',
                displayProp: '@',
                idProp: '@',
                bindId: '@',
                searchLimit: '=?',
                selectionLimit: '=?',
                selectedDisplayLimit: '=?',
                unselectedDisplayLimit: '=?',
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
                $scope.selectedDisplayLimit = $scope.selectedDisplayLimit || 5;
                $scope.unselectedDisplayLimit = $scope.unselectedDisplayLimit || 10;
                $scope.defaultText = $scope.defaultText || 'Select';
                $scope.bindId = $scope.bindId || false;

                // custom classes
                $scope.containerClass = $scope.containerClass || 'btn-group';
                $scope.toggleClass = $scope.toggleClass || 'form-control dropdown-toggle btn btn-default btn-block';
                $scope.dropdownClass = $scope.dropdownClass || 'dropdown-menu dropdown-menu-form';

                $scope.searchFilter = '';

                // initialize the display indexes
                $scope.selectedDisplayIndex = 0;
                $scope.unselectedDisplayIndex = 0;

                $scope.resolvedOptions = [];
                $scope.selectedOptions = [];
                $scope.unselectedOptions = [];

                // initialize the views
                $scope.selectedOptionsView = [];
                $scope.unselectedOptionsFiltered = [];
                $scope.unselectedOptionsView = [];

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

                // This search function is optimized to take into account the search limit.
                // Using angular limitTo filter is not efficient for big lists, because it still runs the search for
                // all elements, even if the limit is reached
                var search = function() {
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

                var updateSelectionViews = function(reset) {
                    if (reset) {
                        $scope.selectedDisplayIndex = 0;
                        $scope.unselectedDisplayIndex = 0;
                    }

                    $scope.selectedOptionsView = $scope.selectedOptions.slice($scope.selectedDisplayIndex,
                        $scope.selectedDisplayIndex + $scope.selectedDisplayLimit);

                    $scope.unselectedOptionsFiltered = $filter('filter')($scope.unselectedOptions, search());
                    $scope.unselectedOptionsView = $scope.unselectedOptionsFiltered.slice($scope.unselectedDisplayIndex,
                        $scope.unselectedDisplayIndex + $scope.unselectedDisplayLimit);
                };

                var updateSelectionLists = function() {
                    if (!$ngModelCtrl.$viewValue) {
                        $scope.selectedOptions = [];
                        // take a copy
                        $scope.unselectedOptions = $scope.resolvedOptions.slice();
                    } else {
                        $scope.selectedOptions = $scope.resolvedOptions.filter(function(el) {
                            var id = $scope.getId(el);
                            var selectedId = undefined;
                            if (angular.isArray($ngModelCtrl.$viewValue)) {
                                for (var i = 0; i < $ngModelCtrl.$viewValue.length; i++) {
                                    var selectedId = $scope.getId($ngModelCtrl.$viewValue[i]);
                                    if (id === selectedId) {
                                        return true;
                                    }
                                }
                            } else {
                                selectedId = $scope.getId($ngModelCtrl.$viewValue);
                                if (id === selectedId) {
                                    return true;
                                }
                            }
                            return false;
                        });

                        $scope.unselectedOptions = $scope.resolvedOptions.filter(function(el) {
                            return $scope.selectedOptions.indexOf(el) < 0;
                        });
                    }

                    updateSelectionViews(true);
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

                var updateViewValue = function() {
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
                        // clean watcher
                        selectedOptionsWatcher();
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

                $scope.update = function() {
                    updateSelectionViews(true);
                };

                $scope.selectAll = function() {
                    $scope.selectedOptions = $scope.resolvedOptions.slice();
                    $scope.unselectedOptions = [];

                    updateSelectionViews(true);
                };

                $scope.unselectAll = function() {
                    $scope.selectedOptions = [];
                    $scope.unselectedOptions = $scope.resolvedOptions.slice();

                    updateSelectionViews(true);
                };

                $scope.toggleItem = function(item) {
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

                        $scope.toggleDropdown();
                    }

                    updateSelectionViews();
                };

                $scope.getId = function(item) {
                    if (angular.isObject(item)) {
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
                    if (angular.isObject(item)) {
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

                $scope.unselectedPageUp = function() {
                    var newStartIndex = $scope.unselectedDisplayIndex - $scope.unselectedDisplayLimit;
                    $scope.unselectedDisplayIndex = newStartIndex > 0 ? newStartIndex : 0;

                    updateSelectionViews();
                };

                $scope.unselectedPageDown = function() {
                    var limit = $scope.unselectedOptionsFiltered.length;
                    var newStartIndex = $scope.unselectedDisplayIndex + $scope.unselectedDisplayLimit;
                    $scope.unselectedDisplayIndex = newStartIndex < limit ? newStartIndex : limit - $scope.unselectedDisplayLimit - 1;

                    updateSelectionViews();
                };

                $scope.selectedPageUp = function() {
                    var newStartIndex = $scope.selectedDisplayIndex - $scope.selectedDisplayLimit;
                    $scope.selectedDisplayIndex = newStartIndex > 0 ? newStartIndex : 0;

                    updateSelectionViews();
                };

                $scope.selectedPageDown = function() {
                    var limit = $scope.selectedOptions.length;
                    var newStartIndex = $scope.selectedDisplayIndex + $scope.selectedDisplayLimit;
                    $scope.selectedDisplayIndex = newStartIndex < limit ? newStartIndex : limit - $scope.selectedDisplayLimit - 1;

                    updateSelectionViews();
                };

                updateOptions();
            }
        };
    });
} ());
