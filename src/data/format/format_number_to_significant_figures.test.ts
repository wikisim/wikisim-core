import { expect } from "chai"

import { format_number_to_scientific_notation, format_number_to_significant_figures } from "./format_number_to_significant_figures"



describe("format_number_to_significant_figures", () =>
{
    let formatted_number = ""

    formatted_number = format_number_to_significant_figures(0, 2)
    it("should handle zero", () =>
    {
        expect(formatted_number).equals("0")
    })


    it("Positive numbers with different significant figures", () =>
    {
        formatted_number = format_number_to_significant_figures(2700000, 2)
        expect(formatted_number).equals("2700000", "2.7 million to 2 sf")

        formatted_number = format_number_to_significant_figures(27000000, 2)
        expect(formatted_number).equals("27000000", "27 million to 2 sf")

        formatted_number = format_number_to_significant_figures(270000000, 2)
        expect(formatted_number).equals("270000000", "270 million to 2 sf")

        formatted_number = format_number_to_significant_figures(270000000.2, 2)
        expect(formatted_number).equals("270000000", "270.2 million to 2 sf")
    })


    it("Positive with decimals numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(27, 5, false)
        expect(formatted_number).equals("27.000", "27 to 5 sf, don't trim trailing zeros")

        formatted_number = format_number_to_significant_figures(27, 5)
        expect(formatted_number).equals("27", "27 to 5 sf")

        formatted_number = format_number_to_significant_figures(270000000.2, 10)
        expect(formatted_number).equals("270000000.2", "270.2 million to 10 sf")

        formatted_number = format_number_to_significant_figures(270000000.2, 11, false)
        expect(formatted_number).equals("270000000.20", "270.2 million to 11 sf, don't trim trailing zeros")

        formatted_number = format_number_to_significant_figures(270000000.2, 11)
        expect(formatted_number).equals("270000000.2", "270.2 million to 11 sf")
    })


    it("Negative numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(-27, 5)
        expect(formatted_number).equals("-27", "-27 to 5 sf")

        formatted_number = format_number_to_significant_figures(-270000000.2, 11)
        expect(formatted_number).equals("-270000000.2", "-270.0000002 million to 11 sf")

        formatted_number = format_number_to_significant_figures(-270000000.2, 2)
        expect(formatted_number).equals("-270000000", "-270.0000002 million to 2 sf")
    })


    it("Small numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(0.0001236, 3)
        expect(formatted_number).equals("0.000124", "0.0001236 to 3 sf")

        formatted_number = format_number_to_significant_figures(0.0001236, 5)
        expect(formatted_number).equals("0.0001236", "0.0001236 to 5 sf")

        formatted_number = format_number_to_significant_figures(-0.0001236, 3)
        expect(formatted_number).equals("-0.000124", "-0.0001236 to 3 sf")

        formatted_number = format_number_to_significant_figures(-0.0001236, 5)
        expect(formatted_number).equals("-0.0001236", "-0.0001236 to 5 sf")
    })


    it("Floating point precision numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(0.01264, 2)
        expect(formatted_number).equals("0.013", "0.01264 to 2 sf, tests when floating point precision results in 0.013000000000000001")

        formatted_number = format_number_to_significant_figures(17.955*100, 7)
        expect(formatted_number).equals("1795.5", "17.955*100 to 7 sf, tests when floating point precision results in 1795.4999999999998")

        formatted_number = format_number_to_significant_figures(0.0314159, 3)
        expect(formatted_number).equals("0.0314", "0.0314159 to 3 sf")

        formatted_number = format_number_to_significant_figures(0.00314159, 3)
        expect(formatted_number).equals("0.00314", "0.00314159 to 3 sf")
    })

    it("Trim trailing zeros option", () =>
    {
        formatted_number = format_number_to_significant_figures(27, 5, true)
        expect(formatted_number).equals("27", "27 to 5 sf with trim_trailing_zeros true")

        formatted_number = format_number_to_significant_figures(27.02, 5, true)
        expect(formatted_number).equals("27.02", "27.02 to 5 sf with trim_trailing_zeros true")

        formatted_number = format_number_to_significant_figures(27.202, 6, true)
        expect(formatted_number).equals("27.202", "27.202 to 6 sf with trim_trailing_zeros true")
    })
})


