(function() {
    "use strict";

    angular
        .module("ui.multiselect", ["ui.multiselect.templates"])
        .component("uiMultiselect", {
            controller: uiMultiselectController,
            controllerAs: "vm",
            templateUrl: "multiselect.html",
            transclude: true,
            bindings: {
                items: "=",
                options: "="
            },
            require: {
                ngModel: "ngModel"
            }
        })
        .component("uiItem", {
            controller: uiItemController,
            controllerAs: "vm",
            bindings: {
                itemId: "@",
                itemDisplay: "@",
                itemSelected: "@"
            },
            require: {
                uiMultiselectController: "^uiMultiselect"
            }
        });

    /**
     * The multiselect controller
     */

    uiMultiselectController.$inject = ["$scope", "$element", "$document", "$filter"];

    function uiMultiselectController($scope, $element, $document, $filter) {
        var vm = this;

        vm.$onInit = function() {
            var options = {};
            var defaultOptions = {
                selectionLimit: 0,
                searchLimit: 25,
                selectedDisplayLimit: 5,
                unselectedDisplayLimit: 10,
                defaultText: "Select",
                bindId: false,

                containerClass: "multiselect-container",
                toggleClass: "multiselect-toggle",
                dropdownClass: "multiselect-dropdown",
                searchClass: "multiselect-search",

                disabled: false,
                formElement: ""
            };

            angular.extend(options, defaultOptions, vm.options);

            vm.options = options;

            vm.searchFilter = "";

            /** initialize the display indexes */
            vm.selectedDisplayIndex = 0;
            vm.unselectedDisplayIndex = 0;

            vm.resolvedItems = [];

            vm.ngModel.$render = updateSelectionLists;
            vm.ngModel.$viewChangeListeners.push(updateSelectionLists);
            vm.ngModel.$isEmpty = isValueEmpty;

            vm.selectedItemsWatcher = $scope.$watch("vm.selectedItems", onSelectedItemsChanged, true);
            vm.itemsWatcher = $scope.$watch("vm.items", onItemsChanged, true);

            $document.on("click", closeHandler);
            $document.on("wheel", scrollHandler);

            vm.toggleDropdown = toggleDropdown;
            vm.toggleItem = toggleItem;
            vm.addItem = addItem;
            vm.getButtonText = getButtonText;
            vm.getId = getId;
            vm.getDisplay = getDisplay;
            vm.update = update;
            vm.selectAll = selectAll;
            vm.unselectAll = unselectAll;
            vm.unselectedPageUp = unselectedPageUp;
            vm.unselectedPageDown = unselectedPageDown;
            vm.selectedPageUp = selectedPageUp;
            vm.selectedPageDown = selectedPageDown;

            updateItems();
        };

        vm.$onDestroy = function() {
            $document.off("wheel", scrollHandler);
            $document.off("click", closeHandler);

            if (vm.selectedItemsWatcher) {
                vm.selectedItemsWatcher();
            }
            if (vm.itemsWatcher) {
                vm.itemsWatcher();
            }
        };

        var toggleDropdown = function() {
            vm.open = !vm.open;
        };

        var closeHandler = function(event) {
            if (!$element[0].contains(event.target)) {
                $scope.$apply(function() {
                    vm.open = false;
                });
            }
        };

        var scrollHandler = function(event) {
            var ev = event.originalEvent || event;
            var prevent = function() {
                ev.stopPropagation();
                ev.preventDefault();
                return false;
            }

            if (vm.open && vm.isMouseOver) {
                var scrollDown = ev.deltaY > 0;

                if (scrollDown) {
                    if (selectedPageDown(1) || unselectedPageDown(1)) {
                        $scope.$apply(function() {
                            updateSelectionViews();
                        });
                        return prevent();
                    }
                } else {
                    if (unselectedPageUp(1) || selectedPageUp(1)) {
                        $scope.$apply(function() {
                            updateSelectionViews();
                        });
                        return prevent();
                    }
                }
            }
        };

        var isValueEmpty = function(value) {
            if (value && angular.isArray(value)) {
                return (value.length === 0);
            } else {
                return !!value;
            }
        };

        /**
         * This search function is optimized to take into account the search limit.
         * Using angular limitTo filter is not efficient for big lists, because it still runs the search for
         * all elements, even if the limit is reached
         */
        var search = function() {
            var counter = 0;
            return function(item) {
                if (counter > vm.options.searchLimit) {
                    return false;
                }
                var displayName = vm.getDisplay(item);
                if (displayName) {
                    var result = displayName.toLowerCase().indexOf(vm.searchFilter.toLowerCase()) > -1;
                    if (result) {
                        counter++;
                    }
                    return result;
                }
            }
        };

        var updateSelectionViews = function(reset) {
            if (reset) {
                vm.selectedDisplayIndex = 0;
                vm.unselectedDisplayIndex = 0;
            }

            vm.selectedItemsView = vm.selectedItems.slice(vm.selectedDisplayIndex,
                vm.selectedDisplayIndex + vm.options.selectedDisplayLimit);

            if (vm.selectedItemsView.length === 0 && vm.selectedDisplayIndex > 0) {
                selectedPageUp();
            }

            vm.unselectedItemsFiltered = $filter("filter")(vm.unselectedItems, search());
            vm.unselectedItemsView = vm.unselectedItemsFiltered.slice(vm.unselectedDisplayIndex,
                vm.unselectedDisplayIndex + vm.options.unselectedDisplayLimit);

            if (vm.unselectedItemsView.length === 0 && vm.unselectedDisplayIndex > 0) {
                unselectedPageUp();
            }

            updateCapabilities();
        };

        var updateCapabilities = function() {
            vm.hasUnselectedPageDown = vm.unselectedItemsFiltered.length > vm.options.unselectedDisplayLimit;
            vm.canUnselectedPageDown = vm.unselectedDisplayIndex + vm.options.unselectedDisplayLimit < vm.unselectedItemsFiltered.length;

            vm.hasUnselectedPageUp = vm.unselectedItemsFiltered.length > vm.options.unselectedDisplayLimit;
            vm.canUnselectedPageUp = vm.unselectedDisplayIndex > 0;

            vm.hasSelectedPageDown = vm.selectedItems.length > vm.options.selectedDisplayLimit;
            vm.canSelectedPageDown = vm.selectedDisplayIndex + vm.options.selectedDisplayLimit < vm.selectedItems.length;

            vm.hasSelectedPageUp = vm.selectedItems.length > vm.options.selectedDisplayLimit;
            vm.canSelectedPageUp = vm.selectedDisplayIndex > 0;

            vm.canSelectItem = !(vm.options.selectionLimit && vm.options.selectionLimit > 1 && vm.selectedItems.length >= vm.options.selectionLimit);
        };

        var updateSelectionLists = function() {
            if (vm.resolvedItems.length === 0)
                return;

            if (!vm.ngModel.$viewValue) {
                vm.selectedItems = [];
                /** take a copy */
                vm.unselectedItems = vm.resolvedItems.slice();
            } else {
                vm.selectedItems = vm.resolvedItems.filter(function(el) {
                    var id = vm.getId(el);
                    var selectedId = undefined;
                    if (angular.isArray(vm.ngModel.$viewValue)) {
                        for (var i = 0; i < vm.ngModel.$viewValue.length; i++) {
                            var selectedId = vm.getId(vm.ngModel.$viewValue[i]);
                            if (id === selectedId) {
                                return true;
                            }
                        }
                    } else {
                        selectedId = vm.getId(vm.ngModel.$viewValue);
                        if (id === selectedId) {
                            return true;
                        }
                    }
                    return false;
                });

                vm.unselectedItems = vm.resolvedItems.filter(function(el) {
                    return vm.selectedItems.indexOf(el) < 0;
                });
            }

            updateSelectionViews(true);
        };

        var addItem = function(item, selected) {
            vm.resolvedItems.push(item);
            if (selected) {
                updateViewValue([item].concat(vm.selectedItems));
            }
            updateSelectionLists();
        };

        var updateItems = function() {
            vm.resolvedItems = [];
            if (vm.items) {
                if (typeof vm.items === "function") {
                    vm.items().then(function(resolvedItems) {
                        vm.resolvedItems = resolvedItems;
                        updateSelectionLists();
                    });
                } else {
                    vm.resolvedItems = vm.items;
                    updateSelectionLists();
                }
            }
        };

        var updateViewValue = function(selectedItems) {
            var viewValue = undefined;
            if (vm.options.selectionLimit === 1) {
                if (vm.options.bindId) {
                    viewValue = vm.getId(selectedItems[0]);
                } else {
                    viewValue = selectedItems[0];
                }
            } else {
                if (vm.options.bindId) {
                    viewValue = selectedItems.map(function(el) {
                        return vm.getId(el);
                    });
                } else {
                    viewValue = angular.copy(selectedItems);
                }
            }
            vm.ngModel.$setViewValue(viewValue);
        };

        var onSelectedItemsChanged = function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                updateViewValue(newValue);
            }
        };

        var onItemsChanged = function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                updateItems();
            }
        };

        var getButtonText = function() {
            if (vm.selectedItems && vm.selectedItems.length === 1) {
                return vm.getDisplay(vm.selectedItems[0]);
            }
            if (vm.selectedItems && vm.selectedItems.length > 1) {
                var totalSelected;
                totalSelected = angular.isDefined(vm.selectedItems) ? vm.selectedItems.length : 0;
                if (totalSelected === 0) {
                    return vm.options.defaultText;
                } else {
                    return totalSelected + " " + "selected";
                }
            } else {
                return vm.options.defaultText;
            }
        };

        var update = function() {
            updateSelectionViews(true);
        };

        var selectAll = function() {
            vm.selectedItems = vm.resolvedItems.slice();
            vm.unselectedItems = [];

            updateSelectionViews(true);
        };

        var unselectAll = function() {
            vm.selectedItems = [];
            vm.unselectedItems = vm.resolvedItems.slice();

            updateSelectionViews(true);
        };

        var toggleItem = function(item) {
            var selectedIndex = vm.selectedItems.indexOf(item);
            var currentlySelected = (selectedIndex !== -1);
            if (currentlySelected && (vm.options.selectionLimit === 0 || vm.options.selectionLimit > 1)) {
                vm.unselectedItems.push(vm.selectedItems[selectedIndex]);
                vm.selectedItems.splice(selectedIndex, 1);
            } else if (!currentlySelected && (vm.options.selectionLimit === 0 || vm.selectedItems.length < vm.options.selectionLimit)) {
                var unselectedIndex = vm.unselectedItems.indexOf(item);
                vm.unselectedItems.splice(unselectedIndex, 1);
                vm.selectedItems.push(item);
            } else if (!currentlySelected && vm.options.selectionLimit === 1) {
                var unselectedIndex = vm.unselectedItems.indexOf(item);
                vm.unselectedItems.splice(unselectedIndex, 1);
                vm.selectedItems.splice(0, 1);
                vm.selectedItems.push(item);

                vm.toggleDropdown();
            }

            updateSelectionViews();
        };

        var getId = function(item) {
            if (angular.isObject(item)) {
                if (vm.options.idProp) {
                    return getRecursiveProperty(item, vm.options.idProp);
                } else {
                    $log.error("Multiselect: when using objects as model, a idProp value is mandatory.");
                    return "";
                }
            } else {
                return item;
            }
        };

        var getDisplay = function(item) {
            if (angular.isObject(item)) {
                if (vm.options.displayProp) {
                    return getRecursiveProperty(item, vm.options.displayProp);
                } else {
                    $log.error("Multiselect: when using objects as model, a displayProp value is mandatory.");
                    return "";
                }
            } else {
                return item;
            }
        };

        var unselectedPageUp = function(increment) {
            increment = increment || vm.options.unselectedDisplayLimit;
            var newStartIndex = vm.unselectedDisplayIndex - increment;
            newStartIndex = newStartIndex > 0 ? newStartIndex : 0;

            return vm.canUnselectedPageUp && unselectedScroll(newStartIndex);
        };

        var unselectedPageDown = function(increment) {
            increment = increment || vm.options.unselectedDisplayLimit;
            var limit = vm.unselectedItemsFiltered.length;
            var newStartIndex = vm.unselectedDisplayIndex + increment;
            newStartIndex = newStartIndex < limit ? newStartIndex : limit - vm.options.unselectedDisplayLimit - 1;

            return vm.canUnselectedPageDown && unselectedScroll(newStartIndex);
        };

        var unselectedScroll = function(newStartIndex) {
            if (vm.unselectedDisplayIndex !== newStartIndex) {
                vm.unselectedDisplayIndex = newStartIndex;
                updateSelectionViews();

                return true;
            }
            return false;
        };

        var selectedPageUp = function(increment) {
            increment = increment || vm.options.selectedDisplayLimit;
            var newStartIndex = vm.selectedDisplayIndex - increment;
            newStartIndex = newStartIndex > 0 ? newStartIndex : 0;

            return vm.canSelectedPageUp && selectedScroll(newStartIndex);
        };

        var selectedPageDown = function(increment) {
            increment = increment || vm.options.selectedDisplayLimit;
            var limit = vm.selectedItems.length;
            var newStartIndex = vm.selectedDisplayIndex + increment;
            newStartIndex = newStartIndex < limit ? newStartIndex : limit - vm.options.selectedDisplayLimit - 1;

            return vm.canSelectedPageDown && selectedScroll(newStartIndex);
        };

        var selectedScroll = function(newStartIndex) {
            if (vm.selectedDisplayIndex !== newStartIndex) {
                vm.selectedDisplayIndex = newStartIndex;
                updateSelectionViews();

                return true;
            }
            return false;
        };

        var getRecursiveProperty = function(object, path) {
            return path.split(".").reduce(function(object, x) {
                if (object) {
                    return object[x];
                } else {
                    return null;
                }
            }, object)
        };
    }

    /**
     * The item controller
     */

    uiItemController.$inject = [];

    function uiItemController() {
        var vm = this;

        vm.$onInit = function() {
            var options = vm.uiMultiselectController.options;
            var itemSelected = !!vm.itemSelected;

            if (vm.itemId && vm.itemDisplay &&
                options.idProp && options.displayProp) {
                var item = {};
                item[options.idProp] = vm.itemId;
                item[options.displayProp] = vm.itemDisplay;

                vm.uiMultiselectController.addItem(item, itemSelected);
            } else {
                if (vm.itemId) {
                    vm.uiMultiselectController.addItem(vm.itemId, itemSelected);
                } else if (vm.itemDisplay) {
                    vm.uiMultiselectController.addItem(vm.itemDisplay, itemSelected);
                }
            }
        };
    }
} ());

