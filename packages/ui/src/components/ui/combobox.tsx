"use client";

import { SearchableSelect } from "./searchable-select";
import type {
  SearchableSelectOption,
  SearchableSelectProps,
} from "./searchable-select";

type ComboboxOption = SearchableSelectOption;
type ComboboxProps = SearchableSelectProps;

function Combobox(props: ComboboxProps) {
  return <SearchableSelect {...props} />;
}

export { Combobox };
export type { ComboboxOption, ComboboxProps };
