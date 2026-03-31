import { GenericDOMParser } from "../../rich_text/generic_interface"
import { shared_get_referenced_ids_from_tiptap } from "../../rich_text/shared_get_referenced_ids_from_tiptap"
import { IdAndMaybeVersion, IdAndVersion } from "../id"
import { DataComponent, DataComponentsById } from "../interface"


/**
 * These may all be the same or all be different.
 *
 * @property id_of_concepts is the entry point to the knowledge graph, from which all
 * the concepts can be reached.  Typically this is the top level component, the
 * narrative, the summary of the graph, or the most general perspective.
 * For example like: [https://wikisim.org/wiki/1239](National energy budget for UK)
 * Defaults to id_of_interest if not provided.
 *
 * @property id_of_interest is the entry point to the knowledge graph containing
 * the data of interest, e.g. [https://wikisim.org/wiki/1239](National energy budget for UK according to Sustainable Energy Without the Hot Air, 2009, Prof. Mackay)
 * Required
 *
 * @property id_of_comparison is the entry point to the knowledge graph containing
 * the data to compare to.  For example this might in the future be "National energy budget for UK according to XYZ political party)
 * Defaults to id_of_concepts if not provided, or id_of_interest if id_of_concepts is not provided.
 *
 * TODO convert these ids back into strings to allow for versioning, i.e. allow
 * for "123v10" instead of just 123.
 */
export interface KnowledgeGraphIds
{
    id_of_interest: number
    id_of_concepts?: number
    // TODO, change this to a list
    id_of_comparison?: number
}

export interface Graph
{
    top_level_id: number
    map_concept_id_to_id_of_interest: Record<number, number>
    nodes: { [id: string]: GraphNode }
}

export interface GraphNode
{
    component: DataComponent
    children: IdAndVersion[]
    alternatives?: number[]
}


export function make_graph(parser: GenericDOMParser, data_map: DataComponentsById, ids: KnowledgeGraphIds): Graph
{
    const { id_of_interest, id_of_concepts = id_of_interest, id_of_comparison } = ids

    const concept_graph = make_graph_inner(parser, data_map, id_of_concepts)

    const graph_of_interest = (id_of_interest === id_of_concepts)
        ? concept_graph
        : make_graph_inner(parser, data_map, id_of_interest)

    mutate_graph_of_interest_with_mapping_from_concept_to_node_ids({ graph_of_interest, concept_graph })

    if (!id_of_comparison)
    {
        return graph_of_interest
    }

    console.log(`id_of_comparison: ${id_of_comparison}`)

    const comparison_graph = (id_of_comparison === id_of_concepts)
        ? concept_graph
        : (id_of_comparison === id_of_interest)
            ? graph_of_interest
            : make_graph_inner(parser, data_map, id_of_comparison)

    mutate_graph_of_interest_with_alternatives({ graph_of_interest, comparison_graph })

    return graph_of_interest
}


function make_graph_inner(parser: GenericDOMParser, data_map: DataComponentsById, top_level_id: number): Graph
{
    const top_level_component = data_map[top_level_id]
    if (!top_level_component) throw new Error(`Top level component with id ${top_level_id} not found`)

    const graph: Graph = {
        map_concept_id_to_id_of_interest: {},
        top_level_id,
        nodes: {},
    }

    function make_graph_recursive(component: DataComponent): IdAndVersion
    {
        if (graph.nodes[component.id.to_str()]) return component.id

        const direct_dependency_ids = shared_get_referenced_ids_from_tiptap(parser, component.input_value || "")
        const children = direct_dependency_ids
            .map(id => data_map[id.to_str()])
            .filter((c): c is DataComponent => !!c)
            .map(make_graph_recursive)

        if (graph.nodes[component.id.id])
        {
            throw new Error(`Multiple versions of component with id ${component.id.id} found in data. Please ensure only the latest version is included. Found versions: ${graph.nodes[component.id.id]!.component.id.to_str()} and ${component.id.to_str()}`)
        }

        graph.nodes[component.id.id] = {
            component,
            children,
        }

        graph.nodes[component.id.to_str()] = {
            component,
            children,
        }

        return component.id
    }

    make_graph_recursive(top_level_component)

    make_ids_unique(graph)

    return graph
}


