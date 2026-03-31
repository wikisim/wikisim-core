import { expect } from "chai"
import * as z from "zod"

import { tiptap_mention_chip } from "../../rich_text/tiptap_mention_chip"
import { flatten_data_component_to_json, hydrate_data_component_from_json } from "../convert_between_json"
import { IdAndVersion } from "../id"
import { DataComponentsById } from "../interface"
import { init_data_component } from "../modify"
import { make_field_validators } from "../validate_fields"
import { data_components_by_id } from "./data_components_by_id"
import { Graph, make_graph } from "./graph"


describe("graph", () =>
{
    const parser = new DOMParser()

    const data = [
        init_data_component({ id: IdAndVersion.from_str("1v1"), title: "A value" }),
        init_data_component({ id: IdAndVersion.from_str("2v1"), title: "A top plan", input_value: `${tiptap_mention_chip("1v1")} + 2` }),
        init_data_component({ id: IdAndVersion.from_str("3v1"), title: "An author" }),
        init_data_component({ id: IdAndVersion.from_str("4v1"), title: "An alternative value", subject_id: 1, according_to_id: 3 }),
        init_data_component({ id: IdAndVersion.from_str("5v1"), title: "An alternative plan", input_value: `${tiptap_mention_chip("4v1")} + 3`, subject_id: 2, according_to_id: 3 }),
    ].map(flatten_data_component_to_json)
    const field_validators = make_field_validators(z)
    const components = data.map(d => hydrate_data_component_from_json(d, field_validators))
    const data_map: DataComponentsById = data_components_by_id(components)

    it("makes a graph from a list of components and id_of_interest and ignores data from other graph", () =>
    {
        const graph = make_graph(parser, data_map, { id_of_interest: 2 })
        const minimised = minimise_graph(graph)

        expect(minimised.map_concept_ids).deep.equals({
            1: 1,
            2: 2,
        })

        expect(minimised.nodes).deep.equals({
            "1": {
                title: "A value",
                children: [],
            },
            "1v1": {
                title: "A value",
                children: [],
            },
            "2": {
                title: "A top plan",
                children: ["1v1"],
            },
            "2v1": {
                title: "A top plan",
                children: ["1v1"],
            },
        })
    })


    it("makes a graph from a id_of_interest and includes its subject_ids referencing the id_of_concepts", () =>
    {
        const graph = make_graph(parser, data_map, { id_of_interest: 5, id_of_concepts: 2 })

        const minimised = minimise_graph(graph)

        expect(minimised.map_concept_ids).deep.equals({
            1: 4,
            2: 5,
        })

        expect(minimised.nodes).deep.equals({
            "4": {
                title: "An alternative value",
                children: [],
            },
            "4v1": {
                title: "An alternative value",
                children: [],
            },
            "5": {
                title: "An alternative plan",
                children: ["4v1"],
            },
            "5v1": {
                title: "An alternative plan",
                children: ["4v1"],
            },
        })
    })


    it("makes a graph from a id_of_interest and includes its subject_ids referencing the id_of_concepts", () =>
    {
        const graph = make_graph(parser, data_map, { id_of_interest: 2, id_of_comparison: 5 })

        const minimised = minimise_graph(graph)

        expect(minimised.map_concept_ids).deep.equals({
            1: 1,
            2: 2,
        })

        expect(minimised.nodes).deep.equals({
            "1": {
                title: "A value",
                children: [],
                alternatives: [4],
            },
            "1v1": {
                title: "A value",
                children: [],
                alternatives: [4],
            },
            "2": {
                title: "A top plan",
                children: ["1v1"],
                alternatives: [5],
            },
            "2v1": {
                title: "A top plan",
                children: ["1v1"],
                alternatives: [5],
            },

            // referenced alternatives
            "4": {
                title: "An alternative value",
                children: [],
            },
            "5": {
                title: "An alternative plan",
                children: ["4v1"],
            },
        })
    })
})


function minimise_graph(graph: Graph)
{
    const minimised: Record<string, { title: string, children: string[], alternatives?: number[] }> = {}
    for (const [id, node] of Object.entries(graph.nodes))
    {
        minimised[id] = {
            title: node.component.title,
            children: node.children.map(c => c.to_str()),
        }
        if (node.alternatives) minimised[id].alternatives = node.alternatives
    }

    return {
        map_concept_ids: graph.map_concept_id_to_id_of_interest,
        nodes: minimised,
    }
}
