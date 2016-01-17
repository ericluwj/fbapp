"use strict";function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}angular.module("fbappApp",["fbappApp.constants","ngCookies","ngResource","ngSanitize","ui.router","ui.bootstrap","ezfb"]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$provide","ezfbProvider",function(a,b,c,d,e){a.state("app",{"abstract":!0,url:"",template:"<ui-view/>",resolve:{Facebook:"Facebook",user:["Facebook",function(a){return a.currentUser||a.getUser()}]}}),b.otherwise("/"),c.html5Mode(!0),d.decorator("$state",["$delegate","$stateParams",function(a,b){return a.forceReload=function(){return a.go(a.current,b,{reload:!0,inherit:!1,notify:!0})},a}]),e.setInitParams({appId:"1015509125154471",version:"v2.5"})}]).run(["$rootScope","$state",function(a,b){a.$on("$stateChangeError",function(a){b.go("main")})}]),angular.module("fbappApp.util",[]),angular.module("fbappApp").factory("Facebook",["$rootScope","$q","$state","$location","ezfb","Modal",function(a,b,c,d,e,f){var g={};g.currentUser=null,g.connect=function(){var a=b.defer();return e.login(function(b){"connected"===b.status?a.resolve(b):"not_authorized"===b.status?a.reject("You may have not authorized our app in Facebook or accidentally revoke the authorization of our app. Please ensure that our app is being authorized for your Facebook account."):a.reject("This feature requires you to be logged into Facebook first.")},{scope:"email,public_profile,manage_pages,publish_pages,read_insights"}),a.promise},g.profile=function(){var a=b.defer();return e.api("/me").then(function(b){a.resolve(b)},function(){a.reject("You may have not authorized our app in Facebook to get your profile details. Please ensure that our app is being authorized for your Facebook account.")}),a.promise},g.login=function(){var a;return g.connect().then(function(b){return a=b,g.profile()}).then(function(b){return g.currentUser=b,a},function(a){f.alert()(a)})},g.logout=function(){return console.log("logout"),e.logout(function(a){console.log(a)}).then(function(a){return a})},g.getUser=function(){return g.connect().then(function(a){return g.profile()}).then(function(a){return g.currentUser=a,a})},g.getPages=function(a){return a?e.api(a):e.api("/"+g.currentUser.id+"/accounts")},g.getPage=function(a){return e.api("/"+a+"?fields=access_token,name")},g.getPosts=function(a,b,c,d){return void 0===c&&(c="true"),d?e.api(d):"true"===c?e.api("/"+a+"/feed?fields=id,name,message,story,created_time,type,is_published&is_published=true&include_hidden=true",{access_token:b}):"true"!==c?e.api("/"+a+"/promotable_posts?fields=id,name,message,story,created_time,type,is_published&is_published=false",{access_token:b}):void 0},g.getPost=function(a,c){return b.all([e.api("/"+a+"?fields=name,message,story,picture,created_time,type,is_published",{access_token:c}),e.api("/"+a+"/insights/post_impressions_unique",{access_token:c})]).then(function(a){var b=a[0],c=a[1];return console.log(b),c.data.length&&(b.views=c.data[0].values[0].value),b})},g.createPost=function(a,b,c){return console.log(b),b.access_token=c,e.api("/"+a+"/feed","POST",b)};var h;return e.Event.subscribe("auth.statusChange",function(a){"connected"===h&&"connected"!==a.status?(g.currentUser=null,d.path("/")):"connected"!==h&&"connected"===a.status&&d.path("/pages/list"),h=a.status}),g}]),angular.module("fbappApp").filter("truncate",function(){return function(a){return a.length>100?a.slice(0,100)+"...":a}}),angular.module("fbappApp").controller("MainController",["$scope","$http","$timeout","$location","Facebook",function(a,b,c,d,e){a.loginFacebook=function(){return a.isLoginFacebook?void 0:(a.isLoginFacebook=!0,c(function(){a.isLoginFacebook=!1},500,!1),e.login().then(function(a){console.log(a),d.path("/pages/list")}))}}]),angular.module("fbappApp").config(["$stateProvider",function(a){a.state("main",{url:"/",templateUrl:"app/main/main.html",controller:"MainController"})}]),angular.module("fbappApp").controller("PagesCtrl",["$scope",function(a){}]).controller("PagesListCtrl",["$scope","pages","paging",function(a,b,c){a.pages=b,a.paging=c}]).controller("PageCtrl",["$scope","page",function(a,b){a.page=b}]).controller("PostsCtrl",["$scope",function(a){}]).controller("PostsCreateCtrl",["$scope","$location","Facebook","page",function(a,b,c,d){a.page=d,a.post={},a.post.published=!1,a.submit=function(e){return e.$valid?c.createPost(d.id,a.post,d.access_token).then(function(a){b.path("/pages/"+d.id+"/posts/list")}):void 0}}]).controller("PostsListCtrl",["$scope","$stateParams","Facebook","page","posts","paging",function(a,b,c,d,e,f){a.$stateParams=b,a.posts=e,a.paging=f;b.published||!0;a.loadMore=function(){c.getPosts(d.id,d.access_token,b.published,a.paging.next).then(function(b){a.posts=a.posts.concat(b.data),a.paging=b.paging})}}]).controller("PostCtrl",["$scope","post",function(a,b){}]).controller("PostViewCtrl",["$scope","post",function(a,b){a.post=b}]),angular.module("fbappApp").config(["$stateProvider",function(a){a.state("app.pages",{"abstract":!0,url:"/pages",templateUrl:"app/pages/pages.html",controller:"PagesCtrl"}).state("app.pages.list",{url:"/list?url",templateUrl:"app/pages/pages.list.html",controller:"PagesListCtrl",resolve:{pagesObj:["user","Facebook","$stateParams",function(a,b,c){return b.getPages(c.url)}],pages:["pagesObj",function(a){return a.data}],paging:["pagesObj",function(a){return a.paging}]}}).state("app.pages.page",{"abstract":!0,url:"/:pageId",templateUrl:"app/pages/page.html",controller:"PageCtrl",resolve:{page:["user","Facebook","$stateParams",function(a,b,c){return b.getPage(c.pageId)}]}}).state("app.pages.page.posts",{"abstract":!0,url:"/posts",templateUrl:"app/pages/posts.html",controller:"PostsCtrl"}).state("app.pages.page.posts.create",{url:"/create",templateUrl:"app/pages/posts.save.html",controller:"PostsCreateCtrl"}).state("app.pages.page.posts.list",{url:"/list?published&url",templateUrl:"app/pages/posts.list.html",controller:"PostsListCtrl",resolve:{postsObj:["user","Facebook","page","$stateParams",function(a,b,c,d){return b.getPosts(c.id,c.access_token,d.published,d.url)}],posts:["postsObj",function(a){return a.data}],paging:["postsObj",function(a){return a.paging}]}}).state("app.pages.page.posts.post",{"abstract":!0,url:"/:postId",templateUrl:"app/pages/post.html",controller:"PostCtrl",resolve:{post:["user","Facebook","$stateParams","page",function(a,b,c,d){return b.getPost(c.postId,d.access_token)}]}}).state("app.pages.page.posts.post.view",{url:"/view",templateUrl:"app/pages/post.view.html",controller:"PostViewCtrl"})}]),angular.module("fbappApp").filter("escape",function(){return window.encodeURIComponent}),angular.module("fbappApp").directive("footer",function(){return{templateUrl:"components/footer/footer.html",restrict:"E",link:function(a,b){b.addClass("footer")}}}),angular.module("fbappApp").factory("Modal",["$rootScope","$modal",function(a,b){function c(){var c=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],d=arguments.length<=1||void 0===arguments[1]?"modal-default":arguments[1],e=a.$new();return angular.extend(e,c),b.open({templateUrl:"components/modal/modal.html",windowClass:d,scope:e})}return{confirm:{"delete":function(){var a=arguments.length<=0||void 0===arguments[0]?angular.noop:arguments[0];return function(){var b,d=Array.prototype.slice.call(arguments),e=d.shift();b=c({modal:{dismissable:!0,title:"Confirm Delete",html:"<p>Are you sure you want to delete <strong>"+e+"</strong> ?</p>",buttons:[{classes:"btn-danger",text:"Delete",click:function(a){b.close(a)}},{classes:"btn-default",text:"Cancel",click:function(a){b.dismiss(a)}}]}},"modal-danger"),b.result.then(function(b){a.apply(b,d)})}}},alert:function(a){return a=a||angular.noop,function(){var b,d=Array.prototype.slice.call(arguments),e=d.shift();b=c({modal:{dismissable:!0,title:"Alert",html:"<p>"+e+"</p>",buttons:[{classes:"btn-default",text:"Ok",click:function(a){b.dismiss(a)}}]}},"modal-warning"),b.result.then(function(b){a.apply(b,d)})}}}}]);var NavbarController=function a(b){_classCallCheck(this,a),this.menu=[],this.isCollapsed=!0,this.Facebook=b};NavbarController.$inject=["Facebook"],angular.module("fbappApp").controller("NavbarController",NavbarController),angular.module("fbappApp").directive("navbar",function(){return{templateUrl:"components/navbar/navbar.html",restrict:"E",controller:"NavbarController",controllerAs:"nav"}}),function(a,b){a.module("fbappApp.constants",[]).constant("appConfig",{userRoles:["guest","user","admin"]})}(angular),function(){function a(a){var b={safeCb:function(a){return angular.isFunction(a)?a:angular.noop},urlParse:function(a){var b=document.createElement("a");return b.href=a,b},isSameOrigin:function(c,d){return c=b.urlParse(c),d=d&&[].concat(d)||[],d=d.map(b.urlParse),d.push(a.location),d=d.filter(function(a){return c.hostname===a.hostname&&c.port===a.port&&c.protocol===a.protocol}),d.length>=1}};return b}a.$inject=["$window"],angular.module("fbappApp.util").factory("Util",a)}(),angular.module("fbappApp").run(["$templateCache",function(a){a.put("app/main/main.html",'<navbar></navbar><header class=hero-unit id=banner><div class=container><div class=row><div class="col-lg-6 col-lg-offset-3 text-center"><h1>Eric\'s Facebook Page Management App!</h1><br><br><br><p class=lead>Start by logging into your Facebook account.</p><br><br></div></div><div class=row><div class="col-lg-12 text-center"><a class="btn btn-facebook btn-lg" href="" ng-click=loginFacebook() ng-disabled=isLoginFacebook><i class="fa fa-facebook"></i> Facebook Login</a><br><br><br><!-- <a href="" ng-click="" class="btn btn-primary btn-lg">Facebook Login</a> --><!-- <h1 class="page-header">Features:</h1>\n        <ul class="nav nav-tabs nav-stacked col-md-4 col-lg-4 col-sm-6" ng-repeat="thing in main.awesomeThings">\n          <li><a href="#" tooltip="{{thing.info}}">{{thing.name}}</a></li>\n        </ul> --></div></div></div></header><footer></footer>'),a.put("app/pages/page.html","<div class=row><div class=col-xs-12><h4>Page: {{page.name}}</h4></div></div><div ui-view></div>"),a.put("app/pages/pages.html","<navbar></navbar><div class=container><div ui-view></div></div><footer></footer>"),a.put("app/pages/pages.list.html",'<div class=row><div class=col-xs-12><h3>Select the page you want to manage:</h3><div class=list-group><a href="" ng-href=/pages/{{page.id}}/posts/list class=list-group-item ng-repeat="page in pages"><h4 class=list-group-item-heading>{{page.name}}</h4></a></div><div class=pull-left><span><a ng-href="/pages/list?url={{paging.previous | escape}}" ng-show=paging.previous><i class="glyphicon glyphicon-chevron-left"></i> Newer</a><span></span></span></div><div class=pull-right><span><a ng-href="/pages/list?url={{paging.next | escape}}" ng-show=paging.next>Older <i class="glyphicon glyphicon-chevron-right"></i></a><span></span></span></div></div></div>'),a.put("app/pages/post.html","<div ui-view></div>"),a.put("app/pages/post.view.html",'<div class=row><div class=col-xs-12><h5><a ng-href=/pages/{{page.id}}/posts/list><i class="glyphicon glyphicon-chevron-left"></i> Back to Posts</a></h5><div class="panel panel-default"><div class=panel-heading><h3 class=panel-title>{{(post.message || post.story || post.name) | truncate}}</h3></div><div class=panel-body><pre>{{post.message || post.story || post.name}}</pre><div ng-show=post.picture><img ng-src={{post.picture}}></div><div>Published: {{post.is_published}}</div><div>Views: {{post.views}}</div></div></div></div></div>'),a.put("app/pages/posts.html","<div ui-view></div>"),a.put("app/pages/posts.list.html",'<div class=row><div class=col-xs-12><h5><a ng-href=/pages/list><i class="glyphicon glyphicon-chevron-left"></i> Back to Pages</a></h5><a ng-href=/pages/{{page.id}}/posts/create class="btn btn-primary btn-md">Create Post</a><h3>Select a post to view or edit:</h3><ul class="nav nav-tabs"><li role=presentation ng-class="{\'active\': ($stateParams.published||\'true\')===\'true\'}"><a ng-href="/pages/{{page.id}}/posts/list?published=true"><h5>Published</h5></a></li><li role=presentation ng-class="{\'active\': ($stateParams.published||\'true\')===\'false\'}"><a ng-href="/pages/{{page.id}}/posts/list?published=false"><h5>Unpublished</h5></a></li></ul><div class="panel panel-default"><div class=panel-body><div class=list-group><a href="" ng-href=/pages/{{page.id}}/posts/{{post.id}}/view class=list-group-item ng-repeat="post in posts"><h4 class=list-group-item-heading>{{(post.message || post.story || post.name) | truncate}}</h4></a></div><div class=text-center><a href="" ng-click=loadMore() ng-show=paging.next>Load More</a></div></div></div></div></div>'),a.put("app/pages/posts.save.html",'<div class=row><div class=col-xs-12><h5><a ng-href=/pages/{{page.id}}/posts/list><i class="glyphicon glyphicon-chevron-left"></i> Back to Posts</a></h5><h3>Create Post</h3><form name=form ng-submit=submit(form)><div class=form-group><label for=message>Message</label><textarea class=form-control rows=3 id=message name=message ng-model=post.message placeholder="" required></textarea></div><div class=checkbox><label><input type=checkbox ng-model=post.published> Published</label></div><button type=submit class="btn btn-primary">Submit</button></form></div></div>'),a.put("components/footer/footer.html",'<div class=container><p>Eric Lu | <a href="https://www.ericluwj.com/">@ericluwj</a> | <a href=https://github.com/ericluwj>Git</a></p></div>'),a.put("components/modal/modal.html",'<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'),a.put("components/navbar/navbar.html",'<div class="navbar navbar-default navbar-static-top" ng-controller=NavbarController><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click="nav.isCollapsed = !nav.isCollapsed"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href="/" class=navbar-brand>Facebook App</a></div><div collapse=nav.isCollapsed class="navbar-collapse collapse" id=navbar-main><ul class="nav navbar-nav"><li ng-repeat="item in nav.menu" ui-sref-active=active><a ui-sref={{item.state}}>{{item.title}}</a></li></ul><ul class="nav navbar-nav navbar-right" ng-if=nav.Facebook.currentUser><li class=dropdown dropdown><a href=# class=dropdown-toggle dropdown-toggle role=button aria-haspopup=true aria-expanded=false><img ng-src="https://graph.facebook.com/{{nav.Facebook.currentUser.id}}/picture?width=19&height=19"> {{nav.Facebook.currentUser.name}} <span class=caret></span></a><ul class=dropdown-menu><!-- <li><a href="#">Action</a></li>\n            <li><a href="#">Another action</a></li>\n            <li><a href="#">Something else here</a></li>\n            <li role="separator" class="divider"></li> --><li><a href="" ng-click=nav.Facebook.logout()>Logout</a></li></ul></li></ul></div></div></div>')}]);