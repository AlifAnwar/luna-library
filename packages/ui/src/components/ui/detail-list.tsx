import * as React from "react";
import { cn } from "../../lib/utils";

type DetailListColumns = 1 | 2 | 3;
type DetailListDensity = "default" | "compact";

type DetailListProps = React.ComponentProps<"dl"> & {
  /** Maximum column count once the list has enough inline space. */
  columns?: DetailListColumns;
  density?: DetailListDensity;
};

const detailListColumnClasses: Record<DetailListColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 @min-[32rem]/detail-list:grid-cols-2",
  3: "grid-cols-1 @min-[32rem]/detail-list:grid-cols-2 @min-[52rem]/detail-list:grid-cols-3",
};

function DetailList({
  className,
  columns = 2,
  density = "default",
  ...props
}: DetailListProps) {
  return (
    <div
      data-slot="detail-list-container"
      className="@container/detail-list min-w-0"
    >
      <dl
        data-slot="detail-list"
        data-columns={columns}
        data-density={density}
        className={cn(
          "grid min-w-0 gap-x-6 data-[density=compact]:gap-y-3 data-[density=default]:gap-y-5",
          detailListColumnClasses[columns],
          className,
        )}
        {...props}
      />
    </div>
  );
}

type DetailFieldProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode;
  children?: React.ReactNode;
  /** Copy shown when children is null, undefined, false, or an empty string. */
  emptyValue?: React.ReactNode;
  span?: "auto" | "full";
};

function DetailField({
  children,
  className,
  emptyValue = "Not provided",
  label,
  span = "auto",
  ...props
}: DetailFieldProps) {
  const empty =
    children === null ||
    children === undefined ||
    children === false ||
    children === "";

  return (
    <div
      data-slot="detail-field"
      data-empty={empty || undefined}
      data-span={span}
      className={cn(
        "grid min-w-0 gap-1 data-[span=full]:col-span-full",
        className,
      )}
      {...props}
    >
      <dt className="break-words text-label font-medium text-foreground-secondary">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-body text-foreground [overflow-wrap:anywhere]">
        {empty ? (
          <span
            data-slot="detail-field-empty"
            className="text-muted-foreground"
          >
            {emptyValue}
          </span>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}

export {
  DetailField,
  DetailList,
  type DetailFieldProps,
  type DetailListColumns,
  type DetailListDensity,
  type DetailListProps,
};
