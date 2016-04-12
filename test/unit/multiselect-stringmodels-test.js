"use strict";

describe("The multiselect directive, when using string models,", function() {

    var $scope;
    var $rootScope;
    var $compile;

    beforeEach(angular.mock.module("ui.multiselect"));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $scope = _$rootScope_.$new();
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it("initializes the list lazily, when the first item is chosen", function() {
        $scope.items = ["el1", "el2", "el3"];
        $scope.options = {
            bindId: false,
            selectionLimit: 0
        };
        var element = $compile("<ui-multiselect ng-model='selection' items='items' options='options'></ui-multiselect>")($scope);
        $scope.$digest();
        var controller = element.controller("uiMultiselect");

        expect(controller.selectedItems).toBeDefined();
        expect(controller.selectedItems.length).toBe(0);

        controller.toggleItem($scope.items[0]);

        expect(controller.selectedItems).toBeDefined();
        expect(controller.selectedItems.length).toBe(1);
    });

    it("can toggle items in the selection", function() {
        $scope.items = ["el1", "el2", "el3"];
        $scope.options = {
            bindId: false,
            selectionLimit: 0
        };

        var element = $compile("<ui-multiselect ng-model='selection' items='items' options='options'></ui-multiselect>")($scope);
        $scope.$digest();
        var controller = element.controller("uiMultiselect");

        expect(controller.unselectedItems.length).toBe(3);

        controller.toggleItem(controller.unselectedItems[0]);

        expect(controller.selectedItems).toBeDefined();
        expect(controller.selectedItems.length).toBe(1);
        expect(controller.unselectedItems.length).toBe(2);

        controller.toggleItem(controller.selectedItems[0]);

        expect(controller.selectedItems.length).toBe(0);
        expect(controller.unselectedItems.length).toBe(3);
    });

    it("shows a default label on the button when no items have been chosen", function() {
        $scope.items = ["el1", "el2", "el3"];
        $scope.options = {
            bindId: false,
            selectionLimit: 0
        };

        var element = $compile("<ui-multiselect ng-model='selection' items='items' options='options'></ui-multiselect>")($scope);
        $scope.$digest();
        var controller = element.controller("uiMultiselect");

        expect(controller.getButtonText()).toBe("Select");
    });

    it("shows a custom label on the button when no items have been chosen", function() {
        $scope.items = ["el1", "el2", "el3"];
        $scope.options = {
            bindId: false,
            selectionLimit: 0,
            defaultText: "dummy"
        };

        var element = $compile("<ui-multiselect ng-model='selection' items='items' options='options'></ui-multiselect>")($scope);
        $scope.$digest();
        var controller = element.controller("uiMultiselect");

        expect(controller.getButtonText()).toBe("dummy");
    });

    it("shows the name of the element when one item is chosen", function() {
        $scope.items = ["el1", "el2", "el3"];
        $scope.options = {
            bindId: false,
            selectionLimit: 0
        };
        $scope.selection = ["el1"];

        var element = $compile("<ui-multiselect ng-model='selection' items='items' options='options'></ui-multiselect>")($scope);
        $scope.$digest();
        var controller = element.controller("uiMultiselect");

        expect(controller.getButtonText()).toBe("el1");
    });

    it("shows the number of elements when multiple items are chosen", function() {
        $scope.items = ["el1", "el2", "el3"];
        $scope.options = {
            bindId: false,
            selectionLimit: 0
        };
        $scope.selection = ["el1", "el2"];

        var element = $compile("<ui-multiselect ng-model='selection' items='items' options='options'></ui-multiselect>")($scope);
        $scope.$digest();
        var controller = element.controller("uiMultiselect");

        expect(controller.getButtonText()).toBe("2 selected");
    });

    it("can select and unselect all at once", function() {
        $scope.items = ["el1", "el2", "el3"];
        $scope.options = {
            bindId: false,
            selectionLimit: 0
        };
        $scope.selection = [];

        var element = $compile("<ui-multiselect ng-model='selection' items='items' options='options'></ui-multiselect>")($scope);
        $scope.$digest();
        var controller = element.controller("uiMultiselect");

        controller.selectAll();
        $scope.$digest();

        expect($scope.selection.length).toBe(3);
        expect(controller.selectedItems.length).toBe(3);
        expect(controller.unselectedItems.length).toBe(0);

        controller.unselectAll();
        $scope.$digest();

        expect($scope.selection.length).toBe(0);
        expect(controller.selectedItems.length).toBe(0);
        expect(controller.unselectedItems.length).toBe(3);
    });

    it("can search inside the options", function() {
        $scope.items = ["el1", "el2", "el3"];
        $scope.options = {
            bindId: false,
            selectionLimit: 0
        };

        var element = $compile("<ui-multiselect ng-model='selection' items='items' options='options'></ui-multiselect>")($scope);
        $scope.$digest();
        var controller = element.controller("uiMultiselect");

        controller.searchFilter = "2";
        controller.update();

        expect(controller.unselectedItemsFiltered.length).toBe(1);
        expect(controller.unselectedItemsFiltered[0]).toEqual($scope.items[1]);

        controller.searchFilter = "5";
        controller.update();

        expect(controller.unselectedItemsFiltered.length).toBe(0);
    });
});
