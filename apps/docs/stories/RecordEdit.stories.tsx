import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@withalif/luna";

type RecordEditProps = {
  constrained?: boolean;
  initialErrors?: boolean;
  saving?: boolean;
};

type RequiredField =
  "organizationName" | "organizationType" | "contactName" | "email";

type FormErrors = Partial<Record<RequiredField, string>>;

const organizationTypes = {
  private: "Private company",
  nonprofit: "Nonprofit",
  public: "Public institution",
};

function FormCard({
  children,
  description,
  id,
  title,
}: {
  children: React.ReactNode;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={id} className="min-w-0">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>
            <h2 id={id} className="break-words text-balance">
              {title}
            </h2>
          </CardTitle>
          <CardDescription className="max-w-2xl break-words text-pretty">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

function RecordEdit({
  constrained = false,
  initialErrors = false,
  saving = false,
}: RecordEditProps) {
  const [name, setName] = React.useState(initialErrors ? "" : "Aster Labs");
  const [organizationType, setOrganizationType] = React.useState(
    initialErrors ? "" : "private",
  );
  const [contactName, setContactName] = React.useState(
    initialErrors ? "" : "Maya Chen",
  );
  const [email, setEmail] = React.useState(
    initialErrors ? "" : "maya.chen@example.com",
  );
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [announcement, setAnnouncement] = React.useState("");

  function clearError(field: RequiredField) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.organizationName = "Enter the registered organization name.";
    }
    if (!organizationType) {
      nextErrors.organizationType = "Select the closest legal classification.";
    }
    if (!contactName.trim()) {
      nextErrors.contactName = "Enter the contact name.";
    }
    if (!email.includes("@")) {
      nextErrors.email =
        "Enter a complete email address monitored by this contact.";
    }

    const firstInvalidField = Object.keys(nextErrors)[0] as
      RequiredField | undefined;

    if (firstInvalidField) {
      setErrors(nextErrors);
      setAnnouncement("Review the highlighted fields.");
      requestAnimationFrame(() => {
        document
          .getElementById(
            {
              organizationName: "organization-name-control",
              organizationType: "organization-type-control",
              contactName: "contact-name-control",
              email: "contact-email-control",
            }[firstInvalidField],
          )
          ?.focus();
      });
      return;
    }

    setErrors({});
    setAnnouncement("Changes saved.");
  }

  const fieldGridClass = constrained
    ? "grid min-w-0 gap-5 [&>*]:min-w-0"
    : "grid min-w-0 gap-5 [&>*]:min-w-0 sm:grid-cols-2";

  return (
    <main
      className={
        constrained
          ? "mx-auto grid w-80 max-w-full min-w-0 gap-6 bg-background p-4 text-foreground"
          : "mx-auto grid w-full max-w-4xl min-w-0 gap-6 bg-background p-4 text-foreground sm:p-6"
      }
    >
      <PageHeader className="min-w-0 pb-0">
        <PageHeaderContent className="min-w-0">
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="min-w-0">
              <BreadcrumbItem>
                <BreadcrumbLink href="#organizations">
                  Organizations
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#aster-labs">Aster Labs</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageHeaderHeading className="break-words text-balance">
            Edit organization
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-2xl break-words text-pretty">
            Update profile and contact information. Fields marked with an
            asterisk are required.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      <form className="grid min-w-0 gap-6" noValidate onSubmit={handleSubmit}>
        <FormCard
          id="profile-form-heading"
          title="Organization profile"
          description="Information used to identify and classify this organization."
        >
          <div className={fieldGridClass}>
            <FormField
              id="organization-name"
              required
              invalid={Boolean(errors.organizationName)}
            >
              <FormLabel>Organization name</FormLabel>
              <FormControl>
                <Input
                  name="organizationName"
                  autoComplete="organization"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError("organizationName");
                  }}
                />
              </FormControl>
              {errors.organizationName ? (
                <FormMessage role="none">{errors.organizationName}</FormMessage>
              ) : (
                <FormDescription>
                  Use the registered organization name.
                </FormDescription>
              )}
            </FormField>

            <FormField id="organization-id" disabled>
              <FormLabel>Organization ID</FormLabel>
              <FormControl>
                <Input name="organizationId" value="ORG-1042" readOnly />
              </FormControl>
              <FormDescription>
                This identifier cannot be edited.
              </FormDescription>
            </FormField>

            <FormField
              id="organization-type"
              required
              invalid={Boolean(errors.organizationType)}
            >
              <FormLabel>Organization type</FormLabel>
              <Select
                items={organizationTypes}
                name="organizationType"
                value={organizationType || null}
                onValueChange={(value) => {
                  setOrganizationType(value ?? "");
                  clearError("organizationType");
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private company</SelectItem>
                  <SelectItem value="nonprofit">Nonprofit</SelectItem>
                  <SelectItem value="public">Public institution</SelectItem>
                </SelectContent>
              </Select>
              {errors.organizationType ? (
                <FormMessage role="none">{errors.organizationType}</FormMessage>
              ) : (
                <FormDescription>
                  Choose the closest legal classification.
                </FormDescription>
              )}
            </FormField>

            <FormField id="external-reference">
              <FormLabel>External reference</FormLabel>
              <FormControl>
                <Input name="externalReference" defaultValue="EXT-48219" />
              </FormControl>
              <FormDescription>
                Optional identifier from another system.
              </FormDescription>
            </FormField>

            <FormField id="organization-summary" className="sm:col-span-2">
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea
                  name="summary"
                  defaultValue="Research and operations partner for regional programs."
                />
              </FormControl>
              <FormDescription>
                Summarize the relationship in one or two sentences.
              </FormDescription>
            </FormField>
          </div>
        </FormCard>

        <FormCard
          id="contact-form-heading"
          title="Primary contact"
          description="Contact details used for routine account communication."
        >
          <div className={fieldGridClass}>
            <FormField
              id="contact-name"
              required
              invalid={Boolean(errors.contactName)}
            >
              <FormLabel>Contact name</FormLabel>
              <FormControl>
                <Input
                  name="contactName"
                  autoComplete="name"
                  value={contactName}
                  onChange={(event) => {
                    setContactName(event.target.value);
                    clearError("contactName");
                  }}
                />
              </FormControl>
              <FormMessage role="none">{errors.contactName}</FormMessage>
            </FormField>

            <FormField id="contact-role">
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input
                  name="contactRole"
                  autoComplete="organization-title"
                  defaultValue="Operations director"
                />
              </FormControl>
            </FormField>

            <FormField
              id="contact-email"
              required
              invalid={Boolean(errors.email)}
            >
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                />
              </FormControl>
              {errors.email ? (
                <FormMessage role="none">{errors.email}</FormMessage>
              ) : (
                <FormDescription>
                  Use an address monitored by the contact.
                </FormDescription>
              )}
            </FormField>

            <FormField id="contact-phone">
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  defaultValue="+62 21 555 0148"
                />
              </FormControl>
            </FormField>

            <FormField id="contact-updates" className="sm:col-span-2">
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox defaultChecked />
                </FormControl>
                <div className="grid min-w-0 gap-1">
                  <FormLabel>Send record updates</FormLabel>
                  <FormDescription>
                    Notify this contact when profile information changes.
                  </FormDescription>
                </div>
              </div>
            </FormField>
          </div>
        </FormCard>

        <div
          data-slot="form-actions"
          className={
            constrained
              ? "flex flex-col gap-3"
              : "flex flex-col gap-3 sm:flex-row sm:justify-end"
          }
        >
          <Button
            type="button"
            variant="outline"
            className={constrained ? "w-full" : undefined}
            onClick={() => setAnnouncement("Edit cancelled.")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={saving}
            className={constrained ? "w-full" : undefined}
          >
            Save changes
          </Button>
        </div>
      </form>
    </main>
  );
}

const meta = {
  title: "Patterns/Record Edit",
  component: RecordEdit,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof RecordEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Edit organization" }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Changes saved.",
    );
  },
};