angular.module('ui.multiselect.templates', ['multiselect.html']);

angular.module("multiselect.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("multiselect.html",
    "<input id=\"{{vm.options.formElement}}\" name=\"{{vm.options.formElement}}\" hidden=\"hidden\" ng-model=\"vm.ngModel.$viewValue\" ng-if=\"vm.options.formElement\"/>\n" +
    "<div class=\"{{::vm.options.containerClass}}\">\n" +
    "    <button type=\"button\" class=\"{{::vm.options.toggleClass}}\" ng-click=\"vm.toggleDropdown()\" ng-disabled=\"vm.options.disabled\">\n" +
    "        {{vm.getButtonText()}}&nbsp;<span class=\"caret\"></span>\n" +
    "    </button>\n" +
    "    <ul class=\"{{::vm.options.dropdownClass}}\" ng-show=\"vm.open\" style=\"display:block\"\n" +
    "        ng-mouseenter=\"vm.isMouseOver = true\" ng-mouseleave=\"vm.isMouseOver = false\">\n" +
    "\n" +
    "        <li ng-show=\"vm.options.showSelectAll\">\n" +
    "            <a ng-click=\"vm.selectAll()\" href=\"\">\n" +
    "                <span class=\"glyphicon glyphicon-ok\"></span> Select All\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"vm.options.showUnselectAll\">\n" +
    "            <a ng-click=\"vm.unselectAll()\" href=\"\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\"></span> Unselect All\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"(vm.options.showSelectAll || vm.options.showUnselectAll)\" class=\"divider\">\n" +
    "        </li>\n" +
    "\n" +
    "        <li ng-if=\"vm.hasSelectedPageUp\" ng-class=\"{disabled: !vm.canSelectedPageUp}\">\n" +
    "            <a href=\"\" ng-click=\"vm.selectedPageUp(); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li role=\"presentation\" ng-repeat=\"item in vm.selectedItemsView\" class=\"active\">\n" +
    "            <a class=\"item-selected\" href=\"\" ng-click=\"vm.toggleItem(item); $event.stopPropagation()\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\" ng-if=\"vm.options.selectionLimit !== 1\"></span> {{vm.getDisplay(item)}}\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-if=\"vm.hasSelectedPageDown\" ng-class=\"{disabled: !vm.canSelectedPageDown}\">\n" +
    "            <a href=\"\" ng-click=\"vm.selectedPageDown(); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"vm.selectedItems.length > 0\" class=\"divider\"></li>\n" +
    "\n" +
    "        <li ng-show=\"vm.options.showSearch && vm.unselectedItems.length > 0\">\n" +
    "            <div class=\"dropdown-header\">\n" +
    "                <input type=\"text\" class=\"{{::vm.options.searchClass}}\" ng-model=\"vm.searchFilter\" placeholder=\"Search...\" ng-change=\"vm.update()\" />\n" +
    "            </div>\n" +
    "        </li>\n" +
    "        <li ng-show=\"vm.options.showSearch && vm.unselectedItems.length > 0\" class=\"divider\"></li>\n" +
    "        \n" +
    "        <li ng-if=\"vm.hasUnselectedPageUp\" ng-class=\"{disabled: !vm.canUnselectedPageUp}\">\n" +
    "            <a href=\"\" ng-click=\"vm.unselectedPageUp(); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li role=\"presentation\" ng-repeat=\"item in vm.unselectedItemsView\" ng-class=\"{disabled : !vm.canSelectItem}\">\n" +
    "            <a class=\"item-unselected\" href=\"\" ng-click=\"vm.toggleItem(item); $event.stopPropagation()\">\n" +
    "                {{vm.getDisplay(item)}}\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-if=\"vm.hasUnselectedPageDown\" ng-class=\"{disabled: !vm.canUnselectedPageDown}\">\n" +
    "            <a href=\"\" ng-click=\"vm.unselectedPageDown(); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "\n" +
    "        <li class=\"divider\" ng-show=\"vm.options.selectionLimit > 1\"></li>\n" +
    "        <li role=\"presentation\" ng-show=\"vm.options.selectionLimit > 1\">\n" +
    "            <a>{{vm.selectedItems.length || 0}} / {{vm.options.selectionLimit}} selected</a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "<div ng-show=\"false\" ng-transclude></div>");
}]);