function mutate_graph_of_interest_with_mapping_from_concept_to_node_ids(args: { graph_of_interest: Graph, concept_graph: Graph }): undefined
{
    const { graph_of_interest, concept_graph } = args

    const map_concept_id_to_node_id: Record<number, number> = {}

    // First load up the default mapping from concept ids to themselves
    Object.values(concept_graph.nodes).forEach(node =>
    {
        map_concept_id_to_node_id[node.component.id.id] = node.component.id.id
    })

    // Now go through graph_of_interest and if any nodes have a subject_id,
    // use that to match back to them
    Object.values(graph_of_interest.nodes).forEach(node =>
    {
        const subject_id = node.component.subject_id
        if (!subject_id) return
        map_concept_id_to_node_id[subject_id] = node.component.id.id
    })

    graph_of_interest.map_concept_id_to_id_of_interest = map_concept_id_to_node_id
}


function mutate_graph_of_interest_with_alternatives(args: { graph_of_interest: Graph, comparison_graph: Graph }): undefined
{
    const { graph_of_interest, comparison_graph } = args

    // Are there any nodes in graph_of_interest who reference the base through
    // component.subject_id?  If so add the nodes from the base as alternatives
    // to these nodes
    Object.values(graph_of_interest.nodes).forEach(node =>
    {
        const subject_id = node.component.subject_id
        if (!subject_id) return

        const base_node = comparison_graph.nodes[subject_id]
        if (!base_node) return

        node.alternatives = node.alternatives || []
        node.alternatives.push(base_node.component.id.id)
    })

    // Are there any nodes in the comparison_graph which have component.subject_id
    // referencing nodes in the graph_of_interest? If so add these nodes from the
    // base as alternatives to the nodes in the graph_of_interest
    const map_subject_id_from_base_to_base_node_id: Record<number, number> = {}

    Object.values(comparison_graph.nodes).forEach(node =>
    {
        const subject_id = node.component.subject_id
        if (!subject_id) return

        map_subject_id_from_base_to_base_node_id[subject_id] = node.component.id.id
    })

    Object.values(graph_of_interest.nodes).forEach(node =>
    {
        const base_node_id = map_subject_id_from_base_to_base_node_id[node.component.id.id]
        if (!base_node_id) return

        const base_node = comparison_graph.nodes[base_node_id.toString()]
        if (!base_node) return

        node.alternatives = node.alternatives || []
        node.alternatives.push(base_node.component.id.id)
    })

    make_ids_unique(graph_of_interest)

    ensure_all_references_ids_are_in_graph({ graph_of_interest, comparison_graph })
}


function make_ids_unique(graph: Graph): void
{
    // Make ids unique
    Object.values(graph.nodes).forEach(node =>
    {
        node.children = Array.from(new Set(node.children))
        node.alternatives = node.alternatives && Array.from(new Set(node.alternatives))
    })
}


function ensure_all_references_ids_are_in_graph(args: { graph_of_interest: Graph, comparison_graph: Graph }): void
{
    const { graph_of_interest, comparison_graph } = args

    const missing_ids = new Set<string>()

    function check_id(id: IdAndMaybeVersion | number)
    {
        const id_is_number = typeof id === "number"
        const id_without_version = id_is_number ? id.toString() : id.to_str_without_version()

        if (!graph_of_interest.nodes[id_without_version])
        {
            missing_ids.add(id_without_version)
        }

        if (!id_is_number && id.has_version() && !graph_of_interest.nodes[id.to_str()])
        {
            missing_ids.add(id.to_str())
        }
    }

    Object.values(graph_of_interest.nodes).forEach(node =>
    {
        node.children.forEach(check_id)
        node.alternatives?.forEach(check_id)
    })

    // Now copy over any missing ids from the base graph
    missing_ids.forEach(id =>
    {
        const base_node = comparison_graph.nodes[id]
        if (!base_node) return console.error(`Id ${id} is missing from graph of interest and not found in comparison_graph`)

        graph_of_interest.nodes[id] = base_node
    })
}
