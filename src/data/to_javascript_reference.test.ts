// Commenting out, not deleted, because I think we might go back to using this
// in the future as it aids in debugging scripts by including their
// human-readable titles


// import { expect } from "chai"

// import { IdAndVersion } from "./id"
// import { init_data_component } from "./modify"
// import { to_javascript_reference } from "./to_javascript_reference"


// describe("to_javascript_reference", function ()
// {
//     it("should return a javascript safe id", function ()
//     {
//         const component = init_data_component({
//             id: new IdAndVersion(101, 2),
//             title: `  My Component ,./<>?;'\\:"|[]{}!@£#$%^&*()-=_+\`~ with_spaces`,
//         })

//         expect(to_javascript_reference(component)).equals("d101v2_my_component_with_spaces")
//     })


//     it("should limit the title to 30 characters", function ()
//     {
//         const component = init_data_component({
//             id: new IdAndVersion(101, 2),
//             title: `  My Component ,./<>?;'\\:"|[]{}!@£#$%^&*()-=_+\`~ with_spaces25272931`,
//         })

//         expect(to_javascript_reference(component)).equals("d101v2_my_component_with_spaces252729")
//     })


//     it("should ignore effectively empty titles", function ()
//     {
//         const component = init_data_component({
//             id: new IdAndVersion(101, 2),
//             title: `  ,./<>   `,
//         })

//         expect(to_javascript_reference(component)).equals("d101v2")
//     })
// })