describe("format_number_to_scientific_notation", () =>
{
    let formatted_number = ""

    formatted_number = format_number_to_significant_figures(0, 2)
    it("should handle zero", () =>
    {
        expect(formatted_number).equals("0")
    })

    it("Positive numbers with different significant figures", () =>
    {
        formatted_number = format_number_to_scientific_notation(2700000, 2)
        expect(formatted_number).equals("2.7e6", "2.7 million to 2 sf")

        formatted_number = format_number_to_scientific_notation(27000000, 2)
        expect(formatted_number).equals("2.7e7", "27 million to 2 sf")

        formatted_number = format_number_to_scientific_notation(270000000, 2)
        expect(formatted_number).equals("2.7e8", "270 million to 2 sf")

        formatted_number = format_number_to_scientific_notation(270000000.2, 2)
        expect(formatted_number).equals("2.7e8", "270.2 million to 2 sf")
    })

    it("Positive with decimals numbers", () =>
    {
        formatted_number = format_number_to_scientific_notation(27, 5, false)
        expect(formatted_number).equals("2.7000e1", "27 to 5 sf")

        formatted_number = format_number_to_scientific_notation(27, 5)
        expect(formatted_number).equals("2.7e1", "27 to 5 sf")

        formatted_number = format_number_to_scientific_notation(270000000.2, 10)
        expect(formatted_number).equals("2.700000002e8", "270.2 million to 10 sf")

        formatted_number = format_number_to_scientific_notation(270000000.2, 11, false)
        expect(formatted_number).equals("2.7000000020e8", "270.2 million to 11 sf")

        formatted_number = format_number_to_scientific_notation(270000000.2, 11)
        expect(formatted_number).equals("2.700000002e8", "270.2 million to 11 sf")
    })

    it("Negative numbers", () =>
    {
        formatted_number = format_number_to_scientific_notation(-27, 5)
        expect(formatted_number).equals("-2.7e1", "-27 to 5 sf")

        formatted_number = format_number_to_scientific_notation(-270000000.2, 11)
        expect(formatted_number).equals("-2.700000002e8", "-270.0000002 million to 11 sf")

        formatted_number = format_number_to_scientific_notation(-270000000.2, 2)
        expect(formatted_number).equals("-2.7e8", "-270.0000002 million to 2 sf")
    })

    it("Small numbers", () =>
    {
        formatted_number = format_number_to_scientific_notation(0.0001236, 3)
        expect(formatted_number).equals("1.24e-4", "0.0001236 to 3 sf")

        formatted_number = format_number_to_scientific_notation(0.0001236, 5)
        expect(formatted_number).equals("1.236e-4", "0.0001236 to 5 sf")

        formatted_number = format_number_to_scientific_notation(-0.0001236, 3)
        expect(formatted_number).equals("-1.24e-4", "-0.0001236 to 3 sf")

        formatted_number = format_number_to_scientific_notation(-0.0001236, 5)
        expect(formatted_number).equals("-1.236e-4", "-0.0001236 to 5 sf")
    })

    it("Floating point precision numbers", () =>
    {
        formatted_number = format_number_to_scientific_notation(0.01264, 2)
        expect(formatted_number).equals("1.3e-2", "0.01264 to 2 sf, tests when floating point precision results in 0.013000000000000001")

        formatted_number = format_number_to_scientific_notation(17.955*100, 7)
        expect(formatted_number).equals("1.7955e3", "17.955*100 to 7 sf, tests when floating point precision results in 1795.4999999999998")

        formatted_number = format_number_to_scientific_notation(0.0314159, 3)
        expect(formatted_number).equals("3.14e-2", "0.0314159 to 3 sf")

        formatted_number = format_number_to_scientific_notation(0.00314159, 3)
        expect(formatted_number).equals("3.14e-3", "0.00314159 to 3 sf")
    })

    it("Trim trailing zeros option", () =>
    {
        formatted_number = format_number_to_significant_figures(27, 5, true)
        expect(formatted_number).equals("27", "27 to 5 sf with trim_trailing_zeros true")

        formatted_number = format_number_to_significant_figures(27.02, 5, true)
        expect(formatted_number).equals("27.02", "27.02 to 5 sf with trim_trailing_zeros true")

        formatted_number = format_number_to_significant_figures(27.202, 6, true)
        expect(formatted_number).equals("27.202", "27.202 to 6 sf with trim_trailing_zeros true")
    })
})