export const ValidationErrors: Story = {
  args: { initialErrors: true },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: /Organization name/ });
    const organizationType = canvas.getByRole("combobox", {
      name: /Organization type/,
    });
    const contactName = canvas.getByRole("textbox", { name: /Contact name/ });
    const email = canvas.getByRole("textbox", { name: /Email address/ });

    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));

    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription(
      "Enter the registered organization name.",
    );
    await expect(
      canvas.queryByText("Use the registered organization name."),
    ).not.toBeInTheDocument();
    await expect(organizationType).toHaveAttribute("aria-invalid", "true");
    await expect(organizationType).toHaveAccessibleDescription(
      "Select the closest legal classification.",
    );
    await expect(
      canvas.queryByText("Choose the closest legal classification."),
    ).not.toBeInTheDocument();
    await expect(contactName).toHaveAttribute("aria-invalid", "true");
    await expect(contactName).toHaveAccessibleDescription(
      "Enter the contact name.",
    );
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAccessibleDescription(
      "Enter a complete email address monitored by this contact.",
    );
    await expect(
      canvas.queryByText("Use an address monitored by the contact."),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Review the highlighted fields.",
    );
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await waitFor(() => expect(name).toHaveFocus());

    await userEvent.type(name, "A");
    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription(
      "Use the registered organization name.",
    );
  },
};

export const SavePending: Story = {
  args: { saving: true },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const save = within(canvasElement).getByRole("button", {
      name: "Save changes",
    });
    await expect(save).toBeDisabled();
    await expect(save).toHaveAttribute("aria-busy", "true");
  },
};

export const NarrowViewport: Story = {
  args: { constrained: true },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const main = canvasElement.querySelector("main");
    await expect(main).not.toBeNull();
    await expect(main!.scrollWidth).toBeLessThanOrEqual(main!.clientWidth);
    await expect(canvas.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Save changes" }),
    ).toBeVisible();
  },
};
