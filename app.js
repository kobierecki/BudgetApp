// DATA CONTROLLER

var budgetController = (function(){

   var Expense = function(id, description, value){
       this.id = id;
       this.description = description;
       this.value = value;
   };

   var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
   };

   var data = {
    allItems: {
        exp: [],
        inc: []
    },
    totals: {
        exp: 0,
        inc: 0
    }
   };
   return {
       addItem: function(type, des, val){
            var newItem;
            var ID;
            //CREATE NEW ID
           if (data.allItems[type].length > 0){
               ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
           } else {
               ID = 0;
           }

            //CREATE NEW ITEM
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //PUSH TO DATA STRUCTURE
            data.allItems[type].push(newItem);

            //RETURN DATA
            return newItem;
       },
       testing: function() {
           console.log(data);
       }
   }
 })();

 // UI CONTROLLER 

 var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    };

    return {

        getInput: function(){

            return {
                 type: document.querySelector(DOMstrings.inputType).value,
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: document.querySelector(DOMstrings.inputValue).value
            };

        },

        addListItem: function(obj, type){

            // CREATE HTML WITH PLACEHOLDER
            var html;
            var newHTML;
            var element;

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // REPLACE PLACEHOLDER WITH DATA
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            // INSERT HTML INTO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        clearFields: function(){
            var fields;
            var fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

 })();

 // APP CONTROLLER

 var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e){
            if (e.key === "Enter"){
                console.log("clicked");
                ctrlAddItem();
            }
        });
    };

    var ctrlAddItem = function(){
        var input;
        var newItem;
        // GET DATA
        input = UICtrl.getInput();
        // ADD ITEM TO BUDGET CONTROLLER
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // ADD ITEM TO UI
        UICtrl.addListItem(newItem, input.type);
        // CLEAR THE FIELDS
        UICtrl.clearFields();
        // CALCULATE BUDGET
        // DISPLAY BUDGET
    };

    return {
        init: function(){
            console.log('App has started');
            setupEventListeners();
        }
    }

 })(budgetController, UIController);

 controller.init();