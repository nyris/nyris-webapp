import { atom } from 'jotai'
import { freezeAtom } from 'jotai/utils'
import { Refinement, RefinementLayout } from './refinements-type'

export type Config = typeof config

const refinementsLayoutAtom = atom<RefinementLayout>('panel')

const refinements: Refinement[] = [
  {
    type: 'list',
    header: 'Brands',
    label: 'Brand',
    options: {
      searchable: false,
      attribute: 'brand',
    },
  },
  {
    type: 'list',
    header: 'Category',
    label: 'Category',
    options: {
      searchable: false,
      attribute: 'keyword_0',
    },
  },
]

const searchParameters = {
  hitsPerPage: 10,
  maxValuesPerFacet: 50,
  attributesToSnippet: ['description:60'],
  snippetEllipsisText: '…',
  analytics: true,
  clickAnalytics: true,
}

const url = {
  debouncing: 1500, // in ms
}

const config = {
  refinementsLayoutAtom,
  refinements,
  searchParameters,
  url,
}

export const configAtom = freezeAtom(atom(() => config))
