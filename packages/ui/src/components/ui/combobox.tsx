"use client";

import { SearchableSelect } from "./searchable-select.js";
import type {
  SearchableSelectOption,
  SearchableSelectProps,
} from "./searchable-select.js";

type ComboboxOption = SearchableSelectOption;
type ComboboxProps = SearchableSelectProps;

function Combobox(props: ComboboxProps) {
  return <SearchableSelect {...props} />;
}

export { Combobox };
export type { ComboboxOption, ComboboxProps };
