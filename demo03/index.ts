class Site {
    d = 13
    static a = 10
    name():number {
        console.log('测试')
        let arr: Array<number> = [1,2]
        let b: [number, string]
        b = [1,'2']
        enum Color { blue, green, white}
        let c: Color = Color.blue
        return 1
    }
}
let val:boolean|number|string
val = ''
val = 2
val = true
const obj = new Site()
obj.name()
console.log(Site.a,obj.d, obj instanceof Site)