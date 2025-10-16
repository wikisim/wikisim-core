import { expect } from "chai"

import { IdAndVersion } from "./id"
import { init_data_component } from "./modify"
import { to_javascript_identifier } from "./to_javascript_identifier"


describe("to_javascript_identifier", function ()
{
    it("should return a javascript safe id", function ()
    {
        const component = init_data_component({
            id: new IdAndVersion(101, 2),
            title: `  My Component ,./<>?;'\\:"|[]{}!@£#$%^&*()-=_+\`~ with_spaces`,
        })

        expect(to_javascript_identifier(component)).equals("My_Component_with_spaces")
    })


    it("should limit the title to 30 characters", function ()
    {
        const component = init_data_component({
            id: new IdAndVersion(101, 2),
            title: `  My Component ,./<>?;'\\:"|[]{}!@£#$%^&*()-=_+\`~ with_spaces25272931`,
        })

        expect(to_javascript_identifier(component)).equals("My_Component_with_spaces252729")
    })


    it("should trim leading and trailing underscores", function ()
    {
        const component = init_data_component({
            id: new IdAndVersion(101, 2),
            title: `  My Component  `,
        })

        expect(to_javascript_identifier(component)).equals("My_Component")
    })


    it("should ignore effectively empty titles", function ()
    {
        const component = init_data_component({
            id: new IdAndVersion(101, 2),
            title: `  ,./<>   `,
        })

        expect(to_javascript_identifier(component)).equals("d101v2")
    })
})
