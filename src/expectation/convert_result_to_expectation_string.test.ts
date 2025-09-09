// import { expect } from "chai"

// import { convert_result_to_expectation_string } from "./convert_result_to_expectation_string"


// describe("convert_result_to_expectation_string", () =>
// {
//     it("handles empty results array", () =>
//     {
//         expect(convert_result_to_expectation_string([])).equals("[]")
//     })

//     it("returns string for single number", () =>
//     {
//         expect(convert_result_to_expectation_string(42)).equals("42")
//         expect(convert_result_to_expectation_string(3.14159)).equals("3.1")
//         expect(convert_result_to_expectation_string(999.0001)).equals("1000")
//         expect(convert_result_to_expectation_string(1000)).equals("1e3")
//         expect(convert_result_to_expectation_string(-999.0001)).equals("-1000")
//         expect(convert_result_to_expectation_string(0.314159)).equals("0.31")
//         expect(convert_result_to_expectation_string(0.0314159)).equals("0.031")
//         expect(convert_result_to_expectation_string(0.00314159)).equals("3.1e-3")
//     })

//     it("returns range for array of numbers within tolerance", () =>
//     {
//         expect(convert_result_to_expectation_string([1, 1.005, 1.10001, 1.0009], 2)).equals("[1, 1, 1.1, 1]")
//         expect(convert_result_to_expectation_string([100, 100.0001, 100.0002], 1e-3)).equals("[100, 100, 100]")
//         expect(convert_result_to_expectation_string([0.001, 0.01, 100, 1000], 1e-3)).equals("[1e-3, 0.01, 100, 1e3]")
//     })
// })
