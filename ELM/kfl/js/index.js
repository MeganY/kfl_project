/**
 * Created by Administrator on 2017/4/6.
 */
angular.module("myApp",["ng","ngRoute","ngAnimate"])
    .controller("registerCtrl",["$scope","$location","$http","$timeout",function($scope,$location,$http,$timeout){
        console.log("注册");
        $scope.msg = "";
        $scope.userProfile = {
            username:"",
            password:"",
            password2:""
        };
        $scope.register = function(){
            console.log("提交注册信息");
            function hint(msg){
                $scope.msg = msg;
                $timeout(function(){
                    $scope.msg = "";
                },3000)
            }
            if($scope.userProfile.username.length !=0){
                if($scope.userProfile.password.length !=0 && $scope.userProfile.password === $scope.userProfile.password2){
                    $http({
                        url:"register",
                        method:"post",
                        params:{
                            username:$scope.userProfile.username,
                            password:$scope.userProfile.password
                        }
                    }).success(function(data){
                        $scope.msg = data;
                        if(data === "注册成功") $location.path("/login");
                    });
                }else{
                    $scope.msg ="密码不能为空或两次密码不一致 "
                }
            }else{
                $scope.msg = "用户名不能为空 "
            }
            hint($scope.msg);

        }
    }])
    .controller("loginCtrl",["$scope","$http","$location", '$rootScope',"$timeout",
        function($scope,$http,$location, $rootScope,$timeout){
            $scope.userProfile = {
                username:"",
                password:""
            };
            $scope.msg = "";
            function hint(msg){
                $scope.msg = msg;
                $timeout(function(){
                    $scope.msg = "";
                },3000)
            }
            $scope.login = function(){
                if($scope.userProfile.username.length != 0){
                    if($scope.userProfile.password.length != 0){
                        $http({
                            url:"login",
                            method:"post",
                            params:{
                                username:$scope.userProfile.username,
                                password:$scope.userProfile.password
                            }
                        }).success(function(data){
                            if(data != "登录失败") $location.path("/userDetail");
                        })
                    }else{
                        hint("密码不能为空");
                    }
                }else{
                    hint("用户名不能为空");
                }
            }
        }]
    )
    .controller("userDetailCtrl",["$scope","$http","$routeParams", "$location",function($scope,$http,$routeParams, $location){
        var id = $routeParams.id;
        $scope.user = "";
        $scope.logout = function () {
            $http({
                url:"logout",
                method:"get"
                // params:{
                //     id:id
                // }
            }).success(function(data){
                // console.log(data);
                $location.path("/main")
            })
        };

        $http({
            url:"userDetail",
            method:"get"
            // params:{
            //     id:id
            // }
        }).success(function(data){
            if(data.length != 0) {
                if (data != 'err') {
                    $scope.user = data[0];
                }else {
                    $location.path('/login').replace();
                }
            }
            // console.log($scope.user);
        })
    }])
    .controller("startCtrl",function($timeout,$location){
        $timeout(function(){
            $location.path("/main");
        },2000)
    })
    .controller("mainCtrl",function($scope,$http,$rootScope){
        var num = 4;
        var index = 1;
        $scope.dishes = [];
        $scope.loadStatus = 1; //1：代表未加载，2：加载中，3：没有更多
        $scope.searchText = "";
        // $rootScope.id = 0;
        function getDishes(){
            $scope.loadStatus = 2;
            $http({
                url:"getDishes",    //路由
                method:"get",  //请求方式
                params:{    //传递参数
                    num:num,
                    index:index,
                    searchText:$scope.searchText
                }   //data:{}第二种传参方式
            }).success(function(data){
                // console.log(data);
                $scope.dishes = $scope.dishes.concat(data.dishes);
                index++;
                data.dishes.length == 0 ? $scope.loadStatus = 3:$scope.loadStatus = 1;
                // console.log($scope.loadStatus);
                // if (data.loginStatus.length > 0) {
                //     $rootScope.id = data.loginStatus[0].id;
                // }
                // console.log($scope.id);
            });
        };
        getDishes();
        $scope.getMoreDishes = function(){
            getDishes();
        };
        $scope.searchDishes = function(e){
            if(e.keyCode == 13){
                if($scope.searchText == ""){
                    $scope.dishes = [];
                    getDishes();
                }else{
                    $http({
                        url:"getDishes",    //路由
                        method:"get",  //请求方式
                        params:{    //传递参数
                            num:num,
                            index:index,
                            searchText:$scope.searchText
                        }   //data:{}第二种传参方式
                    }).success(function(data){
                        console.log(data);
                        $scope.dishes = data.dishes;
                        index = 1;
                        $scope.loadStatus = 3;
                    });
                }
            }
        };

    })
    .controller("detailCtrl",function($scope,$routeParams,$http,$location){

        $http({
            url:"getDetail",
            method:"get",
            params:{
                id:$routeParams.did
            }
        }).success(function(data){
            console.log(data[0]);
            $scope.dish = data[0];
        });
    })
    .controller("orderCtrl",function($scope,$location,$routeParams,$timeout,$http,$rootScope){
        function getLocalStorage(key){
            return localStorage.getItem("kfl_"+key);
        };
        function setLocalStorage(key,value){
            return localStorage.setItem("kfl_"+key,value);
        };
        $scope.myOrders = [];
        $scope.msg = "";
        $scope.username = getLocalStorage("username");
        $scope.sex = getLocalStorage("sex");
        $scope.phone = getLocalStorage("phone");
        $scope.addr = getLocalStorage("addr");
        console.log($scope.username,$scope.sex);
        $scope.orderDish = function(){
            var username = $scope.username;
            var sex = $scope.sex;
            var phone = $scope.phone;
            var addr = $scope.addr;
            var str = "";
            if(username == ""){
                str += "联系人、"
            };
            if(sex == "") str += "性别、";
            if(phone == "") str += "电话、";
            if(addr == "") str += "地址";
            showMsg(str+"不能为空");

            function showMsg(msg){
                $scope.msg = msg;
                $timeout(function(){
                    $scope.msg = "";
                },3000);
                if(username!=""&&sex!=""&&phone!=""&&addr!=""){

                    $http({
                        url:"getOrder",
                        method:"get",
                        params:{
                            id:$routeParams.did,
                            username:$scope.username,
                            sex:$scope.sex,
                            phone:$scope.phone,
                            addr:$scope.addr
                        }
                    }).success(function(data){
                        console.log(data);
                        console.log("数据插入成功！");
                        if (data != 'err') {
                            console.log(data);
                            setLocalStorage("username",username);
                            setLocalStorage("sex",sex);
                            setLocalStorage("phone",phone);
                            setLocalStorage("addr",addr);
                            $scope.msg = "下订订单成功！";
                            // $rootScope.user_name = data.user.user_name;
                            // $rootScope._id = data.user.oid;
                            $timeout(function(){
                                $location.path("/myOrder");
                                $scope.msg = "";
                            },2000);
                        }else {
                            $scope.msg = '正在跳转到登陆界面';
                            $timeout(function(){
                                $location.path("/login");
                                $scope.msg = "";
                            },2000);
                        }
                    });
                }
            }
        };
    })
    .controller("myOrderCtrl",function($routeParams,$http,$scope,$rootScope,$location, $timeout){
        function getLocalStorage(key){
            return localStorage.getItem("kfl_"+key);
        };
        // var id = $routeParams.id;
        // console.log($rootScope.id);
        $scope.myOrders = "";
        $scope.hasOrder = false;
        $scope.order = function () {
            $location.path('/main').replace();
        }
        var phone = getLocalStorage("phone");
        if(phone != null){
            $http({
                url:"getMyOrder",
                method:"get"
                // params:{
                //     username:$rootScope.user_name
                // }
            }).success(function(data){
                if(data.length != 0 ){
                    if (data != 'err') {
                        $scope.hasOrder = true;
                        $scope.myOrders = data;
                    }else {
                        $scope.msg = '未登录';
                        $timeout(function(){
                            $location.path("/login");
                            $scope.msg = "";
                        },2000);
                    }

                }
            });
        }else{
            $scope.hasOrder = false;
        }
    })
    .config(function($routeProvider){   //配置路由
        $routeProvider
            .when("/start",{
                templateUrl:"include/start.html",
                controller:"startCtrl"
            })
            .when("/main",{
                templateUrl:"include/main.html",
                controller:"mainCtrl"
            })
            .when("/detail/:did",{
                templateUrl:"include/detail.html",
                controller:"detailCtrl"
            })
            .when("/order/:did",{
                templateUrl:"include/order.html",
                controller:"orderCtrl"
            })
            .when("/myOrder",{
                templateUrl:"include/myOrder.html",
                controller:"myOrderCtrl"
            })
            .when("/",{
                redirectTo:"/start"
            })
            .when("/reg",{
                templateUrl:"user/register.html",
                controller:"registerCtrl"
            })
            .when("/login",{
                templateUrl:"user/login.html",
                controller:"loginCtrl"
            })
            .when("/userDetail",{
                templateUrl:"user/user_detail.html",
                controller:"userDetailCtrl"
            })
    });