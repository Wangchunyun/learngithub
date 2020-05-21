var Site = /** @class */ (function () {
    function Site() {
        this.d = 13;
    }
    Site.prototype.name = function () {
        console.log('测试');
        var arr = [1, 2];
        var b;
        b = [1, '2'];
        var Color;
        (function (Color) {
            Color[Color["blue"] = 0] = "blue";
            Color[Color["green"] = 1] = "green";
            Color[Color["white"] = 2] = "white";
        })(Color || (Color = {}));
        var c = Color.blue;
        return 1;
    };
    Site.a = 10;
    return Site;
}());
var val;
val = '';
val = 2;
val = true;
var obj = new Site();
obj.name();
console.log(Site.a, obj.d, obj instanceof Site);
