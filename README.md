# bebop.ed

## bebop?

[bebop][1] is a small framework for DOM-Manipulation and AJAX.  
It also has support for Promises.

## About

`bebop.ed` allows it to automagically bootstrap your Backbone.Views

it uses `bebop` for dom-selection, but is basically library agnostic

## example

HTML

	<div id="foo" data-bs-view="myView">
	
Script

	# write your backbone views just as usual
	class myCustomView extends bebop.spike
		# view definitions
		
	# register your view under the name "myView"
	bebop.ed.registerView 'myView', myCustom
[bebop.spike][2]

this completely eliminates the requirement for that one view/script which is only required to init all other views

## model
every view is getting initialized with a model
so to set a specific model you can define one, and mark it as a dependency
		
	class myCustomModel extends Backbone.Model
		# definitons
		
	bebop.ed.registerModel 'superModel', myCustomModel
	
	
	class myCustomView extends bebop.spike
		# definitions 
		
	bebop.ed.registerView 'myView', 'superModel', myCustomView

### prefilled
in some (if not in most) cases your model has data prefilled, that may not be defaults.  
so in that case you can define it on the html element

	<div id="foo" data-bebop-view="myView" data-bebop-model="name:value;name2:value2">

which initiates the (custom) model with the 2 properties `name` and `name2` with their values `value` and `value2` respectively


## data binding
ed is prepared to be seamlessly used in combination with [bebop.ein][3]

if you use [bebop.ein][3] for data-binding `bebop.ed` is ready for that so it automagically binds all `data-bebop-targets` to model properties

[1]: http://www.github.com/bobbor/bebop
[2]: http://www.github.com/bobbor/bebop.spike
[3]: http://www.github.com/bobbor/bebop.ein