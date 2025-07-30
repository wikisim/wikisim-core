import { expect } from "chai"

import { format_number_to_significant_figures } from "./format_number_to_significant_figures"



describe("run_number_to_significant_figures", () =>
{
    let formatted_number = ""

    formatted_number = format_number_to_significant_figures(0, 2)
    describe("should handle zero", () =>
    {
        expect(formatted_number).equals("0")
    })


    describe("Positive numbers with different significant figures", () =>
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


    describe("Positive with decimals numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(27, 5)
        expect(formatted_number).equals("27.000", "27 to 5 sf")

        formatted_number = format_number_to_significant_figures(270000000.2, 10)
        expect(formatted_number).equals("270000000.2", "270.2 million to 10 sf")

        formatted_number = format_number_to_significant_figures(270000000.2, 11)
        expect(formatted_number).equals("270000000.20", "270.2 million to 11 sf")
    })


    describe("Negative numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(-27, 5)
        expect(formatted_number).equals("-27.000", "-27 to 5 sf")

        formatted_number = format_number_to_significant_figures(-270000000.2, 11)
        expect(formatted_number).equals("-270000000.20", "-270.0000002 million to 11 sf")

        formatted_number = format_number_to_significant_figures(-270000000.2, 2)
        expect(formatted_number).equals("-270000000", "-270.0000002 million to 2 sf")
    })


    describe("Small numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(0.0001236, 3)
        expect(formatted_number).equals("0.000124", "0.0001236 to 3 sf")

        formatted_number = format_number_to_significant_figures(0.0001236, 5)
        expect(formatted_number).equals("0.00012360", "0.0001236 to 5 sf")

        formatted_number = format_number_to_significant_figures(-0.0001236, 3)
        expect(formatted_number).equals("-0.000124", "-0.0001236 to 3 sf")

        formatted_number = format_number_to_significant_figures(-0.0001236, 5)
        expect(formatted_number).equals("-0.00012360", "-0.0001236 to 5 sf")
    })


    describe("Floating point precision numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(0.01264, 2)
        expect(formatted_number).equals("0.013", "0.01264 to 2 sf, tests when floating point precision results in 0.013000000000000001")

        formatted_number = format_number_to_significant_figures(17.955*100, 7)
        expect(formatted_number).equals("1795.500", "17.955*100 to 7 sf, tests when floating point precision results in 1795.4999999999998")
    })

})
