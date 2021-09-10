//import {plus,minus} from "./dummy.js"

describe("Plus Functionality",() => {
    it("adds two numbers",() => {
        let result = plus(1,2);
        expect(result).toEqual(3);
    })

    it("fails to multily two numbers",() => {
        let result = plus(1,2);
        expect(result).not.toEqual(2);
    })
})